import { NextResponse } from "next/server";

import { PROFILE_SELECT, requireServerUser } from "@/lib/http";
import { updateProfileSchema } from "@/lib/validations/profile";

export async function GET(request: Request) {
  const { profile } = await requireServerUser(request);

  if (!profile) {
    return NextResponse.json(null, { status: 401 });
  }

  return NextResponse.json(profile);
}

export async function PATCH(request: Request) {
  const { supabase, profile } = await requireServerUser(request);

  if (!supabase || !profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const parsed = updateProfileSchema.safeParse(body);

  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    const firstError =
      flattened.formErrors[0] ??
      flattened.fieldErrors.full_name?.[0] ??
      flattened.fieldErrors.username?.[0] ??
      flattened.fieldErrors.phone?.[0] ??
      flattened.fieldErrors.blood_type?.[0] ??
      flattened.fieldErrors.city?.[0] ??
      flattened.fieldErrors.state?.[0] ??
      flattened.fieldErrors.pincode?.[0] ??
      flattened.fieldErrors.preferred_language?.[0] ??
      flattened.fieldErrors.notification_radius_km?.[0] ??
      "Invalid profile update payload";

    return NextResponse.json({ error: firstError, details: flattened }, { status: 422 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(parsed.data)
    .eq("id", profile.id)
    .select(PROFILE_SELECT)
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
