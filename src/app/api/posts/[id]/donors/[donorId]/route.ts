import { NextRequest, NextResponse } from "next/server";

import { jsonError, requireServerUser } from "@/lib/http";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

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
    .select("created_by, approved_donor_id, patient_name, hospital_name")
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

  const { data: pendingApplications } = await supabase
    .from("donor_applications")
    .select("donor_id")
    .eq("post_id", id)
    .eq("status", "pending")
    .neq("donor_id", donorId);

  if (nextStatus === "approved") {
    await supabase.from("posts").update({ approved_donor_id: donorId }).eq("id", id);
    await supabase
      .from("donor_applications")
      .update({ status: "rejected" })
      .eq("post_id", id)
      .neq("donor_id", donorId)
      .eq("status", "pending");
  } else if (post.approved_donor_id === donorId) {
    const { error } = await supabase
      .from("donor_applications")
      .update({ status: "rejected" })
      .eq("post_id", id)
      .eq("donor_id", donorId);
    if (error) {
      return jsonError(error.message, 500);
    }
    await supabase.from("posts").update({ approved_donor_id: null }).eq("id", id);
  } else {
    const { error } = await supabase
      .from("donor_applications")
      .update({ status: "rejected" })
      .eq("post_id", id)
      .eq("donor_id", donorId);
    if (error) {
      return jsonError(error.message, 500);
    }
  }

  const admin = getSupabaseAdminClient();
  if (admin) {
  const notificationTitle =
      nextStatus === "approved"
        ? "Your donation offer was accepted"
        : "Your donation offer was not selected";

    const notificationBody =
      nextStatus === "approved"
        ? `${post.hospital_name ?? "The hospital"} has accepted your application for patient ${post.patient_name ?? "a patient"}. Please coordinate directly.`
        : `Your application for patient ${post.patient_name ?? "a patient"} at ${post.hospital_name ?? "the hospital"} was not selected this time. Thank you for offering to help.`;

    await admin.from("notifications").insert({
      user_id: donorId,
      type: nextStatus === "approved" ? "application_approved" : "application_rejected",
      title: notificationTitle,
      body: notificationBody,
      post_id: id,
      data: { status: nextStatus, post_id: id },
    });

  if (nextStatus === "approved" && pendingApplications?.length) {
      await admin.from("notifications").insert(
        pendingApplications.map((pending) => ({
          user_id: pending.donor_id,
          type: "application_rejected",
          title: "Your donation offer was not selected",
          body: `Your application for patient ${post.patient_name ?? "a patient"} at ${post.hospital_name ?? "the hospital"} was not selected this time. Thank you for offering to help.`,
          post_id: id,
          data: { status: "rejected", post_id: id },
        })),
      );
  }
  }

  return NextResponse.json({ ok: true });
}
