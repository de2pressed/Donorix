"use client";

import { RouteErrorState } from "@/components/shared/route-error-state";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorState
      description="The authentication flow failed to render correctly. Retry the route or return home."
      error={error}
      reset={reset}
      title="Authentication is temporarily unavailable."
    />
  );
}
