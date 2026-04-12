"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bot, MessageCircleMore, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { ChatMessage } from "@/components/chatbot/chat-message";
import { LanguageSelector } from "@/components/chatbot/language-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { INDIAN_LANGUAGES } from "@/lib/constants";

type AssistantMessage = { role: "assistant" | "user" | "system"; content: string };

const STORAGE_KEY = "donorix-assistant-messages";
const LANGUAGE_STORAGE_KEY = "donorix-assistant-language";

export function FloatingAssistant() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const tAssistant = useTranslations("assistant");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState<AssistantMessage[]>([
    { role: "assistant", content: tAssistant("intro") },
  ]);
  const [hasUnread, setHasUnread] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const languageNames = useMemo(
    () => Object.fromEntries(INDIAN_LANGUAGES.map((entry) => [entry.code, entry.label])),
    [],
  );

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
    const storedLanguage = window.sessionStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (storedLanguage) {
      setLanguage(storedLanguage);
    }

    const storedMessages = window.sessionStorage.getItem(STORAGE_KEY);
    if (!storedMessages) {
      setMessages([{ role: "assistant", content: tAssistant("intro") }]);
      return;
    }

    try {
      const parsed = JSON.parse(storedMessages) as AssistantMessage[];
      if (parsed.length) {
        setMessages(parsed);
        return;
      }
    } catch {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }

    setMessages([{ role: "assistant", content: tAssistant("intro") }]);
  }, [tAssistant]);

  useEffect(() => {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    window.sessionStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    if (!open) return;
    setHasUnread(false);
    messagesEndRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "end" });
  }, [messages, open, reduceMotion]);

  if (hidden) return null;

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] right-4 z-[70] flex w-[calc(100vw-2rem)] max-w-[360px] flex-col overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-soft max-[479px]:inset-x-0 max-[479px]:bottom-0 max-[479px]:top-[env(safe-area-inset-top)] max-[479px]:w-screen max-[479px]:max-w-none max-[479px]:rounded-none"
            exit={{ opacity: 0, y: 16 }}
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-4 py-3 max-[479px]:pt-[calc(env(safe-area-inset-top)+0.75rem)]">
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

            <div className="border-b border-border px-4 py-3">
              <LanguageSelector
                value={language}
                onChange={(nextLanguage) => {
                  if (nextLanguage === language) return;
                  setLanguage(nextLanguage);
                  setMessages((current) => [
                    ...current,
                    {
                      role: "system",
                      content: tAssistant("languageChanged", {
                        language: languageNames[nextLanguage] ?? nextLanguage,
                      }),
                    },
                  ]);
                }}
              />
            </div>

            <div className="flex h-[420px] flex-1 flex-col gap-3 overflow-y-auto bg-muted/30 px-4 py-4 max-[479px]:h-auto max-[479px]:min-h-0">
              {messages.map((message, index) => (
                <ChatMessage key={`${message.role}-${index}`} content={message.content} role={message.role} />
              ))}
              {isSending ? <ChatMessage content={tAssistant("loading")} role="system" /> : null}
              <div ref={messagesEndRef} />
            </div>

            <form
              className="flex items-center gap-3 border-t border-border bg-card px-4 py-4 max-[479px]:pb-[calc(env(safe-area-inset-bottom)+1rem)]"
              onSubmit={async (event) => {
                event.preventDefault();
                if (!value.trim() || isSending) return;

                const question = value.trim();
                setValue("");
                setIsSending(true);
                setMessages((current) => [...current, { role: "user", content: question }]);

                try {
                  const response = await fetch("/api/chatbot", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ message: question, language }),
                  });

                  const payload = (await response.json().catch(() => null)) as { reply?: string } | null;
                  const reply = response.ok ? payload?.reply : null;

                  setMessages((current) => [
                    ...current,
                    {
                      role: "assistant",
                      content: reply || tAssistant("fallback"),
                    },
                  ]);
                } catch {
                  setMessages((current) => [
                    ...current,
                    {
                      role: "assistant",
                      content: tAssistant("fallback"),
                    },
                  ]);
                } finally {
                  setIsSending(false);
                  if (!open) setHasUnread(true);
                }
              }}
            >
              <Input
                aria-label={tAssistant("title")}
                placeholder={tAssistant("placeholder")}
                value={value}
                onChange={(event) => setValue(event.target.value)}
              />
              <Button disabled={isSending} type="submit">
                {tAssistant("send")}
              </Button>
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        aria-label={open ? "Close Donorix assistant" : "Open Donorix assistant"}
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+10.5rem)] right-4 z-[65] flex size-[52px] items-center justify-center rounded-full bg-brand text-brand-foreground shadow-glow transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:bottom-6 lg:right-6"
        type="button"
        onClick={() => {
          setOpen((current) => !current);
          setHasUnread(false);
        }}
      >
        <MessageCircleMore className="size-5" />
        {hasUnread ? <span className="absolute right-1 top-1 size-2.5 rounded-full bg-danger" /> : null}
      </button>
    </>
  );
}
