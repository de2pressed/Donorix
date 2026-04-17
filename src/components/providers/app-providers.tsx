"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AbstractIntlMessages } from "next-intl";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { Toaster } from "sonner";

import { PageTransitionShell } from "@/components/layout/page-transition-shell";
import { FloatingAssistant } from "@/components/layout/floating-assistant";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NewPostFab } from "@/components/layout/new-post-fab";
import { SiteFooter } from "@/components/layout/site-footer";
import { AuthSessionBridge } from "@/components/providers/auth-session-bridge";
import { LocalePreferenceProvider } from "@/components/providers/locale-provider";
import { NotificationProvider } from "@/components/providers/notification-context";
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
          <AuthSessionBridge />
          <TooltipProvider delayDuration={150}>
            <AuthPromptProvider>
              <NotificationProvider>
                <ScrollReset />
                <OfflineBanner />
                <DisclaimerModal />
                <CookieConsentBanner />
                <div className="flex min-h-screen flex-col">
                  <div className="flex-1">
                    <PageTransitionShell>{children}</PageTransitionShell>
                  </div>
                  <SiteFooter />
                </div>
                <MobileNav />
                <NewPostFab />
                <FloatingAssistant />
              </NotificationProvider>
            </AuthPromptProvider>
          </TooltipProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              classNames: {
                toast:
                  "glass-panel !rounded-2xl !border !border-border !bg-transparent !px-4 !py-3 !text-sm !gap-3 !font-sans !text-foreground !shadow-lg",
                title: "!font-semibold !text-foreground",
                description: "!text-muted-foreground",
                success: "!border-[hsl(var(--success)/0.35)] [&>[data-icon]]:!text-[hsl(var(--success))]",
                error: "!border-[hsl(var(--danger)/0.35)] [&>[data-icon]]:!text-[hsl(var(--danger))]",
                warning: "!border-[hsl(var(--warning)/0.35)] [&>[data-icon]]:!text-[hsl(var(--warning))]",
                info: "!border-[hsl(var(--brand)/0.35)] [&>[data-icon]]:!text-[hsl(var(--brand))]",
                actionButton: "!bg-brand !text-brand-foreground !rounded-xl !text-xs !font-semibold",
                cancelButton: "!bg-muted !text-muted-foreground !rounded-xl !text-xs",
                closeButton: "!bg-card !border-border !text-muted-foreground hover:!text-foreground",
              },
            }}
          />
        </QueryClientProvider>
      </LocalePreferenceProvider>
    </ThemeProvider>
  );
}
