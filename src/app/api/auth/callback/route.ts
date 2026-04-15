import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? searchParams.get("redirect") ?? "/";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  const redirectPath = type === "recovery" ? "/reset-password" : safeNext;

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = (await supabase?.auth.exchangeCodeForSession(code)) ?? {};

    if (error) {
      const loginUrl = new URL("/login", origin);
      loginUrl.searchParams.set("error", "callback_failed");
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.redirect(new URL(redirectPath, origin));
}
