"use client";

import Link from "next/link";
import { LogOut, Settings, User2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useUser } from "@/lib/hooks/use-user";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

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
  const { data: user, isLoading } = useUser();

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
        <Button asChild className="hidden sm:inline-flex" size="sm" variant="ghost">
          <Link href="/login">Login</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Open profile menu"
          className="rounded-full border border-border bg-card/80 p-0.5 shadow-sm transition hover:border-brand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          type="button"
        >
          <Avatar className="size-10">
            <AvatarImage src={user.avatar_url ?? undefined} alt={user.full_name} />
            <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
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
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex w-full items-center gap-2">
            <Settings className="size-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex items-center gap-2 text-danger focus:bg-danger/10 focus:text-danger"
          onSelect={async (event) => {
            event.preventDefault();
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

            toast.success("Logout successful");
            router.replace("/login");
            router.refresh();
          }}
        >
          <LogOut className="size-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
