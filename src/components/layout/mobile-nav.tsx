"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/hooks/use-user";
import { getBottomNav, getMoreNav } from "@/lib/navigation";
import { cn } from "@/lib/utils/cn";

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user } = useUser();
  const tNav = useTranslations("nav");
  const [moreOpen, setMoreOpen] = useState(false);
  const items = getBottomNav(user?.account_type, Boolean(user));
  const moreItems = getMoreNav(user?.account_type, Boolean(user));

  function getLabel(href: string) {
    switch (href) {
      case "/":
        return user?.account_type === "hospital" ? tNav("dashboard") : tNav("home");
      case "/posts/new":
        return tNav("newRequest");
      case "/hospital/posts":
        return tNav("patientPosts");
      case "/hospital/donors":
        return tNav("donors");
      case "/hospital/chats":
        return tNav("chats");
      case "/notifications":
        return tNav("notifications");
      case "/policies/terms":
        return tNav("policies");
      case "/about":
        return tNav("about");
      case "/find":
        return tNav("find");
      case "/leaderboard":
        return tNav("leaderboard");
      case "/settings":
        return tNav("settings");
      case "/profile":
        return tNav("profile");
      case "/login":
        return tNav("login");
      case "/signup":
        return tNav("signup");
      case "/signup?account=hospital":
        return tNav("registerHospital");
      case "#more":
        return tNav("more");
      default:
        return href;
    }
  }

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <>
      <nav className="glass-panel fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-[60] flex items-center justify-between rounded-[1.75rem] px-4 py-2 lg:hidden">
        {items.map((item) => {
          const Icon = item.icon;
          return item.href === "#more" ? (
            <button
              key={item.label}
              className="flex flex-1 min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-center text-[10px] font-medium leading-tight text-muted-foreground transition hover:text-brand max-[380px]:text-[9px]"
              type="button"
              onClick={() => setMoreOpen(true)}
            >
              <Icon className="size-4" />
              <span className="block w-full truncate">{item.label}</span>
            </button>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-center text-[10px] font-medium leading-tight text-muted-foreground transition hover:text-brand max-[380px]:text-[9px]",
                (item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`)) &&
                  "bg-brand-soft text-brand",
              )}
            >
              <Icon className="size-4" />
              <span className="block w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Dialog open={moreOpen} onOpenChange={setMoreOpen}>
        <DialogContent className="dialog-bottom-sheet inset-x-0 bottom-0 top-auto w-full max-w-none !translate-x-0 !translate-y-0 rounded-b-none rounded-t-[1.75rem] px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-8 sm:max-w-none lg:hidden">
          <DialogHeader>
            <DialogTitle>{tNav("more")}</DialogTitle>
            <DialogDescription className="sr-only">
              Quick links and account actions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {moreItems.map((item) => (
              <Link
                key={item.href}
                className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3 text-sm font-medium text-foreground transition hover:bg-brand-soft"
                href={item.href}
                onClick={() => setMoreOpen(false)}
              >
                <item.icon className="size-4" />
                {getLabel(item.href)}
              </Link>
            ))}
            {user ? (
              <Button
                className="w-full justify-start"
                type="button"
                variant="ghost"
                onClick={async () => {
                  setMoreOpen(false);
                  await handleLogout();
                }}
              >
                <LogOut className="size-4" />
                {tNav("logout")}
              </Button>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
