import { NextRequest, NextResponse } from "next/server";

import { env } from "@/lib/env";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

function isAuthorized(request: NextRequest) {
  const secret = env.CRON_SECRET;
  if (!secret) return false;

  const headerSecret = request.headers.get("x-cron-secret");
  const authHeader = request.headers.get("authorization");

  return headerSecret === secret || authHeader === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ skipped: true, reason: "Supabase admin not configured" });
  }

  const { data: posts } = await supabase
    .from("posts")
    .select("id, initial_radius_km, current_radius_km")
    .eq("status", "active")
    .lt("current_radius_km", 35);

  for (const post of posts ?? []) {
    const nextRadius = Math.min(35, post.current_radius_km + 5);
    await supabase.from("posts").update({ current_radius_km: nextRadius }).eq("id", post.id);
  }

  return NextResponse.json({ expanded: posts?.length ?? 0 });
}
