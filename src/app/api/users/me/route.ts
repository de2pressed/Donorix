import { NextResponse } from "next/server";

import { PROFILE_SELECT, requireServerUser } from "@/lib/http";
import { profileSchema } from "@/lib/validations/profile";

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
  const parsed = profileSchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid profile update payload" }, { status: 422 });
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
