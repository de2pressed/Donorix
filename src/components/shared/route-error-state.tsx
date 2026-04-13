"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export function RouteErrorState({
  error,
  reset,
  title = "Something went wrong while loading this page.",
  description = "You can retry this route or return to the main Donorix feed.",
}: {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
}) {
  useEffect(() => {
    Sentry.captureException(error);
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-10">
      <div className="surface max-w-xl space-y-4 p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">
          Unexpected error
        </p>
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button type="button" onClick={reset}>
            Try again
          </Button>
          <Button asChild type="button" variant="outline">
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
