"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { AppLogo } from "@/components/layout/app-logo";
import { APP_NAME, GRIEVANCE_EMAIL } from "@/lib/constants";

export function SiteFooter() {
  const t = useTranslations("footer");
  const quickLinks = [
    { href: "/", label: t("home") },
    { href: "/leaderboard", label: t("leaderboard") },
    { href: "/find", label: t("findToDonate") },
    { href: "/about", label: t("aboutUs") },
  ];

  const legalLinks = [
    { href: "/policies", label: t("policies") },
    { href: "/policies/terms", label: t("termsOfUse") },
    { href: "/policies/privacy", label: t("privacyPolicy") },
    { href: "/policies/grievance", label: t("contactGrievance") },
  ];

  return (
    <footer className="relative z-10 border-t border-border/70 bg-card pb-[calc(env(safe-area-inset-bottom)+6.5rem)] pt-10 lg:pb-10">
      <div className="mx-auto w-full max-w-[1900px] px-4 pt-6 lg:px-8 2xl:px-10">
        <div className="glass-panel rounded-[2rem] p-6 md:p-8">
          <div className="grid gap-8 border-b border-border/70 pb-8 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-4 xl:col-span-2">
              <AppLogo showTagline tagline={t("tagline")} />
              <p className="max-w-xl text-sm leading-6 text-muted-foreground">{t("sdg")}</p>
            </div>
            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">{t("quickLinks")}</h2>
              <nav className="grid gap-2 text-sm">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    className="rounded-xl px-2 py-1 text-muted-foreground transition hover:bg-brand-soft hover:text-brand"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">{t("legalSupport")}</h2>
              <div className="grid gap-2 text-sm">
                {legalLinks.map((link) => (
                  <Link
                    key={link.href}
                    className="rounded-xl px-2 py-1 text-muted-foreground transition hover:bg-brand-soft hover:text-brand"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                ))}
                <a
                  className="rounded-xl px-2 py-1 text-muted-foreground transition hover:bg-brand-soft hover:text-brand"
                  href={`mailto:${GRIEVANCE_EMAIL}`}
                >
                  {GRIEVANCE_EMAIL}
                </a>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-6 text-sm text-muted-foreground">
            <p>{t("copyright")}</p>
            <p>{APP_NAME} demo experience</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
