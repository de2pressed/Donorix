import { sanitizeText } from "@/lib/utils/sanitize";

export const ASSISTANT_LANGUAGE_NAMES = {
  en: "English",
  hi: "हिन्दी",
  bn: "বাংলা",
  te: "తెలుగు",
  mr: "मराठी",
  ta: "தமிழ்",
  gu: "ગુજરાતી",
  kn: "ಕನ್ನಡ",
  ml: "മലയാളം",
  pa: "ਪੰਜਾਬੀ",
  or: "ଓଡ଼ିଆ",
  ur: "اردو",
} as const;

export type AssistantLanguage = keyof typeof ASSISTANT_LANGUAGE_NAMES;

const LANGUAGE_SCRIPT_RULES: Array<{ code: Exclude<AssistantLanguage, "en">; pattern: RegExp }> = [
  { code: "hi", pattern: /[\u0900-\u097F]/ },
  { code: "bn", pattern: /[\u0980-\u09FF]/ },
  { code: "te", pattern: /[\u0C00-\u0C7F]/ },
  { code: "mr", pattern: /[\u0900-\u097F]/ },
  { code: "ta", pattern: /[\u0B80-\u0BFF]/ },
  { code: "gu", pattern: /[\u0A80-\u0AFF]/ },
  { code: "kn", pattern: /[\u0C80-\u0CFF]/ },
  { code: "ml", pattern: /[\u0D00-\u0D7F]/ },
  { code: "pa", pattern: /[\u0A00-\u0A7F]/ },
  { code: "or", pattern: /[\u0B00-\u0B7F]/ },
  { code: "ur", pattern: /[\u0600-\u06FF]/ },
];

const LATIN_WORD_PATTERN = /\b[A-Za-z][A-Za-z'’-]*\b/g;
const ALLOWED_LATIN_TOKENS = new Set([
  "donorix",
  "ai",
  "a+",
  "a-",
  "b+",
  "b-",
  "ab+",
  "ab-",
  "o+",
  "o-",
  "112",
]);

export function isAssistantLanguage(value: string | undefined | null): value is AssistantLanguage {
  return Boolean(value && value in ASSISTANT_LANGUAGE_NAMES);
}

export function detectAssistantLanguage(message: string) {
  for (const rule of LANGUAGE_SCRIPT_RULES) {
    if (rule.pattern.test(message)) {
      return rule.code;
    }
  }

  return null;
}

export function resolveAssistantLanguage(preferredLanguage: string | undefined, latestMessage: string): AssistantLanguage {
  const detected = detectAssistantLanguage(latestMessage);
  if (detected) {
    return detected;
  }

  if (isAssistantLanguage(preferredLanguage)) {
    return preferredLanguage;
  }

  return "en";
}

export function getAssistantLanguageName(language: AssistantLanguage) {
  return ASSISTANT_LANGUAGE_NAMES[language];
}

export function isAssistantReplyStrictlyInLanguage(language: AssistantLanguage, text: string) {
  const cleaned = sanitizeText(text).trim();
  if (!cleaned) {
    return false;
  }

  if (language === "en") {
    return !LANGUAGE_SCRIPT_RULES.some((rule) => rule.pattern.test(cleaned));
  }

  const rule = LANGUAGE_SCRIPT_RULES.find((entry) => entry.code === language);
  if (!rule) {
    return false;
  }

  if (!rule.pattern.test(cleaned)) {
    return false;
  }

  const latinWords = cleaned.match(LATIN_WORD_PATTERN) ?? [];
  const disallowedLatinWords = latinWords.filter((word) => !ALLOWED_LATIN_TOKENS.has(word.toLowerCase()));
  return disallowedLatinWords.length === 0;
}
