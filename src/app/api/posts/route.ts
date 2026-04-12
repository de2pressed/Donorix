import { addHours } from "date-fns";
import { NextRequest, NextResponse } from "next/server";

import { getFeedPosts } from "@/lib/data";
import { jsonError, requireServerUser } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/utils/sanitize";
import { createPostSchema } from "@/lib/validations/post";

export async function GET() {
  const posts = await getFeedPosts();
  return NextResponse.json({ posts });
}

export async function POST(request: NextRequest) {
  const { supabase, profile } = await requireServerUser();

  if (!supabase || !profile) {
    return jsonError("Unauthorized", 401);
  }

  const rateLimit = await enforceRateLimit(`post-create:${profile.id}`);
  if (!rateLimit.success) {
    return jsonError("Too many requests", 429);
  }

  const body = await request.json();
  const parsed = createPostSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const payload = parsed.data;

  const { data, error } = await supabase
    .from("posts")
    .insert({
      created_by: profile.id,
      patient_name: sanitizeText(payload.patient_name),
      blood_type_needed: payload.blood_type_needed,
      units_needed: payload.units_needed,
      hospital_name: sanitizeText(payload.hospital_name),
      hospital_address: sanitizeText(payload.hospital_address),
      city: sanitizeText(payload.city),
      state: sanitizeText(payload.state),
      latitude: payload.latitude ?? null,
      longitude: payload.longitude ?? null,
      contact_name: sanitizeText(payload.contact_name),
      contact_phone: payload.contact_phone,
      contact_email: payload.contact_email || null,
      medical_condition: payload.medical_condition ? sanitizeText(payload.medical_condition) : null,
      additional_notes: payload.additional_notes ? sanitizeText(payload.additional_notes) : null,
      is_emergency: payload.is_emergency,
      required_by: payload.required_by,
      initial_radius_km: payload.initial_radius_km,
      current_radius_km: payload.initial_radius_km,
      expires_at: addHours(new Date(payload.required_by), 6).toISOString(),
      status: "active",
      priority_score: payload.is_emergency ? 999 : 100,
    })
    .select("id")
    .single();

  if (error) {
    return jsonError(error.message, 500);
  }

  return NextResponse.json({ postId: data.id }, { status: 201 });
}
