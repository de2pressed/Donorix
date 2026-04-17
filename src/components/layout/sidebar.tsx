"use client";

import Link from "next/link";
import { Building2, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { useNotificationsContextSafe } from "@/components/providers/notification-context";
import { AppLogo } from "@/components/layout/app-logo";
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
    case "/hospital/chats":
    case "/donor/chats":
      return t("chats");
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
  const notifContext = useNotificationsContextSafe();
  const unreadCount = notifContext?.unreadCount ?? 0;
  const tNav = useTranslations("nav");
  const tSidebar = useTranslations("sidebar");
  const items = getSidebarNav(user?.account_type).map((item) => ({
    ...item,
    label: getSidebarLabel(item.href, user?.account_type, tNav),
  }));
  const showRegisterHospital = showRegisterHospitalButton(user?.account_type);

  return (
    <aside className="glass-panel sticky top-5 hidden h-[calc(100vh-2.5rem)] w-full min-w-0 shrink-0 flex-col justify-between overflow-hidden rounded-[1.75rem] p-4 min-[1100px]:flex xl:p-5">
      <div className="space-y-8">
        <div className="space-y-3">
          <AppLogo
            className="w-full"
            showTagline
            tagline={user?.account_type === "hospital" ? tSidebar("hospitalWorkspace") : tSidebar("donorWorkspace")}
          />
          <p className="text-sm text-muted-foreground">
            {user?.account_type === "hospital"
              ? tSidebar("hospitalWorkspaceDesc")
              : tSidebar("donorWorkspaceDesc")}
          </p>
        </div>
        <nav className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const showUnreadBadge = item.href === "/notifications" && unreadCount > 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-brand-soft hover:text-brand",
                  active && "bg-brand-soft text-brand",
                )}
              >
                <Icon className="size-4" />
                {item.label}
                {showUnreadBadge ? (
                  <span className="ml-auto flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white shadow-[0_0_6px_rgba(220,38,38,0.5)]">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : null}
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
        <div className="rounded-[1.5rem] border border-border bg-card p-4 shadow-soft">
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
