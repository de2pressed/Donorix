"use client";

import { RouteErrorState } from "@/components/shared/route-error-state";

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorState
      description="The main workspace hit a rendering error. Retry the route or return to the feed."
      error={error}
      reset={reset}
      title="This workspace could not be rendered."
    />
  );
}
