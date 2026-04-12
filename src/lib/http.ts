import type { SupabaseClient, User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { signupProfileSeedSchema } from "@/lib/validations/auth";
import type { Database } from "@/types/database";
import type { Profile } from "@/types/user";

const PROFILE_SELECT =
  "id, email, phone, full_name, username, avatar_url, blood_type, gender, date_of_birth, city, state, pincode, weight_kg, last_donated_at, total_donations, karma, is_admin, is_available, is_verified, has_chronic_disease, is_smoker, is_on_medication, preferred_language, consent_terms, consent_privacy, consent_notifications, status, timeout_until, deleted_at, created_at, updated_at";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function ensureProfile(
  supabase: SupabaseClient<Database>,
  user: User,
): Promise<Profile | null> {
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfile) {
    return existingProfile as Profile;
  }

  if (!user.email) {
    return null;
  }

  const parsedMetadata = signupProfileSeedSchema.safeParse({
    ...user.user_metadata,
    email: user.email,
  });

  if (!parsedMetadata.success) {
    return null;
  }

  const { data: insertedProfile } = await supabase
    .from("profiles")
    .insert({
      ...parsedMetadata.data,
      id: user.id,
    })
    .select(PROFILE_SELECT)
    .single();

  return (insertedProfile as Profile | null) ?? null;
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

  const profile = await ensureProfile(supabase, user);

  return { supabase, user, profile };
}
