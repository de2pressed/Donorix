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

  const nowIso = new Date().toISOString();
  const { data: expiredPosts } = await supabase
    .from("posts")
    .select("id, created_by")
    .eq("status", "active")
    .lt("expires_at", nowIso);

  const postIds = (expiredPosts ?? []).map((post) => post.id);
  if (!postIds.length) {
    return NextResponse.json({ expired: 0 });
  }

  await supabase.from("posts").update({ status: "expired" }).in("id", postIds).eq("status", "active");

  const { data: alreadyNotified } = await supabase
    .from("notifications")
    .select("post_id")
    .eq("type", "post_expired")
    .in("post_id", postIds);
  const notifiedPostIds = new Set((alreadyNotified ?? []).map((row) => row.post_id));

  const notificationsToInsert = (expiredPosts ?? [])
    .filter((post) => !notifiedPostIds.has(post.id))
    .map((post) => ({
      user_id: post.created_by,
      type: "post_expired",
      title: "Blood request expired",
      body: "Your request passed its expiry window and has been marked expired.",
      post_id: post.id,
    }));

  if (notificationsToInsert.length) {
    await supabase.from("notifications").insert(notificationsToInsert);
  }

  return NextResponse.json({ expired: postIds.length });
}
