"use client";

import Link from "next/link";
import { ArrowLeft, Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { POLICY_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";

export default function PoliciesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="mx-auto min-h-screen w-full max-w-[1900px] px-4 py-4 lg:px-8 2xl:px-10">
      <header className="glass sticky top-4 z-40 flex items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            className="rounded-full"
            type="button"
            variant="ghost"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="size-4" />
            Back to Donorix
          </Button>
          <Link className="font-semibold tracking-tight" href="/">
            Donorix
          </Link>
        </div>
        <ThemeToggle />
      </header>

      <div className="mt-8 flex flex-col gap-6 lg:grid lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="hidden rounded-[1.75rem] border border-border bg-card/80 p-4 lg:block lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)]">
          <div className="space-y-2 px-2 pb-4">
            <h1 className="text-2xl font-semibold">Policies</h1>
            <p className="text-sm text-muted-foreground">
              Legal, consent, privacy, and safety controls for the Donorix platform.
            </p>
          </div>
          <nav className="space-y-1 overflow-y-auto pr-1">
            {POLICY_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-2xl px-4 py-3 text-sm text-muted-foreground transition hover:bg-brand-soft hover:text-brand",
                  pathname === item.href && "bg-brand-soft text-brand",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="space-y-4">
          <div className="lg:hidden">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full justify-center" type="button" variant="outline">
                  <Menu className="size-4" />
                  Policy Menu
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[calc(100vw-1rem)]">
                <DialogHeader>
                  <DialogTitle>Policy Menu</DialogTitle>
                </DialogHeader>
                <nav className="max-h-[60vh] space-y-1 overflow-y-auto">
                  {POLICY_NAV.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "block rounded-2xl px-4 py-3 text-sm text-muted-foreground transition hover:bg-brand-soft hover:text-brand",
                        pathname === item.href && "bg-brand-soft text-brand",
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </DialogContent>
            </Dialog>
          </div>

          <div className="min-w-0 rounded-[1.75rem] border border-border bg-card/85 p-6 shadow-soft md:p-8">
            <div className="mx-auto max-w-[820px]">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
