"use client";
/* eslint-disable @next/next/no-html-link-for-pages */

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { POLICY_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";

export function PoliciesLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <section className="surface hero-grid overflow-hidden p-6 md:p-8">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Policies</p>
          <h1 className="font-display text-2xl font-semibold md:text-3xl">
            Legal, consent, privacy, and safety controls for the Donorix platform.
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
            Browse the policy library in the same app shell used by the rest of Donorix.
          </p>
        </div>

        <div className="mt-5 lg:hidden">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full justify-center" type="button" variant="outline">
                <Menu className="size-4" />
                Policy Menu
              </Button>
            </DialogTrigger>
            <DialogContent className="flex max-w-[calc(100vw-1rem)] flex-col overflow-hidden px-5 pb-[calc(env(safe-area-inset-bottom)+6rem)] pt-7">
              <DialogHeader className="shrink-0 pb-4">
                <DialogTitle>Policy Menu</DialogTitle>
                <DialogDescription className="sr-only">
                  Browse the policy sections on mobile.
                </DialogDescription>
              </DialogHeader>
              <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto pb-2 pr-1">
                {POLICY_NAV.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "block rounded-2xl px-4 py-3 text-sm leading-tight text-muted-foreground transition hover:bg-brand-soft hover:text-brand",
                      pathname === item.href && "bg-brand-soft text-brand",
                    )}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="hidden rounded-[1.75rem] border border-border bg-card/80 p-4 lg:sticky lg:top-24 lg:flex lg:h-[calc(100vh-7rem)] lg:flex-col lg:overflow-hidden">
          <div className="space-y-2 px-2 pb-4">
            <h2 className="font-display text-2xl font-semibold">Policies</h2>
            <p className="text-sm text-muted-foreground">
              Legal, consent, privacy, and safety controls for the Donorix platform.
            </p>
          </div>
          <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
            {POLICY_NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-2xl px-4 py-3 text-sm leading-tight text-muted-foreground transition hover:bg-brand-soft hover:text-brand",
                  pathname === item.href && "bg-brand-soft text-brand",
                )}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 rounded-[1.75rem] border border-border bg-card/85 p-6 shadow-soft md:p-8">
          <div className="mx-auto max-w-[820px]">{children}</div>
        </div>
      </div>
    </div>
  );
}
