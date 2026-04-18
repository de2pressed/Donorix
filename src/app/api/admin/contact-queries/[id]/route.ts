import { NextRequest, NextResponse } from "next/server";

import { requireAdminUser } from "@/lib/http";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

type QueryUpdateBody = {
  reply?: unknown;
  status?: unknown;
};

export async function PATCH(
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

  const body = (await request.json().catch(() => null)) as QueryUpdateBody | null;
  const reply = typeof body?.reply === "string" ? body.reply.trim() : "";
  const status =
    body?.status === "solved" || body?.status === "unresolved" ? body.status : undefined;

  const updates: Database["public"]["Tables"]["contact_queries"]["Update"] = {};
  if (typeof body?.reply === "string") {
    updates.reply = reply || null;
  }
  if (status) {
    updates.status = status;
  } else if (reply) {
    updates.status = "solved";
  }
  if (reply) {
    updates.replied_by = profile.id;
    updates.replied_at = new Date().toISOString();
  } else if (body?.reply === "") {
    updates.replied_by = null;
    updates.replied_at = null;
  }

  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 422 });
  }

  const { error, data } = await supabase
    .from("contact_queries")
    .update(updates)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Query not found." }, { status: 404 });
  }

  const { error: logError } = await supabase.from("admin_actions").insert({
    admin_id: profile.id,
    action: reply ? "reply_contact_query" : status === "solved" ? "solve_contact_query" : "update_contact_query",
    target_type: "contact_query",
    target_id: id,
    reason: reply || status || "updated",
    metadata: null,
  });

  if (logError) {
    return NextResponse.json({ error: logError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
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

  const { error, data } = await supabase
    .from("contact_queries")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Query not found." }, { status: 404 });
  }

  const { error: logError } = await supabase.from("admin_actions").insert({
    admin_id: profile.id,
    action: "delete_contact_query",
    target_type: "contact_query",
    target_id: id,
    reason: "deleted by admin",
    metadata: null,
  });

  if (logError) {
    return NextResponse.json({ error: logError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
