"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { useEffect, useState } from "react";

import { useUser } from "@/lib/hooks/use-user";
import { cn } from "@/lib/utils/cn";

export function NewPostFab() {
  const { data: user } = useUser();
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const footer = document.getElementById("site-footer");
    if (!footer || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setFooterVisible(Boolean(entry?.isIntersecting));
      },
      { threshold: 0.12 },
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  if (user?.account_type !== "hospital") {
    return null;
  }

  return (
    <Link
      aria-label="Create a new blood request"
      className={cn(
        "fixed bottom-[calc(env(safe-area-inset-bottom)+5.25rem)] left-1/2 z-[61] flex size-16 -translate-x-1/2 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-glow transition hover:opacity-95 lg:bottom-6",
        footerVisible && "lg:bottom-24",
      )}
      href="/posts/new"
    >
      <Plus className="size-6" />
    </Link>
  );
}
