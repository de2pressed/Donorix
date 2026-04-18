import { MAIN_NAV, POLICY_NAV, SETTINGS_SECTIONS } from "@/lib/constants";
import { policies } from "@/lib/content/policies";
import { sanitizeText } from "@/lib/utils/sanitize";

import { getAssistantLanguageName, type AssistantLanguage } from "@/lib/assistant/language";
import type { Persona } from "@/lib/assistant/types";

export type KnowledgeCaseCategory =
  | "overview"
  | "donor"
  | "hospital"
  | "account"
  | "policy"
  | "support"
  | "safety"
  | "emergency";

export type AssistantKnowledgeCase = {
  id: string;
  category: KnowledgeCaseCategory;
  canonicalQuestions: string[];
  keywords: string[];
  facts: string[];
  followUps: string[];
  refusalRules: string[];
  personaScope: Persona | Persona[] | "all";
  priority: number;
  source?: string;
};

export type KnowledgeMatch = {
  case: AssistantKnowledgeCase;
  score: number;
  matchedKeywords: string[];
  canonicalQuestion: string;
};

const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "that",
  "this",
  "your",
  "you",
  "are",
  "can",
  "will",
  "should",
  "must",
  "only",
  "about",
  "what",
  "when",
  "where",
  "how",
  "why",
  "which",
  "into",
  "need",
  "need",
  "request",
  "post",
  "please",
  "have",
  "does",
  "done",
  "more",
  "than",
  "into",
  "their",
  "there",
  "also",
  "here",
  "than",
]);

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function normalizeMessage(value: string) {
  return sanitizeText(value)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueKeywords(...values: string[]) {
  const seen = new Set<string>();
  const keywords: string[] = [];

  for (const value of values) {
    const normalized = normalizeMessage(value);
    const tokens = normalized
      .split(/[\s/|,;:().\-]+/g)
      .map((token) => token.trim())
      .filter((token) => token.length > 1);

    for (const token of tokens) {
      if (STOPWORDS.has(token)) continue;
      if (seen.has(token)) continue;
      seen.add(token);
      keywords.push(token);
    }
  }

  return keywords.slice(0, 16);
}

function firstSentence(value: string) {
  const cleaned = sanitizeText(value).trim();
  const sentence = cleaned.match(/^[^.?!]+[.?!]?/);
  return (sentence?.[0] ?? cleaned).trim();
}

function createCase(params: Omit<AssistantKnowledgeCase, "keywords"> & { keywords?: string[] }) {
  return {
    ...params,
    keywords: params.keywords ?? [],
  } satisfies AssistantKnowledgeCase;
}

function isGreetingMessage(message: string) {
  const normalized = normalizeMessage(message);
  if (!normalized) return false;

  return [
    "hi",
    "hello",
    "hey",
    "yo",
    "namaste",
    "namaskar",
    "good morning",
    "good afternoon",
    "good evening",
    "hello there",
    "hi there",
  ].some((greeting) => normalized === greeting || normalized.startsWith(`${greeting} `) || normalized.startsWith(`${greeting}!`) || normalized.startsWith(`${greeting},`));
}

function caseFromPolicy({
  slug,
  title,
  summary,
  heading,
  paragraphs,
  source,
}: {
  slug: string;
  title: string;
  summary: string;
  heading: string;
  paragraphs: string[];
  source: string;
}): AssistantKnowledgeCase {
  return createCase({
    id: `policy-${slug}`,
    category: "policy",
    canonicalQuestions: [`What does ${title} say about ${heading.toLowerCase()}?`, `${heading}`],
    keywords: uniqueKeywords(title, summary, heading, ...paragraphs),
    facts: [summary, ...paragraphs.map(firstSentence)],
    followUps: [
      "I can summarize this policy in plain language.",
      "I can also point you to the relevant policy page.",
    ],
    refusalRules: slug === "emergency-use"
      ? ["Never imply Donorix is a primary emergency service."]
      : slug === "misuse-prevention"
        ? ["Never help with fraud, spam, harassment, or blood resale."]
        : [],
    personaScope: "all",
    priority: 1,
    source,
  });
}

function buildPolicyCases() {
  const cases: AssistantKnowledgeCase[] = [];

  for (const [slug, policy] of Object.entries(policies)) {
    policy.sections.forEach((section, index) => {
      cases.push(
        caseFromPolicy({
          slug: `${slug}-${index + 1}`,
          title: policy.title,
          summary: policy.summary,
          heading: section.heading,
          paragraphs: section.paragraphs,
          source: `policies.${slug}.sections[${index}]`,
        }),
      );
    });
  }

  return cases;
}

function buildNavigationCases() {
  return MAIN_NAV.map((item) =>
    createCase({
      id: `nav-${slugify(item.label)}`,
      category: "support",
      canonicalQuestions: [`Where do I find ${item.label}?`, `How do I open ${item.label}?`],
      keywords: uniqueKeywords(item.label, item.href),
      facts: [`${item.label} is available in the main navigation.`, `Open ${item.label} from the app shell when you need it.`],
      followUps: ["I can also explain what happens on that page."],
      refusalRules: [],
      personaScope: "all",
      priority: 2,
      source: `main-nav:${item.href}`,
    }),
  );
}

function buildSettingsCases() {
  return SETTINGS_SECTIONS.map((section) =>
    createCase({
      id: `settings-${slugify(section)}`,
      category: "account",
      canonicalQuestions: [`How do I change ${section.toLowerCase()}?`, `Where is ${section.toLowerCase()} in settings?`],
      keywords: uniqueKeywords(section, "settings", "profile", "notifications", "privacy", "account"),
      facts: [
        `${section} is managed from the Settings page.`,
        "The assistant can help explain what each setting controls.",
      ],
      followUps: ["I can walk you through the exact setting if you want."],
      refusalRules: [],
      personaScope: "all",
      priority: 2,
      source: `settings:${slugify(section)}`,
    }),
  );
}

function buildPolicyNavCases() {
  return POLICY_NAV.map((item) =>
    createCase({
      id: `policy-nav-${slugify(item.label)}`,
      category: "policy",
      canonicalQuestions: [`Where is the ${item.label} policy?`, `How do I open ${item.label}?`],
      keywords: uniqueKeywords(item.label, item.href, "policy", "policies"),
      facts: [
        `${item.label} is listed under the Policies section.`,
        "Open the policy page from the shared policies navigation.",
      ],
      followUps: ["I can summarize the policy if you want."],
      refusalRules: [],
      personaScope: "all",
      priority: 1,
      source: `policy-nav:${item.href}`,
    }),
  );
}

function buildProductCases() {
  const cases: AssistantKnowledgeCase[] = [
    createCase({
      id: "overview-donorix",
      category: "overview",
      canonicalQuestions: ["What is Donorix?", "How does Donorix work?"],
      keywords: uniqueKeywords("Donorix", "blood donation platform", "India", "multilingual assistant", "how it works"),
      facts: [
        "Donorix is a blood donation coordination platform for India.",
        "It helps donors find compatible requests and helps verified hospitals manage blood requests.",
        "The assistant can answer questions, guide eligible-post discovery, and help with hospital drafts.",
      ],
      followUps: ["Ask me about donor eligibility, hospital requests, or policies."],
      refusalRules: [],
      personaScope: "all",
      priority: 4,
      source: "product-overview",
    }),
    createCase({
      id: "donor-eligibility-core",
      category: "donor",
      canonicalQuestions: ["Am I eligible to donate?", "What are the core donor rules?"],
      keywords: uniqueKeywords("eligible to donate", "18 years", "50 kg", "donor eligibility", "blood type"),
      facts: [
        "Most donors need to be 18 or older and weigh at least 50 kg.",
        "A 90-day gap is generally needed after a whole blood donation.",
        "Final eligibility must still be confirmed by the treating hospital or blood bank.",
      ],
      followUps: ["I can check compatibility, cooldown timing, or donor profile settings."],
      refusalRules: ["Do not give a definitive medical clearance."],
      personaScope: "donor",
      priority: 5,
      source: "donor-eligibility-core",
    }),
    createCase({
      id: "donor-eligibility-cooldown",
      category: "donor",
      canonicalQuestions: ["When can I donate again?", "What is the donation cooldown?"],
      keywords: uniqueKeywords("90 days", "cooldown", "last donated", "whole blood", "donation history"),
      facts: [
        "Whole blood donation usually requires a 90-day gap before donating again.",
        "The exact date depends on the last verified donation record.",
      ],
      followUps: ["I can help you interpret your donation history or last donation date."],
      refusalRules: ["Do not overrule a hospital's eligibility decision."],
      personaScope: "donor",
      priority: 4,
      source: "donor-cooldown",
    }),
    createCase({
      id: "donor-compatibility",
      category: "donor",
      canonicalQuestions: ["Which requests am I compatible with?", "How do compatible posts work?"],
      keywords: uniqueKeywords("compatible posts", "eligible posts", "blood type compatibility", "find requests", "donate to"),
      facts: [
        "Compatible requests are shown when the donor blood type can donate to the recipient blood type.",
        "The eligible-posts flow uses the donor profile blood type to filter matching requests.",
      ],
      followUps: ["I can show the compatible-posts view or explain blood-group compatibility."],
      refusalRules: ["Do not say compatibility guarantees clinical suitability."],
      personaScope: "donor",
      priority: 5,
      source: "donor-compatibility",
    }),
    createCase({
      id: "donor-feed",
      category: "donor",
      canonicalQuestions: ["How do I find requests?", "How do I use the donate feed?"],
      keywords: uniqueKeywords("feed", "find requests", "compatible matches", "donate", "request feed"),
      facts: [
        "The feed shows live requests sorted by urgency, freshness, and trust signals.",
        "Emergency requests are ranked first.",
      ],
      followUps: ["I can explain filters, compatible matches, or request ranking."],
      refusalRules: [],
      personaScope: "donor",
      priority: 4,
      source: "donor-feed",
    }),
    createCase({
      id: "donor-profile",
      category: "account",
      canonicalQuestions: ["How do I update my donor profile?", "How do I set availability?"],
      keywords: uniqueKeywords("profile", "blood type", "availability", "karma", "donation history"),
      facts: [
        "Donor profiles store blood type, city, state, availability, and trust signals.",
        "Availability and discoverability settings influence matching and visibility.",
      ],
      followUps: ["I can explain the effect of any donor profile setting."],
      refusalRules: [],
      personaScope: "donor",
      priority: 3,
      source: "donor-profile",
    }),
    createCase({
      id: "leaderboard",
      category: "support",
      canonicalQuestions: ["How does the leaderboard work?", "Why am I on the karma leaderboard?"],
      keywords: uniqueKeywords("leaderboard", "karma", "verified donations", "rank"),
      facts: [
        "The leaderboard ranks donors by verified donations, responsive participation, and no-shows.",
        "Users can opt out from the leaderboard in privacy settings.",
      ],
      followUps: ["I can explain how rank, karma, and visibility settings interact."],
      refusalRules: [],
      personaScope: "all",
      priority: 3,
      source: "leaderboard",
    }),
    createCase({
      id: "hospital-create-post",
      category: "hospital",
      canonicalQuestions: ["How do I create a blood request?", "What do I need for a hospital post?"],
      keywords: uniqueKeywords("create post", "new request", "blood request", "patient post", "hospital account"),
      facts: [
        "Only verified hospital accounts can publish blood requests.",
        "A request needs patient name, patient ID or case reference, blood group, units needed, hospital details, contact person, contact phone, medical reason, and required-by time.",
        "The assistant can collect the details step by step and then move to audit and confirm mode.",
      ],
      followUps: ["I can start a draft and collect the missing fields in chat."],
      refusalRules: ["Do not imply guest or donor accounts can publish hospital requests."],
      personaScope: "hospital",
      priority: 6,
      source: "hospital-create-post",
    }),
    createCase({
      id: "hospital-required-fields",
      category: "hospital",
      canonicalQuestions: ["Which fields are required in a hospital post?", "What details are missing?"],
      keywords: uniqueKeywords("patient name", "patient id", "blood group", "units needed", "contact phone", "required by"),
      facts: [
        "The request form validates each section before publishing.",
        "The assistant should not keep asking for fields that are already filled by the hospital profile or the current draft.",
      ],
      followUps: ["I can list exactly which fields are still missing."],
      refusalRules: [],
      personaScope: "hospital",
      priority: 6,
      source: "hospital-required-fields",
    }),
    createCase({
      id: "hospital-review-confirm",
      category: "hospital",
      canonicalQuestions: ["How do I review and confirm a draft?", "What happens after all details are filled?"],
      keywords: uniqueKeywords("review", "confirm post", "audit", "publish", "confirm request"),
      facts: [
        "Once the draft is complete, the assistant should switch to review mode and wait for confirmation.",
        "Users can confirm by clicking the button or typing confirm post.",
      ],
      followUps: ["I can show the audit summary and the confirm action."],
      refusalRules: [],
      personaScope: "hospital",
      priority: 6,
      source: "hospital-review-confirm",
    }),
    createCase({
      id: "hospital-emergency-mode",
      category: "hospital",
      canonicalQuestions: ["Should I mark this as emergency?", "How does emergency mode work?"],
      keywords: uniqueKeywords("emergency", "urgent", "priority", "radius", "notification radius"),
      facts: [
        "Emergency requests receive priority ranking and broader outreach.",
        "Emergency mode is for clinically urgent situations only.",
      ],
      followUps: ["I can explain the radius setting or emergency ranking behavior."],
      refusalRules: ["Never claim Donorix replaces emergency services."],
      personaScope: "hospital",
      priority: 5,
      source: "hospital-emergency-mode",
    }),
    createCase({
      id: "hospital-history",
      category: "hospital",
      canonicalQuestions: ["Where is my patient post history?", "How do I edit or delete a post?"],
      keywords: uniqueKeywords("patient posts", "post history", "edit post", "delete post", "history"),
      facts: [
        "Hospitals can manage their active and past requests from the patient-post history pages.",
        "The post detail screen supports update and delete actions for eligible users.",
      ],
      followUps: ["I can explain the exact navigation path."],
      refusalRules: [],
      personaScope: "hospital",
      priority: 4,
      source: "hospital-history",
    }),
    createCase({
      id: "hospital-applicants",
      category: "hospital",
      canonicalQuestions: ["How do I review donor applicants?", "What do pending donors mean?"],
      keywords: uniqueKeywords("donor applicants", "pending applicants", "approve", "reject", "responses"),
      facts: [
        "Hospitals can review donor responses on the donor applicants or pending requests surface.",
        "Donor responses can be approved or rejected per post.",
      ],
      followUps: ["I can explain how donor chat becomes available after approval."],
      refusalRules: [],
      personaScope: "hospital",
      priority: 5,
      source: "hospital-applicants",
    }),
    createCase({
      id: "hospital-chat",
      category: "hospital",
      canonicalQuestions: ["How do hospital chats work?", "How do I message an approved donor?"],
      keywords: uniqueKeywords("chat", "messages", "approved donor", "hospital chats", "conversation"),
      facts: [
        "Hospital chat threads are available after a donor is approved for a request.",
        "Messages are stored per post and notify the other participant.",
      ],
      followUps: ["I can help with chat access, message delivery, or thread navigation."],
      refusalRules: [],
      personaScope: "hospital",
      priority: 4,
      source: "hospital-chat",
    }),
    createCase({
      id: "hospital-verification",
      category: "hospital",
      canonicalQuestions: ["Why can't I publish?", "What does hospital verification do?"],
      keywords: uniqueKeywords("verified hospital", "unverified", "verification status", "publish blocked"),
      facts: [
        "Drafting is allowed for hospitals, but publishing is blocked until verification is complete.",
        "If the hospital account is incomplete, registration must be finished in Settings first.",
      ],
      followUps: ["I can explain the verification and account-setup requirements."],
      refusalRules: ["Do not imply an unverified hospital can publish."],
      personaScope: "hospital",
      priority: 6,
      source: "hospital-verification",
    }),
    createCase({
      id: "account-login",
      category: "account",
      canonicalQuestions: ["How do I log in?", "What if my session expired?"],
      keywords: uniqueKeywords("login", "session expired", "sign in", "reset password", "forgot password"),
      facts: [
        "The app supports login, password reset, and session synchronization for authenticated users.",
        "A session-expired event should redirect the user to login when needed.",
      ],
      followUps: ["I can help with reset-password or re-authentication steps."],
      refusalRules: [],
      personaScope: "all",
      priority: 4,
      source: "account-login",
    }),
    createCase({
      id: "account-language",
      category: "account",
      canonicalQuestions: ["How do I change language?", "How do I change notification preferences?"],
      keywords: uniqueKeywords("language", "notifications", "sms alerts", "email alerts", "push notifications"),
      facts: [
        "Language and notification settings are managed from Settings.",
        "Users can control SMS, email, push, privacy, and radius preferences there.",
      ],
      followUps: ["I can explain any setting one by one."],
      refusalRules: [],
      personaScope: "all",
      priority: 3,
      source: "account-language",
    }),
    createCase({
      id: "account-privacy",
      category: "account",
      canonicalQuestions: ["What privacy settings are available?", "Can I delete my account or download my data?"],
      keywords: uniqueKeywords("privacy", "delete account", "download data", "location access", "consent"),
      facts: [
        "Privacy settings include discoverability, emergency direct contact, leaderboard visibility, and consent controls.",
        "Account management includes data download and deletion flows when connected to the backend.",
      ],
      followUps: ["I can explain location, consent, or deletion behavior."],
      refusalRules: [],
      personaScope: "all",
      priority: 4,
      source: "account-privacy",
    }),
    createCase({
      id: "troubleshooting-forms",
      category: "support",
      canonicalQuestions: ["Why is the form rejecting my post?", "Why am I missing fields?"],
      keywords: uniqueKeywords("missing fields", "invalid phone", "required by", "future", "form error", "validation"),
      facts: [
        "The request form validates patient, contact, medical, and deadline fields before publishing.",
        "A required-by time must be in the future.",
      ],
      followUps: ["I can pinpoint the exact missing field and format it needs."],
      refusalRules: [],
      personaScope: "hospital",
      priority: 5,
      source: "troubleshooting-forms",
    }),
    createCase({
      id: "troubleshooting-location",
      category: "support",
      canonicalQuestions: ["Why is location not working?", "How does location affect matching?"],
      keywords: uniqueKeywords("location", "gps", "city", "state", "radius", "mapbox"),
      facts: [
        "Location improves radius-based matching, but city and state still keep the app usable when precise location is unavailable.",
        "Users can revoke location access at any time.",
      ],
      followUps: ["I can help you troubleshoot browser or device permissions."],
      refusalRules: [],
      personaScope: "all",
      priority: 3,
      source: "troubleshooting-location",
    }),
    createCase({
      id: "troubleshooting-notifications",
      category: "support",
      canonicalQuestions: ["Why am I not getting notifications?", "Why didn't the SMS or email arrive?"],
      keywords: uniqueKeywords("notifications", "sms", "email", "push", "alerts", "opt-in"),
      facts: [
        "Notification delivery depends on the user’s opt-in settings and the configured integrations.",
        "The app can notify about matches, approvals, reminders, and other request updates.",
      ],
      followUps: ["I can help you check the delivery channel or settings."],
      refusalRules: [],
      personaScope: "all",
      priority: 3,
      source: "troubleshooting-notifications",
    }),
    createCase({
      id: "safety-fraud",
      category: "safety",
      canonicalQuestions: ["Can I post a fake emergency?", "Can I sell blood or ask for payment?"],
      keywords: uniqueKeywords("fake emergency", "fake request", "sell blood", "payment", "fraud"),
      facts: [
        "Fake emergencies, impersonation, harassment, and blood resale are prohibited.",
        "Donorix may suppress, shadow-ban, or remove abusive content.",
      ],
      followUps: ["I can explain the misuse and fraud policy."],
      refusalRules: ["Never help with fraud, fake emergencies, or blood resale."],
      personaScope: "all",
      priority: 6,
      source: "safety-fraud",
    }),
    createCase({
      id: "safety-abuse",
      category: "safety",
      canonicalQuestions: ["How do you handle spam or harassment?", "Is explicit content allowed?"],
      keywords: uniqueKeywords("spam", "harassment", "abuse", "explicit", "offensive"),
      facts: [
        "Explicit wording is tolerated unless it becomes harassment, scams, threats, or repeated flood behavior.",
        "Repeated spam can disable the chat for the current session.",
      ],
      followUps: ["I can explain the difference between allowed language and abusive behavior."],
      refusalRules: ["Do not tolerate threats, harassment, or repeated spam."],
      personaScope: "all",
      priority: 6,
      source: "safety-abuse",
    }),
    createCase({
      id: "safety-emergency",
      category: "emergency",
      canonicalQuestions: ["What should I do in an emergency?", "Is Donorix an emergency service?"],
      keywords: uniqueKeywords("emergency service", "112", "life threatening", "urgent"),
      facts: [
        "Donorix is not an emergency service.",
        "In a life-threatening situation, call 112 or your nearest hospital immediately.",
        "Emergency posts are only a supplementary coordination tool.",
      ],
      followUps: ["I can still help you find matching donors or explain emergency ranking."],
      refusalRules: ["Never tell the user to rely on Donorix alone for emergency care."],
      personaScope: "all",
      priority: 7,
      source: "safety-emergency",
    }),
  ];

  return cases;
}

export const ASSISTANT_KNOWLEDGE_CASES: AssistantKnowledgeCase[] = [
  ...buildProductCases(),
  ...buildNavigationCases(),
  ...buildSettingsCases(),
  ...buildPolicyNavCases(),
  ...buildPolicyCases(),
];

export const ASSISTANT_KNOWLEDGE_CASE_COUNT = ASSISTANT_KNOWLEDGE_CASES.length;

function scoreCase(message: string, knowledgeCase: AssistantKnowledgeCase, persona: Persona) {
  const normalizedMessage = normalizeMessage(message);
  const matchedKeywords: string[] = [];
  let score = 0;
  let matchedQuestion = false;

  for (const keyword of knowledgeCase.keywords) {
    const normalizedKeyword = normalizeMessage(keyword);
    if (!normalizedKeyword) continue;

    if (normalizedMessage.includes(normalizedKeyword)) {
      matchedKeywords.push(keyword);
      score += normalizedKeyword.includes(" ") ? 3 : 2;
    }
  }

  for (const canonicalQuestion of knowledgeCase.canonicalQuestions) {
    const normalizedQuestion = normalizeMessage(canonicalQuestion);
    if (normalizedQuestion && normalizedMessage.includes(normalizedQuestion)) {
      matchedQuestion = true;
      score += 4;
    }
  }

  if (
    knowledgeCase.personaScope !== "all" &&
    (Array.isArray(knowledgeCase.personaScope)
      ? !knowledgeCase.personaScope.includes(persona)
      : knowledgeCase.personaScope !== persona)
  ) {
    score -= 2;
  }

  if (normalizedMessage.length < 4) {
    score -= 1;
  }

  if (!matchedKeywords.length && !matchedQuestion) {
    return {
      score: 0,
      matchedKeywords,
    };
  }

  score += knowledgeCase.priority;

  return {
    score,
    matchedKeywords,
  };
}

export function matchKnowledgeCases(message: string, persona: Persona) {
  return ASSISTANT_KNOWLEDGE_CASES.map((knowledgeCase) => {
    const { score, matchedKeywords } = scoreCase(message, knowledgeCase, persona);
    return {
      case: knowledgeCase,
      score,
      matchedKeywords,
      canonicalQuestion: knowledgeCase.canonicalQuestions[0] ?? knowledgeCase.id,
    } satisfies KnowledgeMatch;
  })
    .filter((match) => match.score >= 2)
    .sort((left, right) => right.score - left.score || right.case.priority - left.case.priority)
    .slice(0, 3);
}

export function buildKnowledgePrompt({
  message,
  persona,
  language,
  matches,
  conversationSummary,
  pathname,
}: {
  message: string;
  persona: Persona;
  language: AssistantLanguage;
  matches: KnowledgeMatch[];
  conversationSummary?: string | null;
  pathname?: string;
}) {
  const header = [
    `Language: ${getAssistantLanguageName(language)}`,
    `Language code: ${language}`,
    `Response language: ${getAssistantLanguageName(language)}`,
    "Write the final answer entirely in the response language.",
    "Answer the user's actual question directly. Do not turn the context into a preset script.",
    `Persona: ${persona}`,
    `Current page: ${pathname ?? "unknown"}`,
    conversationSummary?.trim() ? `Conversation summary: ${sanitizeText(conversationSummary)}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const matchBriefs = matches
    .slice(0, 3)
    .map(
      (match, index) =>
        [
          `Case ${index + 1}: ${match.case.id}`,
          `Canonical question: ${match.canonicalQuestion}`,
          `Category: ${match.case.category}`,
          `Key facts: ${match.case.facts.map((fact) => `- ${fact}`).join("\n")}`,
          match.case.followUps.length ? `Follow-ups: ${match.case.followUps.map((followUp) => `- ${followUp}`).join("\n")}` : null,
          match.case.refusalRules.length
            ? `Refusal rules: ${match.case.refusalRules.map((rule) => `- ${rule}`).join("\n")}`
            : null,
        ]
          .filter(Boolean)
          .join("\n"),
    )
    .join("\n\n");

  return [
    "You are Donorix Assistant.",
    "Be friendly, cooperative, and conversational.",
    "Answer the user's actual question first. If the user asks something general, answer it normally.",
    "Do not ask for more details unless the answer is genuinely incomplete or ambiguous.",
    "If the user only greets you, greet back briefly and ask what they want to know.",
    "Answer concisely, practically, and entirely in the selected response language.",
    "Do not mix languages unless you are preserving a proper noun, medical term, or app label.",
    "Use the knowledge brief below as background context, not a script.",
    "Do not invent hospital details, donor eligibility, or policy exceptions.",
    "If the user is asking about a hospital draft and you need more details, ask only for the missing fields.",
    "If the request is unsafe, abusive, or asks for fraud, refuse briefly and redirect.",
    header,
    matchBriefs ? `Relevant knowledge:\n${matchBriefs}` : "No specific Donorix topic matched. Answer the user's question directly if it is safe to do so.",
    `User message: ${sanitizeText(message)}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function buildGreetingReply(language: AssistantLanguage) {
  if (language === "hi") {
    return "नमस्ते। आप Donorix या किसी भी दूसरे सवाल के बारे में क्या जानना चाहेंगे?";
  }

  return "Hi. What can I help you with?";
}

export function buildKnowledgeFallbackReply(match: KnowledgeMatch, language: AssistantLanguage) {
  if (language === "hi") {
    return match.case.facts[0]
      ? `यह ${match.case.canonicalQuestions[0] ?? "इस विषय"} से जुड़ा है। ${match.case.facts[0]}`
      : `यह ${match.case.canonicalQuestions[0] ?? "इस विषय"} से जुड़ा है।`;
  }

  return match.case.facts.slice(0, 3).join(" ");
}

export function getKnowledgeIntentLabel(matches: KnowledgeMatch[]) {
  return matches[0]?.case.id ?? null;
}

export { isGreetingMessage };
