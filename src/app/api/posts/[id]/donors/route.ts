import { NextRequest, NextResponse } from "next/server";

import { jsonError, requireServerUser } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/utils/sanitize";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, profile } = await requireServerUser();

  if (!supabase || !profile) {
    return jsonError("Unauthorized", 401);
  }

  const rateLimit = await enforceRateLimit(`donor-application:${profile.id}`);
  if (!rateLimit.success) {
    return jsonError("Too many requests", 429);
  }

  const body = (await request.json().catch(() => ({}))) as { note?: string };

  const { error } = await supabase.from("donor_applications").insert({
      post_id: id,
      donor_id: profile.id,
    status: "pending",
    eligibility_score: 80,
    note: body.note ? sanitizeText(body.note) : null,
  });

  if (error) {
    return jsonError(error.message, 500);
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
