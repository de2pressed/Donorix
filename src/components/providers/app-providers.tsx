"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { Toaster } from "sonner";

import { AuthPromptProvider } from "@/components/shared/auth-prompt-modal";
import { CookieConsentBanner } from "@/components/shared/cookie-consent-banner";
import { DisclaimerModal } from "@/components/shared/disclaimer-modal";
import { OfflineBanner } from "@/components/shared/offline-banner";

type AppProvidersProps = {
  children: React.ReactNode;
  locale: string;
  messages: Record<string, string>;
};

export function AppProviders({ children, locale, messages }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <QueryClientProvider client={queryClient}>
          <AuthPromptProvider>
            <OfflineBanner />
            <DisclaimerModal />
            <CookieConsentBanner />
            {children}
          </AuthPromptProvider>
          <Toaster position="top-right" richColors />
        </QueryClientProvider>
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}
