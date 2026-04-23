import { createClient } from "@supabase/supabase-js";

import { env, hasAdminSupabaseEnv } from "@/lib/env";
import type { Database } from "@/types/database";
import { createSupabaseTimeoutFetch } from "@/lib/supabase/timeout-fetch";

const SUPABASE_DB_TIMEOUT_MS = 4000;
const SUPABASE_FETCH_TIMEOUT_MS = 5000;

let adminClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseAdminClient() {
  if (
    !hasAdminSupabaseEnv ||
    !env.NEXT_PUBLIC_SUPABASE_URL ||
    !env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return null;
  }

  if (!adminClient) {
    adminClient = createClient<Database>(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      {
        db: {
          timeout: SUPABASE_DB_TIMEOUT_MS,
        },
        global: {
          fetch: createSupabaseTimeoutFetch(SUPABASE_FETCH_TIMEOUT_MS),
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );
  }

  return adminClient;
}
