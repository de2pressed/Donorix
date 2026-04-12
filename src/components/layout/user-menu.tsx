"use client";

import Link from "next/link";
import { LogOut, MessageCircleMore, Settings, User2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { useUser } from "@/lib/hooks/use-user";
import { ASSISTANT_OPEN_EVENT } from "@/components/layout/floating-assistant";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
  const router = useRouter();
  const tNav = useTranslations("nav");
  const assistantLabel = "Ask Assistant";
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

    toast.success(tNav("logout"));
    router.replace("/login");
    router.refresh();
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
          <Link href="/login">{tNav("login")}</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/signup">{tNav("signup")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button aria-label="Open profile menu" className={avatarButtonClassName} type="button">
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
                <p className="normal-case tracking-normal text-muted-foreground">@{user.username}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex w-full items-center gap-2">
                <User2 className="size-4" />
                {tNav("viewProfile")}
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
              {assistantLabel}
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
          <DialogContent className="dialog-bottom-sheet top-auto bottom-0 w-full max-w-none translate-x-[-50%] translate-y-0 rounded-b-none rounded-t-[1.75rem] px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-8 sm:max-w-none">
            <DialogHeader>
              <DialogTitle>{tNav("profileActions")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Link
                className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3 text-sm font-medium text-foreground transition hover:bg-brand-soft"
                href="/profile"
                onClick={() => setMobileOpen(false)}
              >
                <User2 className="size-4" />
                {tNav("viewProfile")}
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
                {assistantLabel}
              </Button>
              <Link
                className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3 text-sm font-medium text-foreground transition hover:bg-brand-soft"
                href="/settings"
                onClick={() => setMobileOpen(false)}
              >
                <Settings className="size-4" />
                {tNav("settings")}
              </Link>
              <Button
                className="w-full justify-start"
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
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
