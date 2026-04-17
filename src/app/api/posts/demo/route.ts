import { addHours } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, requireServerUser } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";
import { BLOOD_TYPES } from "@/lib/constants";
import { createDemoRequestDraft } from "@/lib/utils/demo-request";
import { sanitizeText } from "@/lib/utils/sanitize";

const demoRequestSchema = z.object({
  patientName: z.string().min(2).max(100).trim().optional(),
  patientId: z.string().min(2).max(80).trim().optional(),
  bloodTypeNeeded: z.enum(BLOOD_TYPES).optional(),
  unitsNeeded: z.coerce.number().int().min(1).max(10).optional(),
  medicalCondition: z.string().min(8).max(500).trim().optional(),
  additionalNotes: z.string().max(1000).trim().optional(),
  isEmergency: z.boolean().optional(),
});

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

    const body = await request.json().catch(() => ({}));
    const parsed = demoRequestSchema.safeParse(body);
    const requestDraft = {
      ...createDemoRequestDraft(parsed.success ? parsed.data.isEmergency ?? true : true),
      ...(parsed.success ? parsed.data : {}),
    };
    const isEmergency = requestDraft.isEmergency ?? true;
    const requiredBy = addHours(new Date(), isEmergency ? 1 : 4);

    const { data, error } = await supabase
      .from("posts")
      .insert({
        created_by: profile.id,
        patient_name: sanitizeText(requestDraft.patientName),
        patient_id: sanitizeText(requestDraft.patientId),
        blood_type_needed: requestDraft.bloodTypeNeeded,
        units_needed: requestDraft.unitsNeeded,
        hospital_name: sanitizeText(hospitalAccount.hospital_name),
        hospital_address: sanitizeText(hospitalAccount.address),
        city: sanitizeText(hospitalAccount.city),
        state: sanitizeText(hospitalAccount.state),
        latitude: null,
        longitude: null,
        contact_name: sanitizeText(hospitalAccount.contact_person_name),
        contact_phone: hospitalAccount.official_contact_phone,
        contact_email: hospitalAccount.official_contact_email,
        medical_condition: sanitizeText(requestDraft.medicalCondition),
        additional_notes: sanitizeText(requestDraft.additionalNotes),
        is_emergency: isEmergency,
        required_by: requiredBy.toISOString(),
        initial_radius_km: 25,
        current_radius_km: 25,
        expires_at: addHours(requiredBy, isEmergency ? 6 : 12).toISOString(),
        status: "active",
        priority_score: isEmergency ? 999 : 600,
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
