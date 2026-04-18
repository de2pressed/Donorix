import { NextRequest, NextResponse } from "next/server";

import { getFeedPosts } from "@/lib/data";
import { env } from "@/lib/env";
import { jsonError, requireServerUser } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";
import { canDonateToRecipient, isBloodType, type BloodType } from "@/lib/utils/blood-type";
import { sanitizeText } from "@/lib/utils/sanitize";
import type { CreatePostInput } from "@/lib/validations/post";

import {
  resolveAssistantLanguage,
  getAssistantLanguageName,
  isAssistantReplyStrictlyInLanguage,
  type AssistantLanguage,
} from "@/lib/assistant/language";
import {
  buildConversationTranscript,
  callAssistantOpenAI,
} from "@/lib/assistant/openai";
import {
  extractHospitalDraft,
  isHospitalDraftRequest,
} from "@/lib/assistant/draft";
import {
  ASSISTANT_KNOWLEDGE_CASE_COUNT,
  buildKnowledgePrompt,
  buildKnowledgeFallbackReply,
  getKnowledgeIntentLabel,
  isGreetingMessage,
  matchKnowledgeCases,
  buildGreetingReply,
} from "@/lib/assistant/knowledge";
import { evaluateAssistantSafety } from "@/lib/assistant/safety";
import type {
  ChatbotConversationMessage,
  ChatbotRequestPayload,
  ChatbotResponsePayload,
  EligiblePost,
  Persona,
  HospitalDraftState,
} from "@/lib/assistant/types";

const ASSISTANT_SYSTEM_PROMPT = `You are Donorix Assistant, the help experience for the Donorix blood donation platform in India.
Rules:
- Be friendly, cooperative, and direct.
- Answer the user's actual question first. Do not default to preset replies or quick-action scripts.
- If the user asks a general question, answer it normally even when it is not about Donorix.
- Reply entirely in the user's selected language.
- If the user writes the question in English but has selected another language, still answer in the selected language.
- Do not mix languages unless you are naming a product, hospital, or fixed technical term.
- Use the supplied knowledge brief as background context for Donorix facts, policies, navigation, and support.
- Never invent donor eligibility, hospital details, policy exceptions, or post data.
- Never imply that donor or guest users can create, draft, or publish blood requests.
- For hospital draft flows, ask only for missing fields and switch to audit/review mode once the form is complete.
- If the user needs clarification, ask one short follow-up instead of guessing.
- Be concise, practical, and medically careful.
- Do not provide diagnosis or replace emergency services.
- Treat explicit language as normal unless it is harassment, scams, threats, or repeated flood behavior.`;

const DEFAULT_ASSISTANT_MODELS = [
  env.OPENAI_ASSISTANT_MODEL?.trim(),
  "gpt-5.4",
  "gpt-5.4-pro",
  "gpt-5",
  "gpt-5.1",
].filter((model): model is string => Boolean(model));

type AssistantMode = ChatbotResponsePayload["mode"];
type ChatbotResponse = ChatbotResponsePayload;
type SafetyLockKind = "spam" | "abuse" | "rate_limit" | "generic";

function resolvePersona(requestedPersona: unknown, accountType?: string | null): Persona {
  if (accountType === "hospital") return "hospital";
  if (accountType === "donor") return "donor";
  if (requestedPersona === "hospital" || requestedPersona === "donor" || requestedPersona === "guest") {
    return requestedPersona;
  }

  return "guest";
}

function getGuestReminder(language: AssistantLanguage) {
  if (language === "hi") {
    return "मुफ़्त खाता आपको अधिक tailored help, donor matches, और hospital shortcuts देता है।";
  }

  return "A free account unlocks more tailored help, donor matches, and hospital shortcuts.";
}

function normalizeMessage(message: string) {
  return sanitizeText(message).toLowerCase().replace(/\s+/g, " ").trim();
}

