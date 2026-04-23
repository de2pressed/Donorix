"use client";

import { HeartHandshake } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";

type AppLogoProps = {
  href?: string;
  className?: string;
  showTagline?: boolean;
  tagline?: string;
  taglineClassName?: string;
  wrapTagline?: boolean;
  compact?: boolean;
};

const LOGO_SRC = "/logo/logo.png";

function LogoMark({ compact = false }: { compact?: boolean }) {
  const [hasError, setHasError] = useState(false);

  return (
    <span
      className={cn(
        "glass-chip relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/70 shadow-sm",
        compact ? "size-10" : "size-11",
      )}
    >
      {!hasError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={LOGO_SRC}
          alt={`${APP_NAME} logo`}
          className={cn("h-full w-full object-contain", compact ? "p-1.5" : "p-2")}
          draggable={false}
          onError={() => {
            setHasError(true);
          }}
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-brand text-brand-foreground">
          <HeartHandshake className={cn(compact ? "size-5" : "size-6")} />
        </span>
      )}
    </span>
  );
}

export function AppLogo({
  href = "/",
  className,
  showTagline = false,
  tagline,
  taglineClassName,
  wrapTagline = false,
  compact = false,
}: AppLogoProps) {
  return (
    <Link className={cn("inline-flex min-w-0 items-center gap-3", wrapTagline && "items-start", className)} href={href}>
      <LogoMark compact={compact} />
      <div className="min-w-0">
        <p
          className={cn(
            "truncate font-sans font-bold tracking-tight text-foreground",
            compact ? "text-base" : "text-lg",
          )}
        >
          {APP_NAME}
        </p>
        {showTagline ? (
          <p
            className={cn(
              wrapTagline ? "whitespace-normal break-words text-sm leading-5 text-muted-foreground" : "truncate text-sm text-muted-foreground",
              taglineClassName,
            )}
          >
            {tagline}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
