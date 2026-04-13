import { NextRequest, NextResponse } from "next/server";

import { jsonError, requireServerUser } from "@/lib/http";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, profile } = await requireServerUser();

  if (!supabase || !profile) {
    return jsonError("Unauthorized", 401);
  }

  if (profile.account_type !== "hospital" && !profile.is_admin) {
    return jsonError("Only hospital accounts can approve donors.", 403);
  }

  const body = (await request.json()) as { donorId?: string };
  if (!body.donorId) {
    return jsonError("donorId is required", 422);
  }

  const post = await supabase
    .from("posts")
    .select("created_by")
    .eq("id", id)
    .single();

  if (!post.data || (post.data.created_by !== profile.id && !profile.is_admin)) {
    return jsonError("Forbidden", 403);
  }

  const { error } = await supabase
    .from("donor_applications")
    .update({ status: "approved" })
    .eq("post_id", id)
    .eq("donor_id", body.donorId);

  if (error) {
    return jsonError(error.message, 500);
  }

  await supabase
    .from("posts")
    .update({ approved_donor_id: body.donorId })
    .eq("id", id);

  return NextResponse.json({ ok: true });
}
