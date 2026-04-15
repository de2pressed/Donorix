import { addDays } from "date-fns";
import { NextRequest, NextResponse } from "next/server";

import { requireAdminUser } from "@/lib/http";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { profile } = await requireAdminUser(request);

  if (!profile) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase admin auth is not configured." }, { status: 500 });
  }

  const body = (await request.json().catch(() => null)) as
    | { action?: "suspend" | "restore" | "delete"; reason?: string | null }
    | null;

  if (!body?.action) {
    return NextResponse.json({ error: "Action is required." }, { status: 422 });
  }

  const now = new Date().toISOString();

  if (body.action === "suspend") {
    const { error } = await supabase
      .from("profiles")
      .update({
        status: "timeout",
        timeout_until: addDays(new Date(), 30).toISOString(),
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else if (body.action === "restore") {
    const { error } = await supabase
      .from("profiles")
      .update({
        status: "active",
        timeout_until: null,
        deleted_at: null,
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else if (body.action === "delete") {
    const { error } = await supabase
      .from("profiles")
      .update({
        status: "deleted",
        deleted_at: now,
        is_available: false,
        is_discoverable: false,
        hide_from_leaderboard: true,
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }

  const { error: logError } = await supabase.from("admin_actions").insert({
    admin_id: profile.id,
    action: body.action,
    target_type: "user",
    target_id: id,
    reason: body.reason ?? "",
    metadata: null,
  });

  if (logError) {
    return NextResponse.json({ error: logError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
