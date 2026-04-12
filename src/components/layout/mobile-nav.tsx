"use client";

import Link from "next/link";
import { Award, Bell, Home, PlusSquare, User2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/leaderboard", label: "Leaders", icon: Award },
  { href: "/posts/new", label: "Post", icon: PlusSquare },
  { href: "/notifications", label: "Alerts", icon: Bell },
  { href: "/profile", label: "Profile", icon: User2 },
];

export function MobileNav() {
  const pathname = usePathname();
  const tNav = useTranslations("nav");
  const labels = [tNav("home"), tNav("leadersShort"), tNav("postShort"), tNav("alertsShort"), tNav("profile")];

  return (
    <nav className="glass fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-50 flex items-center justify-between px-4 py-2 lg:hidden">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-w-0 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-medium text-muted-foreground transition hover:text-brand",
              (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)) &&
                "bg-brand-soft text-brand",
            )}
          >
            <Icon className="size-4" />
            {labels[index]}
          </Link>
        );
      })}
    </nav>
  );
}
