import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";

import { env, hasSupabaseEnv } from "@/lib/env";
import type { Database } from "@/types/database";
import { createSupabaseTimeoutFetch, SUPABASE_REQUEST_TIMEOUT_MS } from "@/lib/supabase/timeout-fetch";

type SessionLookupResult = {
  user: User | null;
  authTimedOut: boolean;
};

type SupabaseServerClient = SupabaseClient<Database>;
type UpdateSessionResult = {
  response: NextResponse;
  user: User | null;
  authTimedOut: boolean;
};

async function getSessionUserWithTimeout(supabase: SupabaseServerClient) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const authLookup = supabase.auth.getUser().then(
    ({ data: { user } }): SessionLookupResult => ({
      user: user ?? null,
      authTimedOut: false,
    }),
    (): SessionLookupResult => ({
      user: null,
      authTimedOut: false,
    }),
  );

  const timeoutLookup = new Promise<SessionLookupResult>((resolve) => {
    timeoutId = globalThis.setTimeout(() => {
      resolve({
        user: null,
        authTimedOut: true,
      });
    }, SUPABASE_REQUEST_TIMEOUT_MS);
  });

  try {
    return await Promise.race([authLookup, timeoutLookup]);
  } finally {
    if (timeoutId) {
      globalThis.clearTimeout(timeoutId);
    }
  }
}

export async function updateSession(request: NextRequest): Promise<UpdateSessionResult> {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  if (!hasSupabaseEnv || !env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { response, user: null, authTimedOut: false };
  }

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        fetch: createSupabaseTimeoutFetch(SUPABASE_REQUEST_TIMEOUT_MS),
      },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { user, authTimedOut } = await getSessionUserWithTimeout(supabase);

  return { response, user, authTimedOut };
}
