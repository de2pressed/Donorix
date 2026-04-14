import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { env, hasSupabaseEnv } from "@/lib/env";
import type { Database } from "@/types/database";

type SessionPayload = {
  access_token?: string;
  refresh_token?: string;
};

export async function POST(request: Request) {
  if (!hasSupabaseEnv || !env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: "Supabase auth is not configured." }, { status: 503 });
  }

  const response = NextResponse.json({ ok: true });
  const cookieStore = await cookies();
  const payload = (await request.json().catch(() => null)) as SessionPayload | null;

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          response.cookies.set(name, value, options);
        },
        remove(name, options) {
          response.cookies.set(name, "", { ...options, maxAge: 0 });
        },
      },
    },
  );

  if (payload?.access_token && payload?.refresh_token) {
    const { error } = await supabase.auth.setSession({
      access_token: payload.access_token,
      refresh_token: payload.refresh_token,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return response;
  }

  await supabase.auth.signOut();
  return response;
}
