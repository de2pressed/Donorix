"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AbstractIntlMessages } from "next-intl";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { Toaster } from "sonner";

import { PageTransitionShell } from "@/components/layout/page-transition-shell";
import { LocalePreferenceProvider } from "@/components/providers/locale-provider";
import { ScrollReset } from "@/components/layout/scroll-reset";
import { AuthPromptProvider } from "@/components/shared/auth-prompt-modal";
import { CookieConsentBanner } from "@/components/shared/cookie-consent-banner";
import { DisclaimerModal } from "@/components/shared/disclaimer-modal";
import { OfflineBanner } from "@/components/shared/offline-banner";
import { TooltipProvider } from "@/components/ui/tooltip";

type AppProvidersProps = {
  children: React.ReactNode;
  locale: string;
  messages: AbstractIntlMessages;
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
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <LocalePreferenceProvider initialLocale={locale} initialMessages={messages}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider delayDuration={150}>
            <AuthPromptProvider>
              <ScrollReset />
              <OfflineBanner />
              <DisclaimerModal />
              <CookieConsentBanner />
              <PageTransitionShell>{children}</PageTransitionShell>
            </AuthPromptProvider>
          </TooltipProvider>
          <Toaster position="top-right" richColors />
        </QueryClientProvider>
      </LocalePreferenceProvider>
    </ThemeProvider>
  );
}
