import { addHours } from "date-fns";
import { NextRequest, NextResponse } from "next/server";

import { jsonError, requireServerUser } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/utils/sanitize";

export async function POST(request: NextRequest) {
  try {
    const { supabase, profile, hospitalAccount } = await requireServerUser(request);

    if (!supabase || !profile) {
      return jsonError("Unauthorized", 401);
    }

    if (profile.account_type !== "hospital") {
      return jsonError("Only hospital accounts can create blood requests.", 403);
    }

    if (!hospitalAccount) {
      return jsonError("Hospital details are incomplete. Complete hospital registration first.", 409);
    }

    const rateLimit = await enforceRateLimit(`post-create-demo:${profile.id}`);
    if (!rateLimit.success) {
      return jsonError("Too many requests", 429);
    }

    const requiredBy = addHours(new Date(), 1);

    const { data, error } = await supabase
      .from("posts")
      .insert({
        created_by: profile.id,
        patient_name: "Demo Emergency Patient",
        patient_id: `DEMO-${Date.now().toString(36).toUpperCase()}`,
        blood_type_needed: "O+",
        units_needed: 1,
        hospital_name: sanitizeText(hospitalAccount.hospital_name),
        hospital_address: sanitizeText(hospitalAccount.address),
        city: sanitizeText(hospitalAccount.city),
        state: sanitizeText(hospitalAccount.state),
        latitude: null,
        longitude: null,
        contact_name: sanitizeText(hospitalAccount.contact_person_name),
        contact_phone: hospitalAccount.official_contact_phone,
        contact_email: hospitalAccount.official_contact_email,
        medical_condition: sanitizeText("Emergency demo request created for stakeholder walkthroughs."),
        additional_notes: sanitizeText("Created from the one-click demo shortcut."),
        is_emergency: true,
        required_by: requiredBy.toISOString(),
        initial_radius_km: 25,
        current_radius_km: 25,
        expires_at: addHours(requiredBy, 6).toISOString(),
        status: "active",
        priority_score: 999,
        upvote_count: 0,
        donor_count: 0,
        sms_sent_count: 0,
        is_legacy: false,
        is_demo: true,
      })
      .select("id")
      .single();

    if (error) {
      return jsonError(error.message, 500);
    }

    return NextResponse.json({ postId: data.id }, { status: 201 });
  } catch {
    return jsonError("Unable to create demo request", 500);
  }
}
