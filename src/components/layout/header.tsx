"use client";

import Link from "next/link";
import { Settings, ShieldCheck } from "lucide-react";

import { NotificationBell } from "@/components/notifications/notification-bell";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="glass sticky top-4 z-40 flex items-center justify-between gap-4 px-4 py-3">
      <div className="min-w-0">
        <Link className="inline-flex items-center gap-3" href="/">
          <span className="text-lg font-semibold tracking-tight text-foreground">Donorix</span>
          <span className="hidden text-sm text-muted-foreground md:inline">
            Faster blood coordination across India
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-full border border-success/30 bg-success/10 px-4 py-2 text-sm text-success lg:flex">
          <ShieldCheck className="size-4" />
          Verified network
        </div>
        <Button asChild className="hidden md:inline-flex" size="sm">
          <Link href="/posts/new">New Request</Link>
        </Button>
        <NotificationBell />
        <Button asChild aria-label="Open settings" size="icon" variant="ghost">
          <Link href="/settings">
            <Settings className="size-4" />
          </Link>
        </Button>
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
