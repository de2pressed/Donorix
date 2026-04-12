"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

export function NewPostFab() {
  const pathname = usePathname();
  const tHero = useTranslations("hero");

  if (pathname === "/posts/new") {
    return null;
  }

  return (
    <Link
      aria-label={tHero("primaryCta")}
      href="/posts/new"
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+6rem)] left-1/2 z-40 flex size-14 -translate-x-1/2 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-glow lg:hidden"
    >
      <Plus className="size-5" />
    </Link>
  );
}
