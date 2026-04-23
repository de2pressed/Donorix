import { cookies } from "next/headers";

import { createServerClient } from "@supabase/ssr";

import { env, hasSupabaseEnv } from "@/lib/env";
import type { Database } from "@/types/database";
import { createSupabaseTimeoutFetch } from "@/lib/supabase/timeout-fetch";

const SUPABASE_DB_TIMEOUT_MS = 4000;
const SUPABASE_FETCH_TIMEOUT_MS = 5000;
const SUPABASE_AUTH_COOKIE_FRAGMENT = "-auth-token";

export async function hasSupabaseAuthCookies() {
  if (!hasSupabaseEnv) {
    return false;
  }

  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes(SUPABASE_AUTH_COOKIE_FRAGMENT));
}

export async function createServerSupabaseClient() {
  if (!hasSupabaseEnv || !env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      db: {
        timeout: SUPABASE_DB_TIMEOUT_MS,
      },
      global: {
        fetch: createSupabaseTimeoutFetch(SUPABASE_FETCH_TIMEOUT_MS),
      },
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // Server components cannot always mutate cookies during render.
          }
        },
        remove(name, options) {
          try {
            cookieStore.set(name, "", { ...options, maxAge: 0 });
          } catch {
            // Server components cannot always mutate cookies during render.
          }
        },
      },
    },
  );
}
