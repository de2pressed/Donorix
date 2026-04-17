"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { useUser } from "@/lib/hooks/use-user";

export function NewPostFab() {
  const { data: user } = useUser();

  if (user?.account_type !== "hospital") {
    return null;
  }

  return (
    <Link
      aria-label="Create a new blood request"
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+5.25rem)] left-1/2 z-[61] flex size-16 -translate-x-1/2 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-glow transition hover:opacity-95 lg:bottom-6"
      href="/posts/new"
    >
      <Plus className="size-6" />
    </Link>
  );
}
