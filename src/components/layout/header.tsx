"use client";

import Link from "next/link";
import { PlusSquare, Settings } from "lucide-react";

import { NotificationBell } from "@/components/notifications/notification-bell";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { UserMenuErrorBoundary } from "@/components/layout/user-menu-error-boundary";
import { Button } from "@/components/ui/button";
import { useNotificationsContextSafe } from "@/components/providers/notification-context";
import { useUser } from "@/lib/hooks/use-user";
import { useTranslations } from "next-intl";

export function Header() {
  const { data: user } = useUser();
  const notifContext = useNotificationsContextSafe();
  const unreadCount = notifContext?.unreadCount ?? 0;
  const tNav = useTranslations("nav");
  const tHeader = useTranslations("header");

  return (
    <header className="glass-panel sticky top-4 z-40 flex items-center justify-between gap-4 rounded-[1.75rem] px-4 py-3">
      <div className="min-w-0 flex-1">
        <Link className="inline-flex min-w-0 items-center gap-3" href="/">
          <span className="shrink-0 text-lg font-semibold tracking-tight text-foreground">Donorix</span>
          <span className="hidden max-w-[18rem] min-w-0 truncate text-[clamp(0.8rem,0.85vw,0.95rem)] text-muted-foreground md:inline">
            {user?.account_type === "hospital"
              ? user.full_name
              : tHeader("donorTagline")}
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        {user ? (
          <>
            <NotificationBell unreadCount={unreadCount} />
            {user.account_type === "hospital" ? (
              <Button asChild className="hidden sm:inline-flex">
                <Link href="/posts/new">
                  <PlusSquare className="size-4" />
                  {tNav("newRequest")}
                </Link>
              </Button>
            ) : null}
            <Button asChild aria-label="Open settings" size="icon" variant="ghost">
              <Link href="/settings">
                <Settings className="size-4" />
              </Link>
            </Button>
          </>
        ) : null}
        <div className="hidden md:block">
          <ThemeToggle />
        </div>
        <UserMenuErrorBoundary isAuthenticated={Boolean(user)}>
          <UserMenu />
        </UserMenuErrorBoundary>
      </div>
    </header>
  );
}
