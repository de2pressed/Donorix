import { sanitizeText } from "@/lib/utils/sanitize";

import type { ChatbotConversationMessage } from "@/lib/assistant/types";

export type AssistantSafetySignal = {
  shouldLock: boolean;
  reason: string | null;
  score: number;
  repeated: boolean;
  spammy: boolean;
  abusive: boolean;
  signals: string[];
};

const SPAM_KEYWORDS = [
  "whatsapp me",
  "telegram",
  "bitcoin",
  "crypto",
  "upi",
  "pay me",
  "sell blood",
  "buy blood",
  "click here",
  "link in bio",
  "contact me for money",
  "promo",
  "promo code",
];

const ABUSE_KEYWORDS = [
  "kill yourself",
  "go die",
  "i will hurt",
  "i will kill",
  "bomb",
  "terror",
  "hate you",
  "racist",
  "threat",
];

function normalizeForComparison(value: string) {
  return sanitizeText(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countUrls(value: string) {
  return (value.match(/https?:\/\/|www\./gi) ?? []).length;
}

function getRecentUserMessages(messages: ChatbotConversationMessage[] | undefined) {
  return (messages ?? [])
    .filter((entry) => entry.role === "user")
    .slice(-6)
    .map((entry) => normalizeForComparison(entry.content));
}

export function evaluateAssistantSafety({
  message,
  messages,
  userMessageCount = 0,
}: {
  message: string;
  messages?: ChatbotConversationMessage[];
  userMessageCount?: number;
}): AssistantSafetySignal {
  const cleaned = normalizeForComparison(message);
  const recentUserMessages = getRecentUserMessages(messages);
  const signals: string[] = [];
  let score = 0;

  if (!cleaned || cleaned.length < 2) {
    signals.push("empty-or-trivial");
    score += 3;
  }

  if (/^([!?.,\-\s_])+$/u.test(cleaned)) {
    signals.push("punctuation-spam");
    score += 3;
  }

  const repeatedCount = recentUserMessages.filter((entry) => entry === cleaned).length;
  if (repeatedCount >= 2) {
    signals.push("repeated-message");
    score += 4;
  }

  if (cleaned.length < 8 && userMessageCount > 4) {
    signals.push("short-burst");
    score += 1;
  }

  const urlCount = countUrls(message);
  if (urlCount >= 2) {
    signals.push("link-spam");
    score += 3;
  }

  if (SPAM_KEYWORDS.some((keyword) => cleaned.includes(keyword))) {
    signals.push("spam-keyword");
    score += 2;
  }

  if (ABUSE_KEYWORDS.some((keyword) => cleaned.includes(keyword))) {
    signals.push("abuse-keyword");
    score += 3;
  }

  const abusive = signals.includes("abuse-keyword");
  const earlyConversation = userMessageCount < 3;
  const shouldLock = abusive || (!earlyConversation && repeatedCount >= 2) || (!earlyConversation && score >= 6);
  const spammy = signals.some((signal) => signal.includes("spam") || signal.includes("burst"));

  let reason: string | null = null;
  if (shouldLock) {
    if (abusive) {
      reason = "Harassment or threat behavior was detected.";
    } else if (spammy || repeatedCount >= 2) {
      reason = "Repeated spam or flood behavior was detected.";
    } else {
      reason = "This chat has been disabled for the current conversation.";
    }
  }

  return {
    shouldLock,
    reason,
    score,
    repeated: repeatedCount >= 2,
    spammy,
    abusive,
    signals,
  };
}

export function isLikelySpamSession(signal: AssistantSafetySignal) {
  return signal.shouldLock;
}
