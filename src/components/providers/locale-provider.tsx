"use client";

import type { AbstractIntlMessages } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import { createContext, useContext, useState } from "react";

type LocaleProviderProps = {
  children: React.ReactNode;
  initialLocale: string;
  initialMessages: AbstractIntlMessages;
};

type LocaleContextValue = {
  locale: string;
  setLocalePreference: (nextLocale: string) => Promise<void>;
};

const LocalePreferenceContext = createContext<LocaleContextValue | null>(null);

const messageLoaders = {
  en: () => import("../../../messages/en.json").then((module) => module.default),
  hi: () => import("../../../messages/hi.json").then((module) => module.default),
} as const;

export function LocalePreferenceProvider({
  children,
  initialLocale,
  initialMessages,
}: LocaleProviderProps) {
  const [locale, setLocale] = useState(initialLocale);
  const [messages, setMessages] = useState<AbstractIntlMessages>(initialMessages);

  const value: LocaleContextValue = {
    locale,
    async setLocalePreference(nextLocale) {
      const supportedLocale = nextLocale in messageLoaders ? (nextLocale as keyof typeof messageLoaders) : "en";
      const nextMessages = await messageLoaders[supportedLocale]();

      setLocale(supportedLocale);
      setMessages(nextMessages);
      document.cookie = `donorix_locale=${supportedLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
      document.documentElement.lang = supportedLocale;
    },
  };

  return (
    <LocalePreferenceContext.Provider value={value}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </LocalePreferenceContext.Provider>
  );
}

export function useLocalePreference() {
  const context = useContext(LocalePreferenceContext);

  if (!context) {
    throw new Error("useLocalePreference must be used within LocalePreferenceProvider");
  }

  return context;
}
