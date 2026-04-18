"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bot, MessageCircleMore, Sparkles, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { ChatMessage } from "@/components/chatbot/chat-message";
import { LanguageSelector } from "@/components/chatbot/language-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { INDIAN_LANGUAGES } from "@/lib/constants";
import { useUser } from "@/lib/hooks/use-user";
import { authenticatedFetch } from "@/lib/supabase/authenticated-fetch";
import { cn } from "@/lib/utils/cn";
import { sanitizeText } from "@/lib/utils/sanitize";
import type { CreatePostInput } from "@/lib/validations/post";

type AssistantMessage = { role: "assistant" | "user" | "system"; content: string };
type Persona = "guest" | "donor" | "hospital";
type HospitalDraftState = {
  values: Partial<CreatePostInput>;
  missingFields: string[];
  questions: string[];
  fieldChecklist?: Array<{
    field: string;
    label: string;
    value: string;
    required: boolean;
    missing: boolean;
    prompt?: string | null;
  }>;
  readyForReview: boolean;
  summary: string;
  blockedReason?: string | null;
  reviewMode?: "collecting" | "review" | "blocked";
  auditSummary?: string;
  capturedFields?: string[];
  nextMissingField?: string | null;
  nextAction?: string | null;
  lastUpdatedAt?: string;
};
type EligiblePost = {
  id: string;
  patient_name: string;
  blood_type_needed: string;
  hospital_name: string;
  city: string;
  state: string;
  units_needed: number;
  required_by: string | null;
  link: string;
};
type ChatbotResponse = {
  reply?: string;
  persona?: Persona;
  mode?: "general" | "eligible_posts" | "hospital_draft";
  aiActive?: boolean;
  eligiblePosts?: EligiblePost[];
  draftState?: HospitalDraftState | null;
  reminder?: string | null;
  chatDisabled?: boolean;
  chatDisabledReason?: string | null;
  conversationSummary?: string;
  intent?: string | null;
};

const LANGUAGE_STORAGE_KEY = "donorix-assistant-language";
export const ASSISTANT_OPEN_EVENT = "donorix-assistant:open";

function isStoredAssistantLanguage(value: string | null): value is string {
  return Boolean(value && INDIAN_LANGUAGES.some((language) => language.code === value));
}

function getLanguageLabel(languageCode: string) {
  return INDIAN_LANGUAGES.find((language) => language.code === languageCode)?.label ?? languageCode;
}

function normalize(value: string) {
  return sanitizeText(value).toLowerCase().replace(/\s+/g, " ").trim();
}

function countUserMessages(messages: AssistantMessage[]) {
  return messages.reduce((count, message) => count + (message.role === "user" ? 1 : 0), 0);
}

function isConfirmDraftMessage(value: string) {
  const n = normalize(value);
  return [
    "confirm post",
    "confirm request",
    "confirm this post",
    "confirm this request",
    "publish post",
    "submit post",
    "submit request",
    "approve and post",
    "go ahead",
    "finalize",
    "finalise",
    "confirm",
    "confirm karo",
    "post karo",
  ].some((term) => n === term || n.includes(term));
}

function humanizeField(field: string) {
  return field.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function formatValue(value: unknown, language: string) {
  if (value === null || value === undefined || value === "") return "Not provided";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return String(value);
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat(language === "hi" ? "hi-IN" : "en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
    }
  }
  return String(value);
}

function getCapturedFields(draftState: HospitalDraftState, language: string) {
  const source = draftState.capturedFields?.length ? draftState.capturedFields : Object.keys(draftState.values ?? {});
  return source
    .map((field) => ({
      field,
      label: humanizeField(field),
      value: formatValue(draftState.values?.[field as keyof CreatePostInput], language),
    }))
    .filter((entry) => entry.value !== "Not provided");
}

function createSessionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `assistant-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

function getQuickActions(
  persona: Persona,
  pathname: string,
  tAssistant: (key: string, values?: Record<string, string | number>) => string,
  draftState: HospitalDraftState | null,
) {
  if (persona === "hospital") {
    if (draftState?.readyForReview) return ["Review draft", "Confirm post", "Fill details"];
    if (draftState) return ["Fill details", "Review draft", tAssistant("hospitalQuickHow")];
    return [tAssistant("hospitalQuickDraft"), tAssistant("hospitalQuickMissing"), tAssistant("hospitalQuickHow")];
  }

  if (persona === "donor") {
    return [
      pathname.startsWith("/find") ? tAssistant("donorQuickEligibleFromFind") : tAssistant("donorQuickEligible"),
      tAssistant("donorQuickHow"),
      tAssistant("donorQuickSite"),
    ];
  }

  return [tAssistant("guestQuickHow"), tAssistant("guestQuickSignup"), tAssistant("guestQuickActions")];
}

export function FloatingAssistant() {
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = Boolean(useReducedMotion());
  const tAssistant = useTranslations("assistant");
  const { data: currentUser } = useUser();

  const persona: Persona =
    currentUser?.account_type === "hospital" ? "hospital" : currentUser?.account_type === "donor" ? "donor" : "guest";

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState<AssistantMessage[]>([{ role: "assistant", content: tAssistant("intro") }]);
  const [hasUnread, setHasUnread] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const [aiActive, setAiActive] = useState(false);
  const [eligiblePosts, setEligiblePosts] = useState<EligiblePost[]>([]);
  const [draftState, setDraftState] = useState<HospitalDraftState | null>(null);
  const [conversationSummary, setConversationSummary] = useState<string | null>(null);
  const [chatDisabled, setChatDisabled] = useState(false);
  const [chatDisabledReason, setChatDisabledReason] = useState<string | null>(null);
  const [assistantSessionId] = useState(() => createSessionId());
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const hidden = useMemo(
    () =>
      pathname.startsWith("/signup") ||
      pathname.startsWith("/policies") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/forgot-password") ||
      pathname.startsWith("/reset-password"),
    [pathname],
  );

  const quickActions = useMemo(
    () => getQuickActions(persona, pathname, tAssistant, draftState),
    [persona, pathname, tAssistant, draftState],
  );

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const footer = document.getElementById("site-footer");
    if (!footer || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(([entry]) => setFooterVisible(Boolean(entry?.isIntersecting)), {
      threshold: 0.12,
    });

    observer.observe(footer);
    return () => observer.disconnect();
  }, [mounted]);

  useEffect(() => {
    if (hidden) setOpen(false);
  }, [hidden]);

  useEffect(() => {
    if (!mounted) return;

    const storedLanguage = window.sessionStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isStoredAssistantLanguage(storedLanguage)) {
      setLanguage(storedLanguage);
    }
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    if (isStoredAssistantLanguage(language)) {
      window.sessionStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }
  }, [language, mounted]);

  useEffect(() => {
    if (!open) return;
    setHasUnread(false);
    messagesEndRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "end" });
  }, [messages, open, reduceMotion, eligiblePosts, draftState, chatDisabled]);

  useEffect(() => {
    if (!mounted) return;
    const handleOpen = () => {
      setOpen(true);
      setHasUnread(false);
    };
    window.addEventListener(ASSISTANT_OPEN_EVENT, handleOpen);
    return () => window.removeEventListener(ASSISTANT_OPEN_EVENT, handleOpen);
  }, [mounted]);

  useEffect(() => {
    setEligiblePosts([]);
    if (persona !== "hospital") setDraftState(null);
  }, [persona]);

  useEffect(() => {
    setMessages([{ role: "assistant", content: tAssistant("intro") }]);
    setConversationSummary(null);
    setChatDisabled(false);
    setChatDisabledReason(null);
    setDraftState(null);
    setEligiblePosts([]);
    setAiActive(false);
    setValue("");
    setIsSending(false);
  }, [currentUser?.id, tAssistant]);

  async function sendMessage(rawMessage: string) {
    const question = rawMessage.trim();
    if (!question || isSending || chatDisabled) return;

    const sessionId = assistantSessionId;

    const nextMessages: AssistantMessage[] = [...messages, { role: "user", content: question }];
    setMessages(nextMessages);
    setValue("");
    setIsSending(true);

    try {
      const response = await authenticatedFetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: question,
          language,
          persona,
          pathname,
          messages: nextMessages.slice(-12),
          draftState,
          userMessageCount: countUserMessages(nextMessages),
          assistantSessionId: sessionId,
          conversationSummary,
        }),
        redirectOnAuthFailure: false,
      });

      const payload = (await response.json().catch(() => null)) as ChatbotResponse | null;
      const reply =
        response.ok && typeof payload?.reply === "string" && payload.reply.trim() ? payload.reply.trim() : tAssistant("fallback");
      const nextAssistantMessages: AssistantMessage[] = [{ role: "assistant", content: reply }];
      if (response.ok && payload?.reminder?.trim()) {
        nextAssistantMessages.push({ role: "system", content: payload.reminder.trim() });
      }
      setMessages((current) => [...current, ...nextAssistantMessages]);

      if (response.ok && payload) {
        if ("eligiblePosts" in payload) setEligiblePosts(Array.isArray(payload.eligiblePosts) ? payload.eligiblePosts : []);
        else if (persona !== "hospital") setEligiblePosts([]);

        setAiActive(Boolean(payload.aiActive));

        if ("draftState" in payload) setDraftState(payload.draftState ?? null);
        else if (persona !== "hospital") setDraftState(null);

        if (typeof payload.conversationSummary === "string") setConversationSummary(payload.conversationSummary.trim() || null);

        if (typeof payload.chatDisabled === "boolean") {
          setChatDisabled(payload.chatDisabled);
          setChatDisabledReason(
            typeof payload.chatDisabledReason === "string" && payload.chatDisabledReason.trim()
              ? payload.chatDisabledReason.trim()
              : null,
          );
        }
      }
    } catch {
      setMessages((current) => [...current, { role: "assistant", content: tAssistant("fallback") } as AssistantMessage]);
      setAiActive(false);
      if (persona !== "hospital") setDraftState(null);
    } finally {
      setIsSending(false);
      if (!open) setHasUnread(true);
    }
  }

  async function confirmDraft(triggerMessage?: string) {
    if (!draftState?.readyForReview || draftState.blockedReason || isSending || chatDisabled) return;

    if (triggerMessage?.trim()) {
      setMessages((current) => [...current, { role: "user", content: triggerMessage.trim() } as AssistantMessage]);
    }

    setIsSending(true);
    setValue("");
    try {
      const response = await authenticatedFetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draftState.values),
        redirectOnAuthFailure: false,
      });
      const payload = (await response.json().catch(() => null)) as { postId?: string; error?: unknown } | null;
      if (!response.ok) {
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content: typeof payload?.error === "string" ? payload.error : tAssistant("publishFailed"),
          } as AssistantMessage,
        ]);
        return;
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: payload?.postId ? tAssistant("publishSuccess") : tAssistant("publishSuccessFallback"),
        } as AssistantMessage,
      ]);
      setDraftState(null);
      setConversationSummary(null);
      router.refresh();
    } catch {
      setMessages((current) => [...current, { role: "assistant", content: tAssistant("publishFailed") } as AssistantMessage]);
    } finally {
      setIsSending(false);
      if (!open) setHasUnread(true);
    }
  }

  async function handleQuickAction(action: string) {
    if (chatDisabled || isSending) return;
    if (draftState?.readyForReview && isConfirmDraftMessage(action)) {
      await confirmDraft(action);
      return;
    }
    await sendMessage(action);
  }

  if (!mounted || hidden) return null;

  const capturedFields = draftState ? getCapturedFields(draftState, language) : [];

  return createPortal(
    <>
      <AnimatePresence>
        {open ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-[calc(env(safe-area-inset-bottom)+5.25rem)] right-4 z-[70] flex w-[calc(100vw-2rem)] max-h-[min(78vh,40rem)] max-w-[380px] flex-col overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-soft md:bottom-[calc(env(safe-area-inset-bottom)+1rem)] max-[479px]:inset-x-0 max-[479px]:bottom-0 max-[479px]:top-[env(safe-area-inset-top)] max-[479px]:max-h-none max-[479px]:w-screen max-[479px]:max-w-none max-[479px]:rounded-none"
            exit={{ opacity: 0, y: 16 }}
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
          >
            <div className="shrink-0 border-b border-border bg-card">
              <div className="flex items-center justify-between px-4 py-3 max-[479px]:pt-[calc(env(safe-area-inset-top)+0.75rem)]">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-brand-soft text-brand">
                    <Bot className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{tAssistant("title")}</p>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em]",
                          aiActive ? "border-brand/25 bg-brand-soft text-brand" : "border-border bg-muted/40 text-muted-foreground",
                        )}
                        >
                          <span className={cn("size-1.5 rounded-full", aiActive ? "bg-brand" : "bg-muted-foreground")} />
                        {aiActive ? "AI active" : "Direct"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{tAssistant("subtitle")}</p>
                  </div>
                </div>
                <Button aria-label="Close assistant" className="size-11" size="icon" type="button" variant="ghost" onClick={() => setOpen(false)}>
                  <X className="size-4" />
                </Button>
              </div>

              <div className="px-4 pb-3">
                <LanguageSelector
                  value={language}
                  onChange={(nextLanguage) => {
                    if (nextLanguage === language) return;
                    setLanguage(nextLanguage);
                    setMessages((current) => [
                      ...current,
                      {
                        role: "system",
                        content: tAssistant("languageChanged", { language: getLanguageLabel(nextLanguage) }),
                      } as AssistantMessage,
                    ]);
                  }}
                />
              </div>

              <div className="flex flex-wrap gap-2 px-4 pb-4">
                <p className="w-full text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {tAssistant("quickPromptLabel")}
                </p>
                {quickActions.map((action) => (
                  <Button
                    key={action}
                    className="h-8 rounded-full border border-border bg-background/80 px-3 text-xs font-medium text-foreground hover:bg-brand-soft"
                    disabled={chatDisabled || isSending}
                    type="button"
                    variant="outline"
                    onClick={() => void handleQuickAction(action)}
                  >
                    {action}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col bg-muted/30">
              <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
                {messages.map((message, index) => (
                  <ChatMessage key={`${message.role}-${index}`} content={message.content} role={message.role} />
                ))}

                {eligiblePosts.length ? (
                  <div className="space-y-2 rounded-[1.25rem] border border-border bg-card p-3">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Sparkles className="size-4 text-brand" />
                      {tAssistant("eligiblePostsTitle")}
                    </div>
                    <div className="space-y-2">
                      {eligiblePosts.map((post) => (
                        <Link
                          key={post.id}
                          className="block rounded-2xl border border-border bg-muted/20 px-3 py-2 transition hover:border-brand/40 hover:bg-brand-soft/30"
                          href={post.link}
                        >
                          <p className="font-medium text-foreground">{post.patient_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {post.hospital_name} - {post.city}, {post.state}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {post.blood_type_needed} - {post.units_needed} unit{post.units_needed === 1 ? "" : "s"}
                            {post.required_by ? ` - ${post.required_by}` : ""}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}

                {draftState ? (
                  <div className="space-y-3 rounded-[1.25rem] border border-border bg-card p-3">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Bot className="size-4 text-brand" />
                      {tAssistant("draftReviewTitle")}
                    </div>
                    <p className="break-words text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{draftState.summary}</p>

                    {draftState.auditSummary ? (
                      <div className="rounded-2xl border border-border bg-muted/20 p-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Audit summary</p>
                        <p className="break-words text-sm leading-relaxed text-foreground whitespace-pre-wrap">{draftState.auditSummary}</p>
                      </div>
                    ) : null}

                    {draftState.fieldChecklist?.length ? (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          {tAssistant("draftChecklistTitle")}
                        </p>
                        <div className="space-y-2">
                          {draftState.fieldChecklist.map((field) => (
                            <div
                              key={field.field}
                              className={cn(
                                "min-w-0 rounded-2xl border px-3 py-3 overflow-hidden",
                                field.missing ? "border-warning/30 bg-warning/10" : "border-border bg-muted/20",
                              )}
                            >
                              <div className="flex items-start gap-2">
                                <span
                                  className={cn(
                                    "mt-1 size-2 shrink-0 rounded-full",
                                    field.missing ? "bg-warning" : "bg-brand",
                                  )}
                                  aria-hidden="true"
                                />
                                <div className="min-w-0 flex-1 space-y-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="min-w-0 break-words text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                      {field.label}
                                    </p>
                                    <span
                                      className={cn(
                                        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em]",
                                        field.missing ? "bg-warning/20 text-foreground" : "bg-brand-soft text-brand",
                                      )}
                                    >
                                      {field.missing ? tAssistant("draftFieldMissing") : tAssistant("draftFieldFilled")}
                                    </span>
                                  </div>
                                  <p className="break-words text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                                    {field.missing ? field.prompt ?? tAssistant("draftHold") : field.value}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : capturedFields.length ? (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          {tAssistant("draftCapturedTitle")}
                        </p>
                        <div className="space-y-2">
                          {capturedFields.map((field) => (
                            <div key={field.field} className="min-w-0 rounded-2xl border border-border bg-muted/20 px-3 py-3 overflow-hidden">
                              <div className="flex items-start gap-2">
                                <span className="mt-1 size-2 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                                <div className="min-w-0 flex-1 space-y-1">
                                  <p className="break-words text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                    {field.label}
                                  </p>
                                  <p className="break-words text-sm leading-relaxed text-foreground whitespace-pre-wrap">{field.value}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {draftState.missingFields.length && !draftState.fieldChecklist?.length ? (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          {tAssistant("draftMissingLabel")}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {draftState.missingFields.map((field) => (
                            <span key={field} className="max-w-full rounded-full border border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground break-words whitespace-normal">
                              {field.replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {draftState.questions.length && !draftState.fieldChecklist?.length ? (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          {tAssistant("draftQuestionsLabel")}
                        </p>
                        <div className="space-y-1">
                          {draftState.questions.map((question) => (
                            <p key={question} className="break-words text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                              {question}
                            </p>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {draftState.blockedReason ? (
                      <p className="break-words whitespace-pre-wrap rounded-2xl border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-foreground">
                        {draftState.blockedReason}
                      </p>
                    ) : null}

                    {draftState.readyForReview && !draftState.blockedReason ? (
                      <div className="space-y-2">
                        <Button className="w-full rounded-2xl" disabled={isSending || chatDisabled} type="button" onClick={() => void confirmDraft()}>
                          Confirm post
                        </Button>
                        <p className="text-xs text-muted-foreground">{tAssistant("draftReadyHint")}</p>
                        <p className="text-xs text-muted-foreground">Type &quot;confirm post&quot; or click the button to submit.</p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">{tAssistant("draftHold")}</p>
                    )}
                  </div>
                ) : null}

                {chatDisabled ? (
                  <div className="break-words whitespace-pre-wrap rounded-[1.25rem] border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-foreground">
                    {chatDisabledReason ?? "Chat disabled for the current session."}
                  </div>
                ) : null}

                {isSending ? <ChatMessage content={tAssistant("loading")} role="system" /> : null}
                <div ref={messagesEndRef} />
              </div>

              <form
                className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-border bg-card px-4 py-4 max-[479px]:pb-[calc(env(safe-area-inset-bottom)+1.5rem)]"
                onSubmit={async (event) => {
                  event.preventDefault();
                  const trimmed = value.trim();
                  if (!trimmed) return;
                  if (draftState?.readyForReview && isConfirmDraftMessage(trimmed)) {
                    await confirmDraft(trimmed);
                    return;
                  }
                  await sendMessage(trimmed);
                }}
              >
                <Input
                  aria-label={tAssistant("title")}
                  className="min-w-0"
                  disabled={isSending || chatDisabled}
                  placeholder={chatDisabled ? "Chat disabled for this session" : tAssistant("placeholder")}
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                />
                <Button className="shrink-0 px-4" disabled={isSending || chatDisabled} type="submit">
                  {tAssistant("send")}
                </Button>
              </form>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        aria-label={open ? "Close Donorix assistant" : "Open Donorix assistant"}
        className={cn(
          "fixed bottom-[calc(env(safe-area-inset-bottom)+5.25rem)] right-4 z-[70] flex size-[52px] items-center justify-center rounded-full bg-brand text-brand-foreground shadow-glow transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:bottom-6",
          footerVisible && "md:bottom-24",
          open && "pointer-events-none invisible opacity-0",
        )}
        type="button"
        onClick={() => {
          setOpen((current) => !current);
          setHasUnread(false);
        }}
      >
        <MessageCircleMore className="size-5" />
        {hasUnread ? <span className="absolute right-1 top-1 size-2.5 rounded-full bg-danger" /> : null}
      </button>
    </>,
    document.body,
  );
}
