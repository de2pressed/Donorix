import type { SupabaseClient, User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { buildHospitalUsername } from "@/lib/account";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { signupProfileSeedSchema } from "@/lib/validations/auth";
import type { Database } from "@/types/database";
import type { HospitalAccount, Profile } from "@/types/user";

export const PROFILE_SELECT =
  "id, email, phone, full_name, username, avatar_url, account_type, blood_type, gender, date_of_birth, city, state, pincode, weight_kg, last_donated_at, total_donations, karma, is_admin, is_available, is_verified, has_chronic_disease, is_smoker, is_on_medication, allow_sms_alerts, allow_email_alerts, is_discoverable, allow_emergency_direct_contact, hide_from_leaderboard, notification_radius_km, preferred_language, consent_terms, consent_privacy, consent_notifications, status, timeout_until, deleted_at, is_demo, created_at, updated_at";

export const HOSPITAL_ACCOUNT_SELECT =
  "profile_id, hospital_name, hospital_type, registration_number, address, city, state, pincode, official_contact_email, official_contact_phone, contact_person_name, verification_status, created_at, updated_at";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function getRequestAccessToken(request?: Request) {
  const authorization = request?.headers.get("authorization")?.trim();

  if (!authorization?.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  const token = authorization.slice(7).trim();
  return token || null;
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

  const profileInsert =
    parsedMetadata.data.account_type === "hospital"
      ? {
          id: user.id,
          account_type: "hospital" as const,
          email: parsedMetadata.data.email,
          phone: parsedMetadata.data.official_contact_phone,
          full_name: parsedMetadata.data.hospital_name,
          username: buildHospitalUsername(
            parsedMetadata.data.hospital_name,
            parsedMetadata.data.registration_number,
          ),
          city: parsedMetadata.data.city,
          state: parsedMetadata.data.state,
          pincode: parsedMetadata.data.pincode,
          gender: "prefer_not_to_say",
          blood_type: null,
          date_of_birth: null,
          weight_kg: null,
          is_available: false,
          consent_terms: parsedMetadata.data.consent_terms,
          consent_privacy: parsedMetadata.data.consent_privacy,
          consent_notifications: parsedMetadata.data.consent_notifications,
          preferred_language: parsedMetadata.data.preferred_language,
        }
      : {
          ...parsedMetadata.data,
          id: user.id,
        };

  const { data: insertedProfile } = await supabase.from("profiles").insert(profileInsert).select(PROFILE_SELECT).single();

  if (parsedMetadata.data.account_type === "hospital") {
    await supabase.from("hospital_accounts").upsert({
      profile_id: user.id,
      hospital_name: parsedMetadata.data.hospital_name,
      hospital_type: parsedMetadata.data.hospital_type,
      registration_number: parsedMetadata.data.registration_number,
      address: parsedMetadata.data.address,
      city: parsedMetadata.data.city,
      state: parsedMetadata.data.state,
      pincode: parsedMetadata.data.pincode,
      official_contact_email: parsedMetadata.data.official_contact_email,
      official_contact_phone: parsedMetadata.data.official_contact_phone,
      contact_person_name: parsedMetadata.data.contact_person_name,
      verification_status: "unverified",
    });
  }

  return (insertedProfile as Profile | null) ?? null;
}

export async function requireServerUser(request?: Request) {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { supabase, user: null, profile: null };
  }

  const accessToken = getRequestAccessToken(request);
  const {
    data: { user },
  } = accessToken ? await supabase.auth.getUser(accessToken) : await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, profile: null };
  }

  const profile = await ensureProfile(supabase, user);
  let hospitalAccount: HospitalAccount | null = null;

  if (profile?.account_type === "hospital") {
    const { data } = await supabase
      .from("hospital_accounts")
      .select(HOSPITAL_ACCOUNT_SELECT)
      .eq("profile_id", profile.id)
      .maybeSingle();

    hospitalAccount = (data as HospitalAccount | null) ?? null;
  }

  return { supabase, user, profile, hospitalAccount };
}
