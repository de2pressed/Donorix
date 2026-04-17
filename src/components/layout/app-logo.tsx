"use client";

import { HeartHandshake } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";

type AppLogoProps = {
  href?: string;
  className?: string;
  showTagline?: boolean;
  tagline?: string;
  taglineClassName?: string;
  compact?: boolean;
};

const logoCandidates = [
  "/logo/custom-logo.webp",
  "/logo/custom-logo.png",
  "/logo/logo.webp",
  "/logo/logo.png",
  "/logo/Logo.webp",
  "/logo/Logo.png",
  "/logo/donorix-logo.webp",
  "/logo/donorix-logo.png",
  "/logo/Donorix-logo.webp",
  "/logo/Donorix-logo.png",
];

let cachedLogoSrc: string | null | "unresolved" = "unresolved";

function LogoMark({ compact = false }: { compact?: boolean }) {
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(() => {
    if (cachedLogoSrc !== "unresolved") return cachedLogoSrc;
    return null;
  });

  useEffect(() => {
    if (cachedLogoSrc !== "unresolved") {
      setResolvedSrc(cachedLogoSrc);
      return;
    }

    let cancelled = false;

    async function resolveLogo() {
      for (const src of logoCandidates) {
        const ok = await new Promise<boolean>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = src;
        });

        if (cancelled) return;
        if (ok) {
          cachedLogoSrc = src;
          setResolvedSrc(src);
          return;
        }
      }

      if (!cancelled) {
        cachedLogoSrc = null;
        setResolvedSrc(null);
      }
    }

    void resolveLogo();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-sm",
        compact ? "size-10" : "size-11",
      )}
    >
      {resolvedSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolvedSrc}
          alt={`${APP_NAME} logo`}
          className={cn("h-full w-full object-contain", compact ? "p-1.5" : "p-2")}
          draggable={false}
          onError={() => {
            cachedLogoSrc = null;
            setResolvedSrc(null);
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
  compact = false,
}: AppLogoProps) {
  return (
    <Link className={cn("inline-flex min-w-0 items-center gap-3", className)} href={href}>
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
          <p className={cn("truncate text-sm text-muted-foreground", taglineClassName)}>{tagline}</p>
        ) : null}
      </div>
    </Link>
  );
}
