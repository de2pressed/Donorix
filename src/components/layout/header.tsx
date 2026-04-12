"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import { useTranslations } from "next-intl";

import { NotificationBell } from "@/components/notifications/notification-bell";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/lib/hooks/use-notifications";
import { useUser } from "@/lib/hooks/use-user";

export function Header() {
  const tApp = useTranslations("app");
  const tNav = useTranslations("nav");
  const { data: user } = useUser();
  const { data: notifications = [] } = useNotifications({ enabled: Boolean(user) });
  const unreadCount = notifications.filter((notification) => !notification.read_at).length;

  return (
    <header className="glass sticky top-4 z-40 flex items-center justify-between gap-4 px-4 py-3">
      <div className="min-w-0 flex-1">
        <Link className="inline-flex min-w-0 items-center gap-3" href="/">
          <span className="shrink-0 text-lg font-semibold tracking-tight text-foreground">Donorix</span>
          <span className="hidden max-w-[18rem] min-w-0 truncate text-[clamp(0.8rem,0.85vw,0.95rem)] text-muted-foreground md:inline">
            {tApp("tagline")}
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        {user ? (
          <>
            <NotificationBell unreadCount={unreadCount} />
            <Button asChild aria-label={tNav("openSettings")} size="icon" variant="ghost">
              <Link href="/settings">
                <Settings className="size-4" />
              </Link>
            </Button>
          </>
        ) : null}
        <div className="hidden md:block">
          <ThemeToggle />
        </div>
        <UserMenu />
      </div>
    </header>
  );
}
