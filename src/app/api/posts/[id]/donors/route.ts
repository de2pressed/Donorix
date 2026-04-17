import { NextRequest, NextResponse } from "next/server";

import { jsonError, requireServerUser } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isDonationEligible } from "@/lib/utils/donation-eligibility";
import { estimateDistanceKm } from "@/lib/utils/distance";
import { sanitizeText } from "@/lib/utils/sanitize";
import { computeEligibilityScore } from "@/lib/utils/blood-type";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, profile } = await requireServerUser(request);

  if (!supabase || !profile) {
    return jsonError("Unauthorized", 401);
  }

  if (profile.account_type !== "donor") {
    return jsonError("Only donor accounts can apply to donate.", 403);
  }

  const rateLimit = await enforceRateLimit(`donor-application:${profile.id}`);
  if (!rateLimit.success) {
    return jsonError("Too many requests", 429);
  }

  const body = (await request.json().catch(() => ({}))) as { note?: string };

  if (!isDonationEligible(profile.last_donated_at)) {
    return jsonError("You are still within the 90-day donation cooldown window.", 400);
  }

  const { data: existingApplication } = await supabase
    .from("donor_applications")
    .select("id")
    .eq("post_id", id)
    .eq("donor_id", profile.id)
    .maybeSingle();

  if (existingApplication) {
    return jsonError("You have already applied to donate for this request.", 409);
  }

  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("created_by, patient_name, blood_type_needed, city, state, status, expires_at")
    .eq("id", id)
    .maybeSingle();

  if (postError) {
    return jsonError(postError.message, 500);
  }

  if (!post) {
    return jsonError("Post not found", 404);
  }
  if (post.status !== "active") {
    return jsonError("This request is no longer active.", 409);
  }
  if (new Date(post.expires_at).getTime() <= Date.now()) {
    return jsonError("This request has already expired.", 409);
  }

  const eligibilityScore = computeEligibilityScore(profile.blood_type, post.blood_type_needed);

  if (eligibilityScore === 0) {
    return jsonError("Your blood type is not compatible with this request.", 400);
  }

  const distanceKm = estimateDistanceKm(profile.city, profile.state, post.city, post.state);

  const { error } = await supabase.from("donor_applications").insert({
    post_id: id,
    donor_id: profile.id,
    status: "pending",
    eligibility_score: eligibilityScore,
    distance_km: distanceKm,
    note: body.note ? sanitizeText(body.note) : null,
  });

  if (error) {
    return jsonError(error.message, 500);
  }

  const { data: countPost, error: countReadError } = await supabase
    .from("posts")
    .select("donor_count")
    .eq("id", id)
    .maybeSingle();

  if (countReadError || !countPost) {
    await supabase.from("donor_applications").delete().eq("post_id", id).eq("donor_id", profile.id);
    return jsonError(countReadError?.message ?? "Post not found", 404);
  }

  const { error: countError } = await supabase
    .from("posts")
    .update({ donor_count: (countPost.donor_count ?? 0) + 1 })
    .eq("id", id);

  if (countError) {
    await supabase.from("donor_applications").delete().eq("post_id", id).eq("donor_id", profile.id);
    return jsonError(countError.message, 500);
  }

  const admin = getSupabaseAdminClient();
  if (admin && post.created_by) {
    await admin.from("notifications").insert({
      user_id: post.created_by,
      type: "donor_application",
      title: "New donor application",
      body: `${profile.full_name ?? "A donor"} has applied to donate ${post.blood_type_needed} for patient ${post.patient_name}.`,
      post_id: id,
      data: {
        donor_id: profile.id,
        donor_name: profile.full_name ?? profile.username,
      },
    });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
