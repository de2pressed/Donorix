import { NextRequest, NextResponse } from "next/server";

import { jsonError, requireServerUser } from "@/lib/http";

function buildSubject(query: string) {
  const normalized = query.trim().replace(/\s+/g, " ");
  if (!normalized) {
    return "Support query";
  }

  return normalized.length > 80 ? `${normalized.slice(0, 77).trimEnd()}...` : normalized;
}

export async function POST(request: NextRequest) {
  const { supabase, profile } = await requireServerUser(request);

  if (!supabase || !profile) {
    return jsonError("Unauthorized", 401);
  }

  const body = (await request.json().catch(() => null)) as { query?: unknown } | null;
  const rawQuery = typeof body?.query === "string" ? body.query.trim() : "";

  if (rawQuery.length < 10) {
    return jsonError("Please enter a longer query.", 422);
  }

  const subject = buildSubject(rawQuery);

  const { error } = await supabase.from("contact_queries").insert({
    submitted_by: profile.id,
    submitted_name: profile.full_name,
    submitted_email: profile.email,
    submitted_phone: profile.phone,
    submitted_account_type: profile.account_type,
    subject,
    query: rawQuery,
    status: "unresolved",
    reply: null,
    replied_by: null,
    replied_at: null,
  });

  if (error) {
    return jsonError(error.message, 500);
  }

  return NextResponse.json({ ok: true });
}
