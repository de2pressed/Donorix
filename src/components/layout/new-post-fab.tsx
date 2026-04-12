"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { usePathname } from "next/navigation";

export function NewPostFab() {
  const pathname = usePathname();

  if (pathname === "/posts/new") {
    return null;
  }

  return (
    <Link
      aria-label="Create new blood request"
      href="/posts/new"
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+6rem)] right-4 z-40 flex size-14 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-glow lg:hidden"
    >
      <Plus className="size-5" />
    </Link>
  );
}
