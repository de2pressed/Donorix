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
import { useUser } from "@/lib/hooks/use-user";
import { authenticatedFetch } from "@/lib/supabase/authenticated-fetch";
import { cn } from "@/lib/utils/cn";

type AssistantMessage = { role: "assistant" | "user" | "system"; content: string };
type Persona = "guest" | "donor" | "hospital";
type HospitalDraftState = {
  values: Record<string, unknown>;
  missingFields: string[];
  questions: string[];
  readyForReview: boolean;
  summary: string;
  blockedReason?: string | null;
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
  eligiblePosts?: EligiblePost[];
  draftState?: HospitalDraftState | null;
  reminder?: string | null;
};

const MESSAGE_STORAGE_PREFIX = "donorix-assistant-messages";
const DRAFT_STORAGE_PREFIX = "donorix-assistant-draft";
const LANGUAGE_STORAGE_KEY = "donorix-assistant-language";
export const ASSISTANT_OPEN_EVENT = "donorix-assistant:open";

function getStorageKey(prefix: string, scope: string) {
  return `${prefix}:${scope}`;
}

function countUserMessages(messages: AssistantMessage[]) {
  return messages.reduce((count, message) => count + (message.role === "user" ? 1 : 0), 0);
}

function getQuickActions(
  persona: Persona,
  pathname: string,
  tAssistant: (key: string, values?: Record<string, string | number>) => string,
) {
  if (persona === "hospital") {
    return [
      pathname.startsWith("/posts/new") ? tAssistant("hospitalQuickDraft") : tAssistant("hospitalQuickDraft"),
      tAssistant("hospitalQuickMissing"),
      tAssistant("hospitalQuickHow"),
    ];
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
  const reduceMotion = useReducedMotion();
  const tAssistant = useTranslations("assistant");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState<AssistantMessage[]>([
    { role: "assistant", content: tAssistant("intro") },
  ]);
  const [hasUnread, setHasUnread] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const [eligiblePosts, setEligiblePosts] = useState<EligiblePost[]>([]);
  const [draftState, setDraftState] = useState<HospitalDraftState | null>(null);
  const { data: currentUser } = useUser();

  const persona: Persona = currentUser?.account_type === "hospital" ? "hospital" : currentUser?.account_type === "donor" ? "donor" : "guest";
  const userScope = currentUser?.id ?? "guest";
  const messageStorageKey = useMemo(() => getStorageKey(MESSAGE_STORAGE_PREFIX, userScope), [userScope]);
  const draftStorageKey = useMemo(() => getStorageKey(DRAFT_STORAGE_PREFIX, userScope), [userScope]);
  const quickActions = useMemo(() => getQuickActions(persona, pathname, tAssistant), [persona, pathname, tAssistant]);

  const hidden = useMemo(
    () =>
      pathname.startsWith("/signup") ||
      pathname.startsWith("/policies") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/forgot-password") ||
      pathname.startsWith("/reset-password"),
    [pathname],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const footer = document.getElementById("site-footer");
    if (!footer || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setFooterVisible(Boolean(entry?.isIntersecting));
      },
      {
        root: null,
        threshold: 0.12,
      },
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, [mounted]);

  useEffect(() => {
    if (hidden) {
      setOpen(false);
    }
  }, [hidden]);

  useEffect(() => {
    if (!mounted) return;

    const storedLanguage = window.sessionStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (storedLanguage) {
      setLanguage(storedLanguage);
    }
  }, [mounted, userScope]);

  useEffect(() => {
    if (!mounted) return;

    const storedMessages = window.sessionStorage.getItem(messageStorageKey);
    if (!storedMessages) {
      setMessages([{ role: "assistant", content: tAssistant("intro") }]);
    } else {
      try {
        const parsed = JSON.parse(storedMessages) as AssistantMessage[];
        setMessages(parsed.length ? parsed : [{ role: "assistant", content: tAssistant("intro") }]);
      } catch {
        window.sessionStorage.removeItem(messageStorageKey);
        setMessages([{ role: "assistant", content: tAssistant("intro") }]);
      }
    }

    const storedDraft = window.sessionStorage.getItem(draftStorageKey);
    if (!storedDraft) {
      setDraftState(null);
      setEligiblePosts([]);
      return;
    }

    try {
      const parsedDraft = JSON.parse(storedDraft) as HospitalDraftState | null;
      setDraftState(parsedDraft);
    } catch {
      window.sessionStorage.removeItem(draftStorageKey);
      setDraftState(null);
    }
  }, [draftStorageKey, messageStorageKey, mounted, tAssistant]);

  useEffect(() => {
    if (!mounted) return;
    window.sessionStorage.setItem(messageStorageKey, JSON.stringify(messages));
  }, [messageStorageKey, messages, mounted]);

  useEffect(() => {
    if (!mounted) return;

    if (draftState) {
      window.sessionStorage.setItem(draftStorageKey, JSON.stringify(draftState));
    } else {
      window.sessionStorage.removeItem(draftStorageKey);
    }
  }, [draftState, draftStorageKey, mounted]);

  useEffect(() => {
    if (!mounted) return;
    window.sessionStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language, mounted]);

  useEffect(() => {
    if (!open) return;
    setHasUnread(false);
    messagesEndRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "end",
    });
  }, [messages, open, reduceMotion, draftState, eligiblePosts]);

  useEffect(() => {
    if (!mounted) return;

    function handleOpen() {
      setOpen(true);
      setHasUnread(false);
    }

    window.addEventListener(ASSISTANT_OPEN_EVENT, handleOpen);
    return () => window.removeEventListener(ASSISTANT_OPEN_EVENT, handleOpen);
  }, [mounted]);

  useEffect(() => {
    setEligiblePosts([]);
    if (persona !== "hospital") {
      setDraftState(null);
    }
  }, [persona]);

  async function sendMessage(rawMessage: string) {
    const question = rawMessage.trim();
    if (!question || isSending) return;

    const nextMessages = [...messages, { role: "user", content: question } as AssistantMessage];
    const nextUserMessageCount = countUserMessages(nextMessages);
    setMessages(nextMessages);
    setValue("");
    setIsSending(true);

    try {
      const response = await authenticatedFetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: question,
          language,
          persona,
          pathname,
          messages: nextMessages.slice(-8),
          draftState,
          userMessageCount: nextUserMessageCount,
        }),
        redirectOnAuthFailure: false,
      });

      const payload = (await response.json().catch(() => null)) as ChatbotResponse | { reply?: string } | null;
      const reply = response.ok && typeof payload?.reply === "string" && payload.reply.trim()
        ? payload.reply.trim()
        : tAssistant("fallback");

      const assistantMessages: AssistantMessage[] = [{ role: "assistant", content: reply }];
      if (response.ok && payload && "reminder" in payload && typeof payload.reminder === "string" && payload.reminder.trim()) {
        assistantMessages.push({ role: "system", content: payload.reminder.trim() });
      }

      setMessages((current) => [...current, ...assistantMessages]);

      if (response.ok && payload && "eligiblePosts" in payload) {
        setEligiblePosts(Array.isArray(payload.eligiblePosts) ? payload.eligiblePosts : []);
      } else if (persona !== "hospital") {
        setEligiblePosts([]);
      }

      if (response.ok && payload && "draftState" in payload) {
        setDraftState(payload.draftState ?? null);
      } else if (persona !== "hospital") {
        setDraftState(null);
      }
    } catch {
      setMessages((current) => [
        ...current,
        { role: "assistant", content: tAssistant("fallback") },
      ]);
      if (persona !== "hospital") {
        setEligiblePosts([]);
        setDraftState(null);
      }
    } finally {
      setIsSending(false);
      if (!open) setHasUnread(true);
    }
  }

  async function confirmDraft() {
    if (!draftState?.readyForReview || draftState.blockedReason || isSending) return;

    setIsSending(true);
    try {
      const response = await authenticatedFetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draftState.values),
        redirectOnAuthFailure: false,
      });

      const payload = (await response.json().catch(() => null)) as { postId?: string; error?: unknown } | null;
      if (!response.ok) {
        const errorMessage =
          typeof payload?.error === "string"
            ? payload.error
            : tAssistant("publishFailed");
        setMessages((current) => [
          ...current,
          { role: "assistant", content: errorMessage },
        ]);
        return;
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            payload?.postId
              ? tAssistant("publishSuccess")
              : tAssistant("publishSuccessFallback"),
        },
      ]);
      setDraftState(null);
      router.refresh();
    } catch {
      setMessages((current) => [
        ...current,
        { role: "assistant", content: tAssistant("publishFailed") },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  if (!mounted || hidden) {
    return null;
  }

  return createPortal(
    <>
      <AnimatePresence>
        {open ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-[calc(env(safe-area-inset-bottom)+5.25rem)] right-4 z-[45] flex w-[calc(100vw-2rem)] max-h-[min(78vh,40rem)] max-w-[380px] flex-col overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-soft md:bottom-[calc(env(safe-area-inset-bottom)+1rem)] max-[479px]:inset-x-0 max-[479px]:bottom-0 max-[479px]:top-[env(safe-area-inset-top)] max-[479px]:max-h-none max-[479px]:w-screen max-[479px]:max-w-none max-[479px]:rounded-none"
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
                    <p className="font-semibold">{tAssistant("title")}</p>
                    <p className="text-xs text-muted-foreground">{tAssistant("subtitle")}</p>
                  </div>
                </div>
                <Button
                  aria-label="Close assistant"
                  className="size-11"
                  size="icon"
                  type="button"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                >
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
                        content: tAssistant("languageChanged", { language: nextLanguage }),
                      },
                    ]);
                  }}
                />
              </div>

              <div className="flex flex-wrap gap-2 px-4 pb-4">
                {quickActions.map((action) => (
                  <Button
                    key={action}
                    className="h-8 rounded-full border border-border bg-background/80 px-3 text-xs font-medium text-foreground hover:bg-brand-soft"
                    type="button"
                    variant="outline"
                    onClick={() => void sendMessage(action)}
                  >
                    {action}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col bg-muted/30">
              <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
                {messages.map((message, index) => (
                  <ChatMessage
                    key={`${message.role}-${index}`}
                    content={message.content}
                    role={message.role}
                  />
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
                    <p className="text-sm text-muted-foreground">{draftState.summary}</p>

                    {draftState.missingFields.length ? (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          {tAssistant("draftMissingLabel")}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {draftState.missingFields.map((field) => (
                            <span
                              key={field}
                              className="rounded-full border border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground"
                            >
                              {field.replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {draftState.questions.length ? (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          {tAssistant("draftQuestionsLabel")}
                        </p>
                        <div className="space-y-1">
                          {draftState.questions.map((question) => (
                            <p key={question} className="text-sm text-foreground">
                              {question}
                            </p>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {draftState.blockedReason ? (
                      <p className="rounded-2xl border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-foreground">
                        {draftState.blockedReason}
                      </p>
                    ) : null}

                    {draftState.readyForReview && !draftState.blockedReason ? (
                      <Button
                        className="w-full rounded-2xl"
                        disabled={isSending}
                        type="button"
                        onClick={() => void confirmDraft()}
                      >
                        {tAssistant("confirmPost")}
                      </Button>
                    ) : (
                      <p className="text-xs text-muted-foreground">{tAssistant("draftHold")}</p>
                    )}
                  </div>
                ) : null}

                {isSending ? <ChatMessage content={tAssistant("loading")} role="system" /> : null}
                <div ref={messagesEndRef} />
              </div>

              <form
                className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-border bg-card px-4 py-4 max-[479px]:pb-[calc(env(safe-area-inset-bottom)+1rem)]"
                onSubmit={async (event) => {
                  event.preventDefault();
                  await sendMessage(value);
                }}
              >
                <Input
                  aria-label={tAssistant("title")}
                  className="min-w-0"
                  placeholder={tAssistant("placeholder")}
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                />
                <Button className="shrink-0 px-4" disabled={isSending} type="submit">
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
          "fixed bottom-[calc(env(safe-area-inset-bottom)+5.25rem)] right-4 z-[45] flex size-[52px] items-center justify-center rounded-full bg-brand text-brand-foreground shadow-glow transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:bottom-6",
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
