import { NextResponse } from "next/server";

import { requireServerUser } from "@/lib/http";
import { profileSchema } from "@/lib/validations/profile";

export async function GET() {
  const { profile } = await requireServerUser();

  if (!profile) {
    return NextResponse.json(null, { status: 401 });
  }

  return NextResponse.json(profile);
}

export async function PATCH(request: Request) {
  const { supabase, profile } = await requireServerUser();

  if (!supabase || !profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const parsed = profileSchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid profile update payload" }, { status: 422 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(parsed.data)
    .eq("id", profile.id)
    .select(
      "id, email, phone, full_name, username, avatar_url, blood_type, gender, date_of_birth, city, state, pincode, weight_kg, last_donated_at, total_donations, karma, is_admin, is_available, is_verified, has_chronic_disease, is_smoker, is_on_medication, allow_sms_alerts, allow_email_alerts, is_discoverable, allow_emergency_direct_contact, hide_from_leaderboard, notification_radius_km, preferred_language, consent_terms, consent_privacy, consent_notifications, status, timeout_until, deleted_at, created_at, updated_at",
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const response = NextResponse.json(data);
  if (parsed.data.preferred_language && ["en", "hi"].includes(parsed.data.preferred_language)) {
    response.cookies.set("donorix_locale", parsed.data.preferred_language, {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
    });
  }

  return response;
}
