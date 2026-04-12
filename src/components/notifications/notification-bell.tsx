import Link from "next/link";
import { Bell } from "lucide-react";

export function NotificationBell({ unreadCount = 0 }: { unreadCount?: number }) {
  return (
    <Link
      href="/notifications"
      className="relative flex size-11 items-center justify-center rounded-full border border-border bg-card/80 text-foreground"
      aria-label="Open notifications"
    >
      <Bell className="size-4" />
      {unreadCount > 0 ? (
        <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-brand text-[10px] font-semibold text-brand-foreground">
          {Math.min(unreadCount, 9)}
        </span>
      ) : null}
    </Link>
  );
}
