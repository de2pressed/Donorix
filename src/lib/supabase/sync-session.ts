"use client";

import type { Session } from "@supabase/supabase-js";

export async function syncSupabaseSessionToServer(session: Pick<Session, "access_token" | "refresh_token"> | null) {
  await fetch("/api/auth/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    credentials: "same-origin",
    body: JSON.stringify(
      session
        ? {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          }
        : {},
    ),
  });
}
