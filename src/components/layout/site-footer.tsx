"use client";

import Link from "next/link";
import { HeartHandshake } from "lucide-react";
import { useTranslations } from "next-intl";

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
    <footer className="border-t border-border/70 bg-card">
      <div className="mx-auto w-full max-w-[1900px] px-4 pb-[calc(env(safe-area-inset-bottom)+6.75rem)] pt-10 lg:px-8 lg:pb-10 2xl:px-10">
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-4">
            <Link className="inline-flex items-center gap-3" href="/">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-glow">
                <HeartHandshake className="size-5" />
              </span>
              <div>
                <p className="text-lg font-semibold tracking-tight">{APP_NAME}</p>
                <p className="text-sm text-muted-foreground">{t("tagline")}</p>
              </div>
            </Link>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>{t("sdg")}</p>
              <p>{t("copyright")}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">{t("quickLinks")}</h2>
            <nav className="grid gap-2 text-sm">
              {quickLinks.map((link) => (
                <Link key={link.href} className="text-muted-foreground hover:text-brand" href={link.href}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">{t("legalSupport")}</h2>
            <div className="grid gap-2 text-sm">
              {legalLinks.map((link) => (
                <Link key={link.href} className="text-muted-foreground hover:text-brand" href={link.href}>
                  {link.label}
                </Link>
              ))}
              <a className="text-muted-foreground hover:text-brand" href={`mailto:${GRIEVANCE_EMAIL}`}>
                {GRIEVANCE_EMAIL}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
