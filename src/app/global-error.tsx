"use client";

import { RouteErrorState } from "@/components/shared/route-error-state";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
        <RouteErrorState
          description="You can retry the current route or return to the main blood request feed."
          error={error}
          reset={reset}
          title="Something went wrong while rendering Donorix."
        />
      </body>
    </html>
  );
}
