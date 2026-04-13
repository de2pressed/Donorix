"use client";

import { RouteErrorState } from "@/components/shared/route-error-state";

export default function PoliciesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorState
      description="A policy document could not be rendered. Retry the route or return to the main feed."
      error={error}
      reset={reset}
      title="This policy page is temporarily unavailable."
    />
  );
}
