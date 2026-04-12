"use client";

import { SendHorizonal } from "lucide-react";
import { useState } from "react";

import { ChatMessage } from "@/components/chatbot/chat-message";
import { LanguageSelector } from "@/components/chatbot/language-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function ChatWindow() {
  const [language, setLanguage] = useState("en");
  const [messages, setMessages] = useState<Array<{ role: "assistant" | "user"; content: string }>>([
    {
      role: "assistant" as const,
      content:
        "I can help you create a blood request, explain donor eligibility, or find matching posts in English or Hindi.",
    },
  ]);
  const [value, setValue] = useState("");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>AI blood assistant</CardTitle>
        <div className="w-44">
          <LanguageSelector value={language} onChange={setLanguage} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex h-[420px] flex-col gap-3 overflow-y-auto rounded-[1.5rem] border border-border bg-muted/40 p-4">
          {messages.map((message, index) => (
            <ChatMessage key={index} role={message.role} content={message.content} />
          ))}
        </div>
        <form
          className="flex gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!value.trim()) return;

            setMessages((current) => [
              ...current,
              { role: "user", content: value },
              {
                role: "assistant",
                content:
                  "The chatbot API route is ready. Connect your OpenAI key and Supabase Edge Function to replace this placeholder reply.",
              },
            ]);
            setValue("");
          }}
        >
          <Input value={value} onChange={(event) => setValue(event.target.value)} placeholder="Ask in English, Hindi, or another supported language" />
          <Button aria-label="Send chat message" type="submit">
            <SendHorizonal className="size-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
