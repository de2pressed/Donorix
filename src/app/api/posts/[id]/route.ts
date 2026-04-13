import { NextRequest, NextResponse } from "next/server";

import { jsonError, requireServerUser } from "@/lib/http";
import { sanitizeText } from "@/lib/utils/sanitize";
import { updatePostSchema } from "@/lib/validations/post";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireServerUser(request);

  if (!supabase) {
    return jsonError("Supabase not configured", 503);
  }

  const { data } = await supabase
    .from("posts")
    .select(
      "id, created_by, patient_name, patient_id, blood_type_needed, units_needed, hospital_name, hospital_address, city, state, latitude, longitude, contact_name, contact_phone, contact_email, medical_condition, additional_notes, is_emergency, required_by, initial_radius_km, current_radius_km, expires_at, status, priority_score, upvote_count, donor_count, approved_donor_id, sms_sent_count, is_legacy, is_demo, created_at, updated_at",
    )
    .eq("id", id)
    .single();

  if (!data) {
    return jsonError("Post not found", 404);
  }

  return NextResponse.json({ post: data });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, profile } = await requireServerUser(request);

  if (!supabase || !profile) {
    return jsonError("Unauthorized", 401);
  }

  const body = await request.json();
  const parsed = updatePostSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const existing = await supabase
    .from("posts")
    .select("created_by")
    .eq("id", id)
    .single();

  if (!existing.data || (existing.data.created_by !== profile.id && !profile.is_admin)) {
    return jsonError("Forbidden", 403);
  }

  const { error } = await supabase
    .from("posts")
    .update({
      ...parsed.data,
      patient_name: parsed.data.patient_name ? sanitizeText(parsed.data.patient_name) : undefined,
      hospital_name: parsed.data.hospital_name ? sanitizeText(parsed.data.hospital_name) : undefined,
      hospital_address: parsed.data.hospital_address
        ? sanitizeText(parsed.data.hospital_address)
        : undefined,
      city: parsed.data.city ? sanitizeText(parsed.data.city) : undefined,
      state: parsed.data.state ? sanitizeText(parsed.data.state) : undefined,
      contact_name: parsed.data.contact_name ? sanitizeText(parsed.data.contact_name) : undefined,
      medical_condition: parsed.data.medical_condition
        ? sanitizeText(parsed.data.medical_condition)
        : undefined,
      additional_notes: parsed.data.additional_notes
        ? sanitizeText(parsed.data.additional_notes)
        : undefined,
    })
    .eq("id", id);

  if (error) {
    return jsonError(error.message, 500);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, profile } = await requireServerUser(request);

  if (!supabase || !profile) {
    return jsonError("Unauthorized", 401);
  }

  const existing = await supabase
    .from("posts")
    .select("created_by")
    .eq("id", id)
    .single();

  if (!existing.data || (existing.data.created_by !== profile.id && !profile.is_admin)) {
    return jsonError("Forbidden", 403);
  }

  const { error } = await supabase
    .from("posts")
    .update({ status: "deleted" })
    .eq("id", id);

  if (error) {
    return jsonError(error.message, 500);
  }

  return NextResponse.json({ ok: true });
}
