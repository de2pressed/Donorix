/* eslint-disable @next/next/no-html-link-for-pages */
import { ArrowLeft } from "lucide-react";

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
  return (
    <a
      className={cn(
        "inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-brand",
        className,
      )}
      href={href}
    >
      <ArrowLeft className="size-4" />
      <span>{label}</span>
    </a>
  );
}
