import { NextResponse } from "next/server";

import { jsonError, requireServerUser } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, profile } = await requireServerUser(request);

  if (!supabase || !profile) {
    return jsonError("Unauthorized", 401);
  }

  const rateLimit = await enforceRateLimit(`upvote:${profile.id}`);
  if (!rateLimit.success) {
    return jsonError("Too many requests", 429);
  }

  const { error } = await supabase.from("upvotes").upsert(
    {
      post_id: id,
      user_id: profile.id,
      value: 1,
    },
    { onConflict: "post_id,user_id" },
  );

  if (error) {
    return jsonError(error.message, 500);
  }

  return NextResponse.json({ ok: true });
}
