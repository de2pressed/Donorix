import { NextResponse } from "next/server";

import { getNotifications } from "@/lib/data";
import { requireServerUser } from "@/lib/http";

export async function GET(request: Request) {
  const { profile } = await requireServerUser(request);

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await getNotifications(profile.id);

  return NextResponse.json({ notifications });
}

export async function PATCH(request: Request) {
  const { supabase, profile } = await requireServerUser(request);

  if (!supabase || !profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { ids?: string[]; all?: boolean }
    | null;

  const updateQuery = supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", profile.id)
    .is("read_at", null);

  if (body?.all) {
    const { error } = await updateQuery;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  }

  if (body?.ids?.length) {
    const { error } = await updateQuery.in("id", body.ids);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "ids or all is required" }, { status: 422 });
}
