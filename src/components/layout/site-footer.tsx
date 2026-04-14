import Link from "next/link";
import { HeartHandshake } from "lucide-react";

import { APP_NAME, GRIEVANCE_EMAIL } from "@/lib/constants";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/find", label: "Find to Donate" },
  { href: "/about", label: "About Us" },
];

const legalLinks = [
  { href: "/policies", label: "Policies" },
  { href: "/policies/terms", label: "Terms of Use" },
  { href: "/policies/privacy", label: "Privacy Policy" },
  { href: "/policies/grievance", label: "Contact / Grievance" },
];

export function SiteFooter() {
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
                <p className="text-sm text-muted-foreground">
                  The Modern Indian Blood Donation Platform
                </p>
              </div>
            </Link>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Aligned with SDG 3: Good Health and Well-being</p>
              <p>Copyright 2025 Donorix. All rights reserved.</p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
              Quick Links
            </h2>
            <nav className="grid gap-2 text-sm">
              {quickLinks.map((link) => (
                <Link key={link.href} className="text-muted-foreground hover:text-brand" href={link.href}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
              Legal & Support
            </h2>
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
