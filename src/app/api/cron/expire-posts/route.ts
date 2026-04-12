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

  const { data: expiredPosts } = await supabase
    .from("posts")
    .select("id, created_by")
    .eq("status", "active")
    .lt("expires_at", new Date().toISOString());

  for (const post of expiredPosts ?? []) {
    await supabase.from("posts").update({ status: "expired" }).eq("id", post.id);
    await supabase.from("notifications").insert({
      user_id: post.created_by,
      type: "post_expired",
      title: "Blood request expired",
      body: "Your request passed its expiry window and has been marked expired.",
      post_id: post.id,
    });
  }

  return NextResponse.json({ expired: expiredPosts?.length ?? 0 });
}
