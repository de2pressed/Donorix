"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

export function InteractivePanel({
  children,
  className,
  href,
  label,
}: {
  children: ReactNode;
  className?: string;
  href: string;
  label: string;
}) {
  const router = useRouter();

  function handleNavigate() {
    router.push(href);
  }

  return (
    <Card
      aria-label={label}
      className={cn(
        "group cursor-pointer transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-[0_28px_60px_rgba(17,24,39,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      role="link"
      tabIndex={0}
      onClick={handleNavigate}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleNavigate();
        }
      }}
    >
      {children}
    </Card>
  );
}
