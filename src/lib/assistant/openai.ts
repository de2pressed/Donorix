import { env } from "@/lib/env";
import { sanitizeText } from "@/lib/utils/sanitize";

import { getAssistantLanguageName, type AssistantLanguage } from "@/lib/assistant/language";
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

type OpenAIResponsesPayload = {
  output_text?: string | null;
  output?: Array<{
    type?: string;
    content?: Array<
      | {
          type?: string;
          text?: string | null;
        }
      | null
    >;
  }>;
};

function toResponsesInput(messages: OpenAIChatMessage[]) {
  return messages.map((message) => ({
    role: message.role === "system" ? "developer" : message.role,
    content: message.content,
  }));
}

function extractResponseText(payload: OpenAIResponsesPayload | null) {
  const outputText = payload?.output_text?.trim();
  if (outputText) {
    return outputText;
  }

  for (const item of payload?.output ?? []) {
    for (const part of item.content ?? []) {
      const text = part?.text?.trim();
      if (text) {
        return text;
      }
    }
  }

  return null;
}

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
      const responsesResponse = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          input: toResponsesInput(messages),
          max_output_tokens: maxTokens,
          temperature,
          ...(responseFormat ? { text: { format: responseFormat } } : {}),
        }),
      });

      if (responsesResponse.ok) {
        const payload = (await responsesResponse.json().catch(() => null)) as OpenAIResponsesPayload | null;
        const content = extractResponseText(payload);
        if (content) {
          return {
            content,
            model,
          };
        }
      }

      const chatResponse = await fetch("https://api.openai.com/v1/chat/completions", {
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

      if (!chatResponse.ok) {
        continue;
      }

      const payload = (await chatResponse.json().catch(() => null)) as
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
  return getAssistantLanguageName(language);
}
