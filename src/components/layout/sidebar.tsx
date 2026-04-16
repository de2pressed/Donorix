"use client";

import Link from "next/link";
import { Building2, HeartHandshake, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { useUser } from "@/lib/hooks/use-user";
import { getSidebarNav, showRegisterHospitalButton } from "@/lib/navigation";
import { cn } from "@/lib/utils/cn";

function getSidebarLabel(
  href: string,
  accountType: string | null | undefined,
  t: (key: string) => string,
) {
  switch (href) {
    case "/":
      return accountType === "hospital" ? t("dashboard") : t("home");
    case "/posts/new":
      return t("newRequest");
    case "/hospital/posts":
      return t("patientPosts");
    case "/hospital/donors":
      return t("donors");
    case "/notifications":
      return t("notifications");
    case "/policies/terms":
      return t("policies");
    case "/about":
      return t("about");
    case "/find":
      return t("find");
    case "/leaderboard":
      return t("leaderboard");
    case "/settings":
      return t("settings");
    default:
      return href;
  }
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: user } = useUser();
  const tNav = useTranslations("nav");
  const tSidebar = useTranslations("sidebar");
  const items = getSidebarNav(user?.account_type).map((item) => ({
    ...item,
    label: getSidebarLabel(item.href, user?.account_type, tNav),
  }));
  const showRegisterHospital = showRegisterHospitalButton(user?.account_type);

  return (
    <aside className="glass sticky top-6 hidden h-[calc(100vh-3rem)] w-[15.5rem] shrink-0 flex-col justify-between overflow-hidden p-5 lg:flex">
      <div className="space-y-8">
        <div className="space-y-3">
          <Link className="inline-flex items-center gap-3" href="/">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-glow">
              <HeartHandshake className="size-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                {user?.account_type === "hospital" ? tSidebar("hospitalWorkspace") : tSidebar("donorWorkspace")}
              </p>
              <p className="text-sm text-muted-foreground">
                {user?.account_type === "hospital"
                  ? tSidebar("hospitalWorkspaceDesc")
                  : tSidebar("donorWorkspaceDesc")}
              </p>
            </div>
          </Link>
        </div>
        <nav className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-brand-soft hover:text-brand",
                  active && "bg-brand-soft text-brand",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="space-y-4">
        {showRegisterHospital ? (
          <Link
            className="flex items-center gap-3 rounded-2xl border border-brand/20 bg-brand-soft/60 px-4 py-3 text-sm font-medium text-brand transition hover:border-brand/40 hover:bg-brand-soft"
            href="/signup?account=hospital"
          >
            <Building2 className="size-4" />
            {tNav("registerHospital")}
          </Link>
        ) : null}
        <Link
          className={cn(
            "flex items-center gap-3 rounded-2xl border border-border bg-card/70 px-4 py-3 text-sm font-medium text-muted-foreground transition hover:border-brand/30 hover:bg-brand-soft hover:text-brand",
            pathname.startsWith("/settings") && "border-brand/30 bg-brand-soft text-brand",
          )}
          href="/settings"
        >
          <Settings className="size-4" />
          {tNav("settings")}
        </Link>
        <div className="rounded-[1.5rem] border border-border bg-card/60 p-4">
          <p className="text-sm font-medium">
            {user?.account_type === "hospital"
              ? tSidebar("hospitalOperations")
              : tSidebar("emergencyRouting")}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {user?.account_type === "hospital"
              ? tSidebar("hospitalOperationsDesc")
              : tSidebar("emergencyRoutingDesc")}
          </p>
        </div>
      </div>
    </aside>
  );
}
