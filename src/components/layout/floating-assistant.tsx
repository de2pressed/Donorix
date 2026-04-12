"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bot, MessageCircleMore, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { ChatMessage } from "@/components/chatbot/chat-message";
import { LanguageSelector } from "@/components/chatbot/language-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AssistantMessage = { role: "assistant" | "user"; content: string };

const STORAGE_KEY = "donorix-assistant-messages";
const DEFAULT_MESSAGE: AssistantMessage = {
  role: "assistant",
  content:
    "Ask me about donor eligibility, creating a request, or how Donorix works. I will keep this conversation for the current session.",
};

export function FloatingAssistant() {
  const pathname = usePathname();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState<AssistantMessage[]>([DEFAULT_MESSAGE]);
  const [hasUnread, setHasUnread] = useState(false);

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
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as AssistantMessage[];
      if (parsed.length) {
        setMessages(parsed);
      }
    } catch {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    setHasUnread(false);
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  if (hidden) return null;

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] right-4 z-[70] w-[calc(100vw-2rem)] max-w-[360px] overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-soft max-[479px]:left-4 max-[479px]:top-4 max-[479px]:bottom-4 max-[479px]:max-w-none"
            exit={{ opacity: 0, y: 16 }}
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-brand-soft text-brand">
                  <Bot className="size-5" />
                </div>
                <div>
                  <p className="font-semibold">Donorix Assistant</p>
                  <p className="text-xs text-muted-foreground">Session-aware help panel</p>
                </div>
              </div>
              <Button
                aria-label="Close assistant"
                size="icon"
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="border-b border-border px-5 py-4">
              <LanguageSelector value={language} onChange={setLanguage} />
            </div>

            <div className="flex h-[420px] flex-col gap-3 overflow-y-auto bg-muted/30 px-4 py-4 max-[479px]:h-[calc(100dvh-12rem)]">
              {messages.map((message, index) => (
                <ChatMessage key={`${message.role}-${index}`} content={message.content} role={message.role} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form
              className="flex items-center gap-3 border-t border-border px-4 py-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (!value.trim()) return;

                const question = value.trim();
                const response: AssistantMessage = {
                  role: "assistant",
                  content:
                    "The assistant is running in demo mode right now. It can keep your session conversation locally while the backend AI integration remains optional.",
                };

                setMessages((current) => [...current, { role: "user", content: question }, response]);
                setValue("");
                if (!open) setHasUnread(true);
              }}
            >
              <Input
                aria-label="Ask the Donorix assistant"
                placeholder="Ask about donation, requests, or policy"
                value={value}
                onChange={(event) => setValue(event.target.value)}
              />
              <Button type="submit">Send</Button>
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
