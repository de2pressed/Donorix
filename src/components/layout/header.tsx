import Link from "next/link";
import { MoonStar, Search, ShieldCheck, SunMedium } from "lucide-react";

import { NotificationBell } from "@/components/notifications/notification-bell";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="glass sticky top-4 z-40 flex items-center justify-between gap-4 px-4 py-3">
      <div className="flex flex-1 items-center gap-3 rounded-full border border-border bg-card/70 px-4 py-3 text-sm text-muted-foreground">
        <Search className="size-4" />
        Search by hospital, blood type, city, or condition
      </div>
      <div className="hidden items-center gap-3 md:flex">
        <div className="rounded-full border border-border bg-card/80 p-3 text-muted-foreground">
          <SunMedium className="size-4 dark:hidden" />
          <MoonStar className="hidden size-4 dark:block" />
        </div>
        <div className="flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-4 py-2 text-sm text-success">
          <ShieldCheck className="size-4" />
          Verified network
        </div>
      </div>
      <NotificationBell />
      <Button asChild size="sm">
        <Link href="/posts/new">New Request</Link>
      </Button>
    </header>
  );
}