function truncate(value: string, max = 280) {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (normalized.length <= max) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

function buildConversationSummary({
  previousSummary,
  latestMessage,
  reply,
  mode,
  intent,
  draftState,
  language,
}: {
  previousSummary?: string | null;
  latestMessage: string;
  reply: string;
  mode: AssistantMode;
  intent: string | null;
  draftState?: HospitalDraftState | null;
  language: AssistantLanguage;
}) {
  const parts: string[] = [];

  if (previousSummary?.trim()) {
    parts.push(truncate(previousSummary.trim(), 120));
  }

  if (mode === "hospital_draft") {
    const draftBits = [
      draftState?.summary?.trim(),
      draftState?.auditSummary?.trim(),
      draftState?.nextAction ? `next:${draftState.nextAction}` : null,
      draftState?.reviewMode ? `review:${draftState.reviewMode}` : null,
    ]
      .filter((value): value is string => Boolean(value))
      .join(" | ");

    if (draftBits) {
      parts.push(truncate(draftBits, 140));
    }
  } else if (intent) {
    parts.push(truncate(intent, 80));
  }

  const turnSummary = `${truncate(normalizeMessage(latestMessage), 80)} -> ${truncate(
    normalizeMessage(reply),
    100,
  )}`;
  parts.push(turnSummary);

  if (language !== "en") {
    parts.push(`lang:${language}`);
  }

  return truncate(parts.join(" | "), 300);
}

function buildRateLimitIdentifier(sessionId: string, persona: Persona, profileId?: string | null) {
  const base = sessionId.trim() || profileId || "guest";
  return `${base}:${persona}`;
}

function buildLockedResponse({
  language,
  persona,
  intent,
  reasonKind,
  reasonText,
  conversationSummary,
}: {
  language: AssistantLanguage;
  persona: Persona;
  intent: string;
  reasonKind: SafetyLockKind;
  reasonText?: string | null;
  conversationSummary?: string | null;
}): ChatbotResponse {
  const reason =
    reasonText?.trim() ||
    (language === "hi"
      ? reasonKind === "abuse"
        ? "दुर्व्यवहार या धमकी वाला व्यवहार पाया गया।"
        : reasonKind === "spam"
          ? "इस session में दोहराया गया spam पाया गया।"
          : reasonKind === "rate_limit"
            ? "बहुत तेज़ी से संदेश भेजे गए।"
            : "इस chat को इस session के लिए बंद कर दिया गया है।"
      : reasonKind === "abuse"
        ? "Harassment or threat behavior was detected."
        : reasonKind === "spam"
          ? "Repeated spam or flood behavior was detected."
          : reasonKind === "rate_limit"
            ? "Too many messages were sent too quickly."
            : "This chat has been disabled for the current conversation.");

  const reply =
    language === "hi"
      ? `इस conversation के लिए chat disabled कर दिया गया है. ${reason}`
      : `This chat has been disabled for the current conversation. ${reason}`;

  return {
    language,
    languageName: getAssistantLanguageName(language),
    reply,
    persona,
    mode: "general",
    aiActive: false,
    intent,
    chatDisabled: true,
    chatDisabledReason: reason || undefined,
    conversationSummary: conversationSummary?.trim() || undefined,
  };
}

function formatEligiblePostsReply(posts: EligiblePost[], language: AssistantLanguage) {
  const intro =
    language === "hi"
      ? `मुझे ${posts.length} संगत अनुरोध मिले हैं.`
      : `I found ${posts.length} compatible request${posts.length === 1 ? "" : "s"}.`;

  const lines = posts
    .slice(0, 5)
    .map(
      (post, index) =>
        `${index + 1}. ${post.patient_name} - ${post.blood_type_needed} - ${post.hospital_name}, ${post.city}, ${post.state}`,
    );

  return [
    intro,
    ...lines,
    language === "hi" ? "किसी भी कार्ड को खोलें और सीधे जवाब दें." : "Open any card to view the post and respond directly.",
  ].join("\n");
}

function buildEligiblePosts(
  posts: Awaited<ReturnType<typeof getFeedPosts>>,
  donorBloodType: string | null | undefined,
) {
  if (!donorBloodType || !isBloodType(donorBloodType)) {
    return [] as EligiblePost[];
  }

  return posts
    .filter((post) => post.blood_type_needed && isBloodType(post.blood_type_needed))
    .filter((post) => canDonateToRecipient(donorBloodType, post.blood_type_needed as BloodType))
    .slice(0, 5)
    .map((post) => ({
      id: post.id,
      patient_name: post.patient_name,
      blood_type_needed: post.blood_type_needed,
      hospital_name: post.hospital_name,
      city: post.city,
      state: post.state,
      units_needed: post.units_needed,
      required_by: post.required_by ?? null,
      link: `/posts/${post.id}`,
    }));
}

function isEligibilityRequest(message: string) {
  const normalized = normalizeMessage(message);
  return [
    "eligible",
    "eligibility",
    "compatible",
    "compatibility",
    "show posts",
    "find posts",
    "posts i can donate to",
    "eligible to donate",
    "donate to",
    "can i donate",
    "which posts",
  ].some((term) => normalized.includes(term));
}

function buildGeneralFallbackReply({
  message,
  language,
  persona,
  matches,
}: {
  message: string;
  language: AssistantLanguage;
  persona: Persona;
  matches: ReturnType<typeof matchKnowledgeCases>;
}) {
  if (isGreetingMessage(message)) {
    return buildGreetingReply(language);
  }

  if (matches.length) {
    return buildKnowledgeFallbackReply(matches[0], language);
  }

  if (language === "hi") {
    return persona === "hospital"
      ? "मैं अस्पताल के अनुरोध, डोनर पात्रता, नीतियों, और Donorix के सामान्य कामकाज के बारे में मदद कर सकता हूँ।"
      : "मैं डोनर पात्रता, मिलती पोस्ट, नीतियों, और Donorix के सामान्य कामकाज के बारे में मदद कर सकता हूँ।";
  }

  return persona === "hospital"
    ? "I can help with hospital requests, donor eligibility, policies, or any other question you want to ask."
    : "I can help with donor eligibility, compatible posts, policies, or any other question you want to ask.";
}

function buildKnowledgeAssistantModels() {
  return DEFAULT_ASSISTANT_MODELS;
}

async function getModelReply({
  message,
  language,
  persona,
  pathname,
  matches,
  conversationSummary,
  messages,
}: {
  message: string;
  language: AssistantLanguage;
  persona: Persona;
  pathname?: string;
  matches: ReturnType<typeof matchKnowledgeCases>;
  conversationSummary?: string | null;
  messages?: ChatbotConversationMessage[];
}) {
  if (!env.OPENAI_API_KEY) {
    return null;
  }

  const systemPrompt = [
    ASSISTANT_SYSTEM_PROMPT,
    `Knowledge coverage: ${ASSISTANT_KNOWLEDGE_CASE_COUNT} cases.`,
    buildKnowledgePrompt({
      message,
      persona,
      language,
      matches,
      conversationSummary,
      pathname,
    }),
  ].join("\n\n");

  const transcript = buildConversationTranscript({
    summary: conversationSummary,
    messages,
    latestMessage: message,
    maxTurns: 18,
  });

  try {
    const response = await callAssistantOpenAI({
      models: buildKnowledgeAssistantModels(),
      maxTokens: 460,
      temperature: 0.35,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            `Conversation transcript:\n${transcript}`,
            `Reply in ${getAssistantLanguageName(language)}.`,
          ].join("\n\n"),
        },
      ],
    });

    const content = response?.content?.trim();
    if (!content) {
      return null;
    }

    if (isAssistantReplyStrictlyInLanguage(language, content)) {
      return content;
    }

    const repaired = await callAssistantOpenAI({
      models: buildKnowledgeAssistantModels(),
      maxTokens: 260,
      temperature: 0,
      messages: [
        {
          role: "system",
          content: [
            `Rewrite the assistant reply in strict ${getAssistantLanguageName(language)}.`,
            "Preserve the meaning.",
            "Do not use English words or transliteration unless they are unavoidable fixed terms.",
            "Output only the rewritten reply.",
          ].join(" "),
        },
        {
          role: "user",
          content: content,
        },
      ],
    });

    const repairedContent = repaired?.content?.trim();
    if (repairedContent && isAssistantReplyStrictlyInLanguage(language, repairedContent)) {
      return repairedContent;
    }

    return null;
  } catch {
    return null;
  }
}

