import { NextRequest, NextResponse } from "next/server";

import { getHospitalChatThread } from "@/lib/data";
import { jsonError, requireServerUser } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { sanitizeText } from "@/lib/utils/sanitize";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { profile } = await requireServerUser(request);

  if (!profile) {
    return jsonError("Unauthorized", 401);
  }

  const thread = await getHospitalChatThread(id, profile);

  if (!thread) {
    return jsonError("Chat thread not found", 404);
  }

  return NextResponse.json({ thread });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { profile } = await requireServerUser(request);

  if (!profile) {
    return jsonError("Unauthorized", 401);
  }

  const thread = await getHospitalChatThread(id, profile);
  if (!thread) {
    return jsonError("Chat thread not found", 404);
  }

  const rateLimit = await enforceRateLimit(`chat-message:${id}:${profile.id}`);
  if (!rateLimit.success) {
    return jsonError("Too many requests", 429);
  }

  const body = (await request.json().catch(() => null)) as { message?: string } | null;
  const message = sanitizeText(body?.message ?? "").trim();

  if (!message) {
    return jsonError("Message is required", 422);
  }

  const recipientId = profile.id === thread.post.created_by ? thread.post.approved_donor_id : thread.post.created_by;
  if (!recipientId) {
    return jsonError("Recipient not found", 404);
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return jsonError("Supabase admin client is not configured.", 503);
  }

  const { data, error } = await admin
    .from("chat_messages")
    .insert({
      post_id: id,
      sender_id: profile.id,
      recipient_id: recipientId,
      message,
    })
    .select("id, post_id, sender_id, recipient_id, message, created_at")
    .single();

  if (error) {
    return jsonError(error.message, 500);
  }

  const notificationTitle = "New chat message";
  const notificationBody = `${profile.full_name ?? "A contact"} sent a chat message for patient ${thread.post.patient_name}.`;

  await admin.from("notifications").insert({
    user_id: recipientId,
    type: "chat_message",
    title: notificationTitle,
    body: notificationBody,
    post_id: id,
    data: {
      post_id: id,
      sender_id: profile.id,
    },
  });

  return NextResponse.json({ ok: true, message: data }, { status: 201 });
}
