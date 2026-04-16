import { NextRequest, NextResponse } from "next/server";

import { jsonError, requireServerUser } from "@/lib/http";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; donorId: string }> },
) {
  const { id, donorId } = await params;
  const { supabase, profile } = await requireServerUser(request);

  if (!supabase || !profile) {
    return jsonError("Unauthorized", 401);
  }

  if (profile.account_type !== "hospital" && !profile.is_admin) {
    return jsonError("Only hospital accounts can update donor applications.", 403);
  }

  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("created_by, approved_donor_id")
    .eq("id", id)
    .maybeSingle();

  if (postError) {
    return jsonError(postError.message, 500);
  }

  if (!post || (post.created_by !== profile.id && !profile.is_admin)) {
    return jsonError("Forbidden", 403);
  }

  const body = (await request.json().catch(() => ({}))) as { status?: string };
  if (!body.status || !["approved", "rejected"].includes(body.status)) {
    return jsonError("status must be 'approved' or 'rejected'", 422);
  }
  const nextStatus = body.status as "approved" | "rejected";

  const { data: application, error: applicationError } = await supabase
    .from("donor_applications")
    .select("id")
    .eq("post_id", id)
    .eq("donor_id", donorId)
    .maybeSingle();

  if (applicationError) {
    return jsonError(applicationError.message, 500);
  }

  if (!application) {
    return jsonError("Application not found", 404);
  }

  const { error } = await supabase
    .from("donor_applications")
    .update({ status: nextStatus })
    .eq("post_id", id)
    .eq("donor_id", donorId);

  if (error) {
    return jsonError(error.message, 500);
  }

  if (nextStatus === "approved") {
    await supabase.from("posts").update({ approved_donor_id: donorId }).eq("id", id);
    await supabase
      .from("donor_applications")
      .update({ status: "rejected" })
      .eq("post_id", id)
      .neq("donor_id", donorId)
      .eq("status", "pending");
  } else if (post.approved_donor_id === donorId) {
    await supabase.from("posts").update({ approved_donor_id: null }).eq("id", id);
  }

  return NextResponse.json({ ok: true });
}
