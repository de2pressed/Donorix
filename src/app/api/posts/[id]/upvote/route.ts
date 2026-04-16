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

  const { data: priorVote } = await supabase
    .from("upvotes")
    .select("id")
    .eq("post_id", id)
    .eq("user_id", profile.id)
    .maybeSingle();

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

  if (!priorVote) {
    const { data: countPost, error: countReadError } = await supabase
      .from("posts")
      .select("upvote_count")
      .eq("id", id)
      .maybeSingle();

    if (countReadError || !countPost) {
      await supabase.from("upvotes").delete().eq("post_id", id).eq("user_id", profile.id);
      return jsonError(countReadError?.message ?? "Post not found", 404);
    }

    const { error: countError } = await supabase
      .from("posts")
      .update({ upvote_count: (countPost.upvote_count ?? 0) + 1 })
      .eq("id", id);

    if (countError) {
      await supabase.from("upvotes").delete().eq("post_id", id).eq("user_id", profile.id);
      return jsonError(countError.message, 500);
    }
  }

  return NextResponse.json({ ok: true, alreadyVoted: Boolean(priorVote) });
}
