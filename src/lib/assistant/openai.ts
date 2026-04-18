import { env } from "@/lib/env";
import { sanitizeText } from "@/lib/utils/sanitize";

import type { AssistantLanguage } from "@/lib/assistant/language";
import type { ChatbotConversationMessage } from "@/lib/assistant/types";

type OpenAIChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type OpenAIChatOptions = {
  models: string[];
  messages: OpenAIChatMessage[];
  maxTokens?: number;
  temperature?: number;
  responseFormat?: { type: "json_object" };
};

export async function callAssistantOpenAI({
  models,
  messages,
  maxTokens = 320,
  temperature = 0.4,
  responseFormat,
}: OpenAIChatOptions) {
  if (!env.OPENAI_API_KEY || !models.length) {
    return null;
  }

  for (const model of models) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: maxTokens,
          temperature,
          ...(responseFormat ? { response_format: responseFormat } : {}),
        }),
      });

      if (!response.ok) {
        continue;
      }

      const payload = (await response.json().catch(() => null)) as
        | {
            choices?: Array<{
              message?: {
                content?: string | null;
              };
            }>;
          }
        | null;

      const content = payload?.choices?.[0]?.message?.content?.trim();
      if (content) {
        return {
          content,
          model,
        };
      }
    } catch {
      continue;
    }
  }

  return null;
}

export function buildConversationTranscript({
  summary,
  messages,
  latestMessage,
  maxTurns = 18,
}: {
  summary?: string | null;
  messages?: ChatbotConversationMessage[];
  latestMessage: string;
  maxTurns?: number;
}) {
  const trimmed = (messages ?? []).slice(-maxTurns);
  const lines: string[] = [];

  if (summary?.trim()) {
    lines.push(`SUMMARY: ${sanitizeText(summary)}`);
  }

  if (trimmed.length) {
    lines.push("RECENT MESSAGES:");
    for (const entry of trimmed) {
      lines.push(`${entry.role.toUpperCase()}: ${sanitizeText(entry.content)}`);
    }
  }

  lines.push(`USER: ${sanitizeText(latestMessage)}`);
  return lines.join("\n");
}

export function buildAssistantLanguageHint(language: AssistantLanguage) {
  return language === "en" ? "English" : language;
}
