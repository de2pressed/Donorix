import * as Sentry from "@sentry/nextjs";

export async function register() {
  // Sentry server initialization can be added here when DSNs are configured.
}

export const onRequestError = Sentry.captureRequestError;
