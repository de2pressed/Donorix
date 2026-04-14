"use client";

import Link from "next/link";
import { Building2, HeartHandshake, Settings } from "lucide-react";
import { usePathname } from "next/navigation";

import { useUser } from "@/lib/hooks/use-user";
import { getSidebarNav, showRegisterHospitalButton } from "@/lib/navigation";
import { cn } from "@/lib/utils/cn";

export function Sidebar() {
  const pathname = usePathname();
  const { data: user } = useUser();
  const items = getSidebarNav(user?.account_type);
  const showRegisterHospital = showRegisterHospitalButton(user?.account_type);

  return (
    <aside className="glass sticky top-6 hidden h-[calc(100vh-3rem)] w-[15.5rem] shrink-0 flex-col justify-between overflow-hidden p-5 lg:flex">
      <div className="space-y-8">
        <div className="space-y-3">
          <Link className="inline-flex items-center gap-3" href="/">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-glow">
              <HeartHandshake className="size-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                {user?.account_type === "hospital" ? "Hospital workspace" : "Donor workspace"}
              </p>
              <p className="text-sm text-muted-foreground">
                {user?.account_type === "hospital"
                  ? "Patient posts, donors, and notification workflows"
                  : "Explore requests, ranking, and response activity"}
              </p>
            </div>
          </Link>
        </div>
        <nav className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-brand-soft hover:text-brand",
                  active && "bg-brand-soft text-brand",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="space-y-4">
        {showRegisterHospital ? (
          <Link
            className="flex items-center gap-3 rounded-2xl border border-brand/20 bg-brand-soft/60 px-4 py-3 text-sm font-medium text-brand transition hover:border-brand/40 hover:bg-brand-soft"
            href="/signup?account=hospital"
          >
            <Building2 className="size-4" />
            Register as Hospital
          </Link>
        ) : null}
        <Link
          className={cn(
            "flex items-center gap-3 rounded-2xl border border-border bg-card/70 px-4 py-3 text-sm font-medium text-muted-foreground transition hover:border-brand/30 hover:bg-brand-soft hover:text-brand",
            pathname.startsWith("/settings") && "border-brand/30 bg-brand-soft text-brand",
          )}
          href="/settings"
        >
          <Settings className="size-4" />
          Settings
        </Link>
        <div className="rounded-[1.5rem] border border-border bg-card/60 p-4">
          <p className="text-sm font-medium">
            {user?.account_type === "hospital" ? "Hospital operations" : "Emergency routing enabled"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {user?.account_type === "hospital"
              ? "Track patient requests, donor applicants, and verification from one secure workspace."
              : "Urgent requests rise to the top and continue expanding notification reach until help is found."}
          </p>
        </div>
      </div>
    </aside>
  );
}
