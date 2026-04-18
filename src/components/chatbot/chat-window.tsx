"use client";

import { SendHorizonal } from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";

import { ChatMessage } from "@/components/chatbot/chat-message";
import { LanguageSelector } from "@/components/chatbot/language-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ChatEntry = {
  role: "assistant" | "user";
  content: string;
  createdAt: string;
};

export function ChatWindow() {
  const [language, setLanguage] = useState("en");
  const [messages, setMessages] = useState<ChatEntry[]>([
    {
      role: "assistant",
      content: "Ask me anything about Donorix or whatever you're trying to figure out.",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!textareaRef.current) {
      return;
    }

    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }, [value]);

  return (
    <Card className="overflow-hidden p-0">
      <CardHeader className="flex flex-row items-center justify-between px-4 py-2.5">
        <CardTitle className="text-sm font-semibold">AI blood assistant</CardTitle>
        <div className="w-44">
          <LanguageSelector value={language} onChange={setLanguage} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 !p-0">
        <div className="chat-scroll flex h-[420px] flex-col gap-2 overflow-y-auto rounded-[1.5rem] border border-border bg-surface-2/60 p-3">
          {messages.map((message, index) => (
            <ChatMessage
              key={`${message.role}-${index}`}
              content={message.content}
              createdAt={message.createdAt}
              role={message.role}
            />
          ))}
        </div>
        <form
          className="mx-3 mb-3 flex items-end gap-2 rounded-xl glass-panel px-3 py-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (!value.trim()) return;

            const timestamp = new Date().toISOString();
            setMessages((current) => [
              ...current,
              { role: "user", content: value, createdAt: timestamp },
              {
                role: "assistant",
                content: "Ask me anything about Donorix or whatever you're trying to figure out.",
                createdAt: timestamp,
              },
            ]);
            setValue("");
            if (textareaRef.current) {
              textareaRef.current.style.height = "auto";
            }
          }}
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setValue(event.target.value)}
            placeholder="Ask anything in English, Hindi, or another supported language"
            className="max-h-24 flex-1 resize-none overflow-y-auto bg-transparent py-1 text-sm text-content-primary outline-none placeholder:text-content-secondary"
          />
          <Button
            aria-label="Send chat message"
            className="h-9 w-9 shrink-0 rounded-lg bg-red-600 p-0 text-white hover:bg-red-500"
            type="submit"
          >
            <SendHorizonal className="size-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
