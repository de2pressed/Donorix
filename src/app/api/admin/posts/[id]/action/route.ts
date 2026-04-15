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
    | { action?: "expire" | "delete" | "fulfill"; reason?: string | null }
    | null;

  if (!body?.action) {
    return NextResponse.json({ error: "Action is required." }, { status: 422 });
  }

  const updates =
    body.action === "expire"
      ? { status: "expired" as const, expires_at: new Date().toISOString() }
      : body.action === "fulfill"
        ? { status: "fulfilled" as const }
        : body.action === "delete"
          ? { status: "deleted" as const }
          : null;

  if (!updates) {
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }

  const { error } = await supabase.from("posts").update(updates).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { error: logError } = await supabase.from("admin_actions").insert({
    admin_id: profile.id,
    action: body.action,
    target_type: "post",
    target_id: id,
    reason: body.reason ?? "",
    metadata: null,
  });

  if (logError) {
    return NextResponse.json({ error: logError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