function buildHospitalAccountBlockedDraftState({
  hospitalDefaults,
  message,
  reason,
  question,
}: {
  hospitalDefaults: Partial<CreatePostInput>;
  message: string;
  reason: string;
  question: string;
}): HospitalDraftState {
  return {
    values: hospitalDefaults,
    missingFields: ["hospital account details"],
    questions: [question],
    readyForReview: false,
    summary: normalizeMessage(message) || reason,
    blockedReason: reason,
    reviewMode: "blocked",
    auditSummary: reason,
    capturedFields: Object.entries(hospitalDefaults)
      .filter(([, value]) => {
        if (typeof value === "string") return Boolean(value.trim());
        if (typeof value === "number") return Number.isFinite(value);
        if (typeof value === "boolean") return true;
        return Boolean(value);
      })
      .map(([field]) => field),
    nextAction: "complete_hospital_profile",
    lastUpdatedAt: new Date().toISOString(),
  };
}

function buildVerificationBlockedDraftState({
  hospitalDefaults,
  message,
  reason,
  question,
}: {
  hospitalDefaults: Partial<CreatePostInput>;
  message: string;
  reason: string;
  question: string;
}): HospitalDraftState {
  return {
    values: hospitalDefaults,
    missingFields: ["hospital verification"],
    questions: [question],
    readyForReview: false,
    summary: normalizeMessage(message) || reason,
    blockedReason: reason,
    reviewMode: "blocked",
    auditSummary: reason,
    capturedFields: Object.entries(hospitalDefaults)
      .filter(([, value]) => {
        if (typeof value === "string") return Boolean(value.trim());
        if (typeof value === "number") return Number.isFinite(value);
        if (typeof value === "boolean") return true;
        return Boolean(value);
      })
      .map(([field]) => field),
    nextAction: "verify_hospital_account",
    lastUpdatedAt: new Date().toISOString(),
  };
}

