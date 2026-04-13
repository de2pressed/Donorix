import { NextRequest, NextResponse } from "next/server";

import { jsonError, requireServerUser } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";
import { isDonationEligible } from "@/lib/utils/donation-eligibility";
import { sanitizeText } from "@/lib/utils/sanitize";

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

  const { error } = await supabase.from("donor_applications").insert({
    post_id: id,
    donor_id: profile.id,
    status: "pending",
    eligibility_score: 80,
    note: body.note ? sanitizeText(body.note) : null,
  });

  if (error) {
    return jsonError(error.message, 500);
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
