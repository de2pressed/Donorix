"use client";

import Link from "next/link";
import { Award, Bell, FileText, HeartHandshake, Home, PlusSquare, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

import { MAIN_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";

const icons = [Home, Award, PlusSquare, Bell, FileText];

export function Sidebar() {
  const pathname = usePathname();
  const tNav = useTranslations("nav");
  const tSidebar = useTranslations("sidebar");
  const labels = [tNav("home"), tNav("leaderboard"), tNav("request"), tNav("notifications"), tNav("policies")];

  return (
    <aside className="glass sticky top-6 hidden h-[calc(100vh-3rem)] w-[15.5rem] shrink-0 flex-col justify-between overflow-hidden p-5 lg:flex">
      <div className="space-y-8">
        <div className="space-y-3">
          <Badge className="w-fit" variant="danger">
            {tSidebar("badge")}
          </Badge>
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-glow">
              <HeartHandshake className="size-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Donorix</h1>
              <p className="text-sm text-muted-foreground">{tSidebar("subtitle")}</p>
            </div>
          </div>
        </div>
        <nav className="space-y-2">
          {MAIN_NAV.map((item, index) => {
            const Icon = icons[index];
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-brand-soft hover:text-brand",
                  pathname === item.href && "bg-brand-soft text-brand",
                )}
              >
                <Icon className="size-4" />
                {labels[index]}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="space-y-4">
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
          <p className="text-sm font-medium">{tSidebar("emergencyTitle")}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {tSidebar("emergencyBody")}
          </p>
        </div>
      </div>
    </aside>
  );
}
