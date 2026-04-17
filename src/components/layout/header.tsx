"use client";

import Link from "next/link";
import { PlusSquare, Settings } from "lucide-react";

import { NotificationBell } from "@/components/notifications/notification-bell";
import { AppLogo } from "@/components/layout/app-logo";
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
    <header className="glass-panel z-40 flex items-center justify-between gap-4 rounded-[1.75rem] px-4 py-3 lg:sticky lg:top-4">
      <div className="min-w-0 flex-1">
        <AppLogo
          className="max-w-[26rem]"
          compact
          showTagline
          tagline={user?.account_type === "hospital" ? user.full_name : tHeader("donorTagline")}
        />
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
