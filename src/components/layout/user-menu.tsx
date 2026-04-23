"use client";
/* eslint-disable @next/next/no-html-link-for-pages */

import Link from "next/link";
import { Building2, LogOut, MessageCircleMore, Settings, Shield, User2 } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useUser } from "@/lib/hooks/use-user";
import { ASSISTANT_OPEN_EVENT } from "@/components/layout/floating-assistant";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function getInitials(name?: string | null) {
  if (!name) return "D";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function UserMenu() {
  const tNav = useTranslations("nav");
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: user, isLoading } = useUser();

  function openAssistant() {
    window.dispatchEvent(new Event(ASSISTANT_OPEN_EVENT));
  }

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      toast.error("Supabase auth is not configured yet.");
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Logged out");
    window.location.replace("/");
  }

  const avatarButtonClassName =
    "rounded-full border border-border bg-card/80 p-0.5 shadow-sm transition hover:border-brand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  if (isLoading) {
    return (
      <div className="flex size-11 items-center justify-center rounded-full border border-border bg-card/80 text-xs text-muted-foreground">
        ...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild size="sm" variant="ghost">
          <a href="/login">{tNav("login")}</a>
        </Button>
        <Button asChild size="sm">
          <a href="/signup">{tNav("signup")}</a>
        </Button>
      </div>
    );
  }

  const profileHref = user.account_type === "hospital" ? "/settings" : "/profile";
  const profileLabel = user.account_type === "hospital" ? tNav("hospitalSettings") : tNav("viewProfile");
  const showAdminControls = user.is_admin && user.account_type !== "hospital";

  return (
    <>
      <div className="hidden md:block">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button aria-label={tNav("openProfileMenu")} className={avatarButtonClassName} type="button">
              <Avatar className="size-10">
                <AvatarImage src={user?.avatar_url ?? undefined} alt={user?.full_name ?? "Donorix user"} />
                <AvatarFallback>{getInitials(user?.full_name)}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>
              <div className="space-y-1">
                <p className="font-medium normal-case tracking-normal text-foreground">{user.full_name}</p>
                <p className="normal-case tracking-normal text-muted-foreground">
                  {user.account_type === "hospital" ? tNav("hospitalAccount") : `@${user.username}`}
                </p>
                {showAdminControls ? <p className="text-xs font-semibold text-brand">{tNav("adminPanel")}</p> : null}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {showAdminControls ? (
              <DropdownMenuItem asChild>
                <Link href="/admin" className="flex w-full items-center gap-2">
                  <Shield className="size-4" />
                  {tNav("adminPanel")}
                </Link>
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem asChild>
              <Link href={profileHref} className="flex w-full items-center gap-2">
                {user.account_type === "hospital" ? <Building2 className="size-4" /> : <User2 className="size-4" />}
                {profileLabel}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2"
              onSelect={(event) => {
                event.preventDefault();
                openAssistant();
              }}
            >
              <MessageCircleMore className="size-4" />
              {tNav("askAssistant")}
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex w-full items-center gap-2">
                <Settings className="size-4" />
                {tNav("settings")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center gap-2 text-danger focus:bg-danger/10 focus:text-danger"
              onSelect={async (event) => {
                event.preventDefault();
                await handleLogout();
              }}
            >
              <LogOut className="size-4" />
              {tNav("logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="md:hidden">
        <button
          aria-label="Open profile actions"
          className={avatarButtonClassName}
          type="button"
          onClick={() => setMobileOpen(true)}
        >
          <Avatar className="size-10">
            <AvatarImage src={user?.avatar_url ?? undefined} alt={user?.full_name ?? "Donorix user"} />
            <AvatarFallback>{getInitials(user?.full_name)}</AvatarFallback>
          </Avatar>
        </button>
        <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
          <DialogContent className="dialog-bottom-sheet inset-x-0 bottom-0 top-auto w-full max-w-none !translate-x-0 !translate-y-0 rounded-b-none rounded-t-[1.75rem] px-5 pb-[calc(env(safe-area-inset-bottom)+6.75rem)] pt-7 sm:max-w-none">
            <DialogHeader className="pb-4">
              <DialogTitle>{tNav("profileActions")}</DialogTitle>
              <DialogDescription className="sr-only">
                Open your profile, settings, assistant, or sign out.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Button
                className="w-full justify-start rounded-2xl border border-border px-4 py-3 text-sm font-medium text-danger hover:bg-danger/10 hover:text-danger"
                type="button"
                variant="ghost"
                onClick={async () => {
                  setMobileOpen(false);
                  await handleLogout();
                }}
              >
                <LogOut className="size-4" />
                {tNav("logout")}
              </Button>
              {showAdminControls ? (
                <Link
                  className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3 text-sm font-medium text-foreground transition hover:bg-brand-soft"
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                >
                  <Shield className="size-4" />
                  {tNav("adminPanel")}
                </Link>
              ) : null}
              <Link
                className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3 text-sm font-medium text-foreground transition hover:bg-brand-soft"
                href={profileHref}
                onClick={() => setMobileOpen(false)}
              >
                {user.account_type === "hospital" ? <Building2 className="size-4" /> : <User2 className="size-4" />}
                {profileLabel}
              </Link>
              <Button
                className="w-full justify-start rounded-2xl border border-border px-4 py-3 text-sm font-medium"
                type="button"
                variant="ghost"
                onClick={() => {
                  setMobileOpen(false);
                  openAssistant();
                }}
              >
                <MessageCircleMore className="size-4" />
                {tNav("askAssistant")}
              </Button>
              <Link
                className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3 text-sm font-medium text-foreground transition hover:bg-brand-soft"
                href="/settings"
                onClick={() => setMobileOpen(false)}
              >
                <Settings className="size-4" />
                {tNav("settings")}
              </Link>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