function buildResponseSummary(
  response: string,
  conversationSummary?: string | null,
  language?: AssistantLanguage,
) {
  const base = conversationSummary?.trim() ? conversationSummary.trim() : "";
  if (base) {
    return `${truncate(base, 160)} | ${truncate(response, 120)}${language && language !== "en" ? ` | lang:${language}` : ""}`;
  }

  return `${truncate(response, 180)}${language && language !== "en" ? ` | lang:${language}` : ""}`;
}

async function getAssistantSessionId(
  body: ChatbotRequestPayload,
  profileId?: string | null,
) {
  const raw = body.assistantSessionId?.trim();
  if (raw) {
    return raw;
  }

  return profileId ?? "guest";
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as ChatbotRequestPayload | null;

  if (!body?.message) {
    return jsonError("Message is required", 422);
  }

  const { profile, hospitalAccount } = await requireServerUser(request);
  const persona = resolvePersona(body.persona, profile?.account_type);
  const language = resolveAssistantLanguage(body.language, profile?.preferred_language, body.message);
  const pathname = body.pathname ?? request.nextUrl.pathname;
  const messages = body.messages ?? [];
  const userMessageCount = body.userMessageCount ?? messages.filter((entry) => entry.role === "user").length + 1;
  const assistantSessionId = await getAssistantSessionId(body, profile?.id ?? null);
  const rateLimitIdentifier = buildRateLimitIdentifier(assistantSessionId, persona, profile?.id ?? null);
  const rateLimit = await enforceRateLimit(rateLimitIdentifier, {
    points: 18,
    duration: "1 m",
    prefix: "donorix-assistant",
  });

  if (!rateLimit.success) {
    const locked = buildLockedResponse({
      language,
      persona,
      intent: "safety.rate_limit",
      reasonKind: "rate_limit",
      conversationSummary: body.conversationSummary?.trim() || undefined,
    });

    return NextResponse.json(locked satisfies ChatbotResponse);
  }

  const safety = evaluateAssistantSafety({
    message: body.message,
    messages: [...messages, { role: "user", content: body.message }],
    userMessageCount,
  });

  if (safety.shouldLock) {
    const reasonKind: SafetyLockKind = safety.abusive
      ? "abuse"
      : safety.spammy
        ? "spam"
        : "generic";

    const locked = buildLockedResponse({
      language,
      persona,
      intent: `safety.${reasonKind}`,
      reasonKind,
      reasonText: safety.reason,
      conversationSummary: buildResponseSummary(
        safety.reason ?? body.conversationSummary ?? "",
        body.conversationSummary ?? null,
        language,
      ),
    });

    return NextResponse.json(locked satisfies ChatbotResponse);
  }

  const isGuestReminderTurn = persona === "guest" && userMessageCount > 0 && userMessageCount % 3 === 0;

  if (persona === "donor" && (normalizeMessage(body.message).includes("eligible posts") || isEligibilityRequest(body.message))) {
    const donorPosts = await getFeedPosts(profile?.id);
    const eligiblePosts = buildEligiblePosts(donorPosts, profile?.blood_type);

    const reply =
      eligiblePosts.length > 0
        ? formatEligiblePostsReply(eligiblePosts, language)
        : language === "hi"
          ? "Mujhe abhi koi compatible post nahi mila. Aap feed par compatible matches dobara check kar sakte hain."
          : "I couldn't find any compatible posts right now. You can check the compatible matches view again from the feed.";

    const intent = "eligible_posts";
    const conversationSummary = buildConversationSummary({
      previousSummary: body.conversationSummary ?? null,
      latestMessage: body.message,
      reply,
      mode: "eligible_posts",
      intent,
      language,
    });

    return NextResponse.json({
      language,
      languageName: getAssistantLanguageName(language),
      persona,
      mode: "eligible_posts",
      aiActive: false,
      intent,
      reply,
      eligiblePosts,
      reminder: isGuestReminderTurn ? getGuestReminder(language) : null,
      conversationSummary,
    } satisfies ChatbotResponse);
  }

  if (persona === "hospital" && (body.draftState?.readyForReview || isHospitalDraftRequest(body.message, body.draftState))) {
    const hospitalDefaults: Partial<CreatePostInput> = {
      hospital_name: hospitalAccount?.hospital_name ?? profile?.full_name ?? undefined,
      hospital_address: hospitalAccount?.address ?? undefined,
      city: hospitalAccount?.city ?? profile?.city ?? undefined,
      state: hospitalAccount?.state ?? profile?.state ?? undefined,
      contact_name: hospitalAccount?.contact_person_name ?? profile?.full_name ?? undefined,
      contact_phone: hospitalAccount?.official_contact_phone ?? profile?.phone ?? undefined,
      contact_email: hospitalAccount?.official_contact_email ?? profile?.email ?? undefined,
      initial_radius_km: 25,
    };

    if (!hospitalAccount) {
      const draftState = buildHospitalAccountBlockedDraftState({
        hospitalDefaults,
        message: body.message,
        reason:
          language === "hi"
            ? "अस्पताल खाता सेटअप अधूरा है।"
            : "Hospital account details are incomplete.",
        question:
          language === "hi"
            ? "कृपया Settings में hospital registration पूरा करें, फिर request बनाएं।"
            : "Please complete hospital registration in Settings before creating a request.",
      });

      const conversationSummary = buildConversationSummary({
        previousSummary: body.conversationSummary ?? null,
        latestMessage: body.message,
        reply: draftState.blockedReason ?? "",
        mode: "hospital_draft",
        intent: "hospital_draft.blocked",
        draftState,
        language,
      });

      return NextResponse.json({
        language,
        languageName: getAssistantLanguageName(language),
        persona,
        mode: "hospital_draft",
        aiActive: false,
        intent: "hospital_draft.blocked",
        reply:
          language === "hi"
            ? "Mujhe aapka hospital account setup complete nahi dikh raha. Please settings complete karke phir try karein."
            : "Your hospital account setup looks incomplete. Please complete hospital registration in settings first.",
        draftState,
        reminder: isGuestReminderTurn ? getGuestReminder(language) : null,
        conversationSummary,
      } satisfies ChatbotResponse);
    }

    if (hospitalAccount.verification_status !== "verified") {
      const draftState = buildVerificationBlockedDraftState({
        hospitalDefaults,
        message: body.message,
        reason:
          language === "hi"
            ? "यह hospital account अभी verified नहीं है."
            : "Only verified hospital accounts can create blood requests.",
        question:
          language === "hi"
            ? "Request draft बनाने के लिए verification complete करें."
            : "Please finish hospital verification before publishing this request.",
      });

      const conversationSummary = buildConversationSummary({
        previousSummary: body.conversationSummary ?? null,
        latestMessage: body.message,
        reply: draftState.blockedReason ?? "",
        mode: "hospital_draft",
        intent: "hospital_draft.blocked",
        draftState,
        language,
      });

      return NextResponse.json({
        language,
        languageName: getAssistantLanguageName(language),
        persona,
        mode: "hospital_draft",
        aiActive: false,
        intent: "hospital_draft.blocked",
        reply:
          language === "hi"
            ? "Main draft banane mein madad kar sakta hoon, lekin post sirf verified hospital accounts se publish ho sakta hai. Pehle verification complete karein."
            : "I can help draft the request, but publishing is blocked until this hospital account is verified.",
        draftState,
        reminder: isGuestReminderTurn ? getGuestReminder(language) : null,
        conversationSummary,
      } satisfies ChatbotResponse);
    }

    const extractedDraft = extractHospitalDraft({
      message: body.message,
      language,
      messages,
      currentDraft: body.draftState ?? null,
      hospitalDefaults,
    });

    const reply = extractedDraft.reply?.trim()
      ? extractedDraft.reply.trim()
      : extractedDraft.readyForReview
        ? language === "hi"
          ? "Draft tayyar hai. Neeche review karke confirm post karein."
          : "The draft is ready. Review it below and confirm post when you're ready."
        : language === "hi"
          ? "Mujhe अभी कुछ details और चाहिए."
          : "I still need a few more details.";

    const draftState = {
      ...extractedDraft,
      reviewMode: extractedDraft.readyForReview ? "review" : extractedDraft.reviewMode ?? "collecting",
      nextAction: extractedDraft.nextAction ?? (extractedDraft.readyForReview ? "confirm" : "fill_details"),
      auditSummary: extractedDraft.auditSummary || extractedDraft.summary,
      lastUpdatedAt: extractedDraft.lastUpdatedAt ?? new Date().toISOString(),
    } satisfies HospitalDraftState;

    const intent = `hospital_draft.${draftState.readyForReview ? "review" : "collecting"}`;
    const conversationSummary = buildConversationSummary({
      previousSummary: body.conversationSummary ?? null,
      latestMessage: body.message,
      reply,
      mode: "hospital_draft",
      intent,
      draftState,
      language,
    });

    return NextResponse.json({
      language,
      languageName: getAssistantLanguageName(language),
      persona,
      mode: "hospital_draft",
      aiActive: false,
      intent,
      reply,
      draftState,
      reminder: isGuestReminderTurn ? getGuestReminder(language) : null,
      conversationSummary,
    } satisfies ChatbotResponse);
  }

  const knowledgeMatches = matchKnowledgeCases(body.message, persona);
  const intent = `knowledge:${getKnowledgeIntentLabel(knowledgeMatches) ?? "general"}`;
  const assistantReply = await getModelReply({
    message: body.message,
    language,
    persona,
    pathname,
    matches: knowledgeMatches,
    conversationSummary: body.conversationSummary ?? null,
    messages,
  });

  const reply = assistantReply ?? buildGeneralFallbackReply({ message: body.message, language, persona, matches: knowledgeMatches });
  const aiActive = Boolean(assistantReply);
  const conversationSummary = buildConversationSummary({
    previousSummary: body.conversationSummary ?? null,
    latestMessage: body.message,
    reply,
    mode: "general",
    intent,
    language,
  });

  const payload: ChatbotResponse = {
    language,
    languageName: getAssistantLanguageName(language),
    persona,
    mode: "general",
    aiActive,
    intent,
    reply,
    reminder: isGuestReminderTurn ? getGuestReminder(language) : null,
    conversationSummary,
  };

  return NextResponse.json(payload);
}
