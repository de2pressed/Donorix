import { NextResponse } from "next/server";

import { DEMO_ACCOUNTS, DEMO_ACCOUNT_EMAILS } from "@/lib/demo-accounts";
import { jsonError } from "@/lib/http";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

async function listUsersByEmail() {
  const admin = getSupabaseAdminClient();
  if (!admin) {
    return null;
  }

  const { data, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data.users.filter((user) => user.email && DEMO_ACCOUNT_EMAILS.includes(user.email as (typeof DEMO_ACCOUNT_EMAILS)[number]));
}

async function getDemoStatus() {
  const admin = getSupabaseAdminClient();
  if (!admin) {
    return null;
  }

  const users = await listUsersByEmail();
  const emailSet = new Set(users?.map((user) => user.email));

  const { data: profiles, error: profilesError } = await admin
    .from("profiles")
    .select("id, email")
    .in("email", [...DEMO_ACCOUNT_EMAILS]);

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  const hospitalProfile = profiles?.find((profile) => profile.email === DEMO_ACCOUNTS.hospital.email);
  let hasHospitalAccount = false;

  if (hospitalProfile?.id) {
    const { data: hospitalAccount, error: hospitalError } = await admin
      .from("hospital_accounts")
      .select("profile_id")
      .eq("profile_id", hospitalProfile.id)
      .maybeSingle();

    if (hospitalError) {
      throw new Error(hospitalError.message);
    }

    hasHospitalAccount = Boolean(hospitalAccount);
  }

  return {
    ready:
      emailSet.has(DEMO_ACCOUNTS.donor.email) &&
      emailSet.has(DEMO_ACCOUNTS.hospital.email) &&
      Boolean(profiles?.some((profile) => profile.email === DEMO_ACCOUNTS.donor.email)) &&
      Boolean(hospitalProfile) &&
      hasHospitalAccount,
  };
}

async function ensureDemoUser(
  email: string,
  password: string,
  metadata: Record<string, unknown>,
) {
  const admin = getSupabaseAdminClient();
  if (!admin) {
    throw new Error("Supabase admin client is not configured.");
  }

  const existingUsers = await listUsersByEmail();
  const existing = existingUsers?.find((user) => user.email === email);

  if (existing) {
    const { data, error } = await admin.auth.admin.updateUserById(existing.id, {
      email_confirm: true,
      password,
      user_metadata: metadata,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data.user;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data.user;
}

export async function GET() {
  try {
    const status = await getDemoStatus();

    if (!status) {
      return jsonError("Supabase admin configuration is missing.", 503);
    }

    return NextResponse.json(status);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to check demo account status.", 500);
  }
}

export async function POST() {
  try {
    const admin = getSupabaseAdminClient();
    if (!admin) {
      return jsonError("Supabase admin configuration is missing.", 503);
    }

    const currentStatus = await getDemoStatus();
    if (currentStatus?.ready) {
      return NextResponse.json({
        ready: true,
        created: false,
        message: "Demo accounts are already ready.",
      });
    }

    const donorUser = await ensureDemoUser(
      DEMO_ACCOUNTS.donor.email,
      DEMO_ACCOUNTS.donor.password,
      {
        account_type: "donor",
        ...DEMO_ACCOUNTS.donor.profile,
        email: DEMO_ACCOUNTS.donor.email,
      },
    );

    const hospitalUser = await ensureDemoUser(
      DEMO_ACCOUNTS.hospital.email,
      DEMO_ACCOUNTS.hospital.password,
      DEMO_ACCOUNTS.hospital.metadata,
    );

    const { error: donorProfileError } = await admin.from("profiles").upsert({
      id: donorUser.id,
      email: DEMO_ACCOUNTS.donor.email,
      account_type: "donor",
      is_demo: true,
      status: "active",
      ...DEMO_ACCOUNTS.donor.profile,
    });

    if (donorProfileError) {
      throw new Error(donorProfileError.message);
    }

    const { error: hospitalProfileError } = await admin.from("profiles").upsert({
      id: hospitalUser.id,
      email: DEMO_ACCOUNTS.hospital.email,
      account_type: "hospital",
      blood_type: null,
      date_of_birth: null,
      weight_kg: null,
      is_demo: true,
      status: "active",
      ...DEMO_ACCOUNTS.hospital.profile,
    });

    if (hospitalProfileError) {
      throw new Error(hospitalProfileError.message);
    }

    const { error: hospitalAccountError } = await admin.from("hospital_accounts").upsert({
      profile_id: hospitalUser.id,
      ...DEMO_ACCOUNTS.hospital.hospitalAccount,
    });

    if (hospitalAccountError) {
      throw new Error(hospitalAccountError.message);
    }

    return NextResponse.json({
      ready: true,
      created: true,
      message: "Demo accounts ready. You can now sign in.",
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to create demo accounts.", 500);
  }
}
