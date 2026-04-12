import Link from "next/link";
import { Award, Bell, Home, MessageSquareHeart, PlusSquare } from "lucide-react";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/leaderboard", label: "Leaders", icon: Award },
  { href: "/posts/new", label: "Post", icon: PlusSquare },
  { href: "/notifications", label: "Alerts", icon: Bell },
  { href: "/chat", label: "AI", icon: MessageSquareHeart },
];

export function MobileNav() {
  return (
    <nav className="glass fixed inset-x-4 bottom-4 z-50 flex items-center justify-between px-4 py-2 lg:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-medium text-muted-foreground">
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
