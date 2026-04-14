"use client";

import { RouteErrorState } from "@/components/shared/route-error-state";

export default function FindError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorState
      description="We couldn’t load the donor matching view right now. Retry this route or return to the main feed."
      error={error}
      reset={reset}
      title="The Find to Donate page hit an unexpected problem."
    />
  );
}
