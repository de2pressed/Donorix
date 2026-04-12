"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
        <div className="surface max-w-xl space-y-4 p-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Unexpected error</p>
          <h1 className="text-3xl font-semibold">Something went wrong while rendering Donorix.</h1>
          <p className="text-sm text-muted-foreground">
            You can retry the current route or return to the main blood request feed.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={reset}>Try again</Button>
            <Button asChild variant="outline">
              <Link href="/">Go home</Link>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
