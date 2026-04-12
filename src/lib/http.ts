import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireServerUser() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { supabase, user: null, profile: null };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, email, phone, full_name, username, avatar_url, blood_type, gender, date_of_birth, city, state, pincode, weight_kg, last_donated_at, total_donations, karma, is_admin, is_available, is_verified, has_chronic_disease, is_smoker, is_on_medication, preferred_language, consent_terms, consent_privacy, consent_notifications, status, timeout_until, deleted_at, created_at, updated_at",
    )
    .eq("id", user.id)
    .single();

  return { supabase, user, profile };
}
