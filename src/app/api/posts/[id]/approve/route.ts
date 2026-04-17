import { NextRequest, NextResponse } from "next/server";

import { jsonError, requireServerUser } from "@/lib/http";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, profile } = await requireServerUser(request);

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

  await supabase
    .from("donor_applications")
    .update({ status: "rejected" })
    .eq("post_id", id)
    .neq("donor_id", body.donorId)
    .eq("status", "pending");

  const admin = getSupabaseAdminClient();
  if (admin) {
    const { data: postMeta } = await supabase
      .from("posts")
      .select("patient_name, hospital_name, created_by")
      .eq("id", id)
      .maybeSingle();

    await admin.from("notifications").insert({
      user_id: body.donorId,
      type: "application_approved",
      title: "Your donation offer was accepted",
      body: `${postMeta?.hospital_name ?? "The hospital"} has accepted your application for patient ${postMeta?.patient_name ?? "a patient"}. Please coordinate directly.`,
      post_id: id,
      data: { status: "approved", post_id: id },
    });

    if (postMeta?.created_by) {
      await admin.from("notifications").insert({
        user_id: postMeta.created_by,
        type: "chat_ready",
        title: "Chat ready with approved donor",
        body: `You can now chat with the approved donor for patient ${postMeta.patient_name ?? "this request"}.`,
        post_id: id,
        data: { post_id: id, donor_id: body.donorId },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
