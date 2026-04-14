"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/hooks/use-user";
import { getBottomNav, getMoreNav } from "@/lib/navigation";
import { cn } from "@/lib/utils/cn";

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user } = useUser();
  const [moreOpen, setMoreOpen] = useState(false);
  const items = getBottomNav(user?.account_type, Boolean(user));
  const moreItems = getMoreNav(user?.account_type, Boolean(user));

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <>
      <nav className="glass fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-40 flex items-center justify-between px-4 py-2 lg:hidden">
        {items.map((item) => {
        const Icon = item.icon;
        return (
          item.href === "#more" ? (
            <button
              key={item.label}
              className="flex min-w-0 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-medium text-muted-foreground transition hover:text-brand"
              type="button"
              onClick={() => setMoreOpen(true)}
            >
              <Icon className="size-4" />
              {item.label}
            </button>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-0 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-medium text-muted-foreground transition hover:text-brand",
                (item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`)) &&
                  "bg-brand-soft text-brand",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          )
        );
        })}
      </nav>

      <Dialog open={moreOpen} onOpenChange={setMoreOpen}>
        <DialogContent className="dialog-bottom-sheet top-auto bottom-0 w-full max-w-none translate-x-[-50%] translate-y-0 rounded-b-none rounded-t-[1.75rem] px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-8 sm:max-w-none lg:hidden">
          <DialogHeader>
            <DialogTitle>More</DialogTitle>
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
                {item.label}
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
                Log Out
              </Button>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
