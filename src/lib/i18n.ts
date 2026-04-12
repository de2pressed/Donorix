import type { AbstractIntlMessages } from "next-intl";
import { cookies } from "next/headers";

export type SupportedLocale = "en" | "hi";

export type Messages = AbstractIntlMessages;

export async function getRequestLocale(): Promise<SupportedLocale> {
  const cookieStore = await cookies();
  return cookieStore.get("donorix_locale")?.value === "hi" ? "hi" : "en";
}

export async function getMessagesForLocale(locale: SupportedLocale): Promise<Messages> {
  if (locale === "hi") {
    const messages = await import("../../messages/hi.json");
    return messages.default as Messages;
  }

  const messages = await import("../../messages/en.json");
  return messages.default as Messages;
}

export async function getRequestMessages() {
  const locale = await getRequestLocale();
  const messages = await getMessagesForLocale(locale);

  return { locale, messages };
}

export function translate(messages: Messages, key: string) {
  const resolved = key
    .split(".")
    .reduce<unknown>((current, part) => (current && typeof current === "object" ? (current as Messages)[part] : undefined), messages);

  return typeof resolved === "string" ? resolved : key;
}
