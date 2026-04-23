"use client";
/* eslint-disable @next/next/no-html-link-for-pages */
import { ArrowLeft } from "lucide-react";
import type { MouseEvent } from "react";

import { cn } from "@/lib/utils/cn";

type SecondaryPageBackLinkProps = {
  href?: string;
  label?: string;
  className?: string;
};

export function SecondaryPageBackLink({
  href = "/",
  label = "Home",
  className,
}: SecondaryPageBackLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    window.location.assign(href);
  }

  return (
    <a
      className={cn(
        "inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-brand",
        className,
      )}
      href={href}
      onClick={handleClick}
    >
      <ArrowLeft className="size-4" />
      <span>{label}</span>
    </a>
  );
}
