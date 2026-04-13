import { NextResponse } from "next/server";

import { jsonError, requireServerUser } from "@/lib/http";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { deleteAccountSchema } from "@/lib/validations/auth";

const DELETION_BAN_DURATION = "876000h";

export async function POST(request: Request) {
  const { supabase, user, profile } = await requireServerUser(request);

  if (!supabase || !user || !profile) {
    return jsonError("Unauthorized", 401);
  }

  if (profile.is_demo) {
    return jsonError("Demo accounts cannot be deleted.", 403);
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const parsed = deleteAccountSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Type DELETE to confirm account deletion.", 422);
  }

  const adminClient = getSupabaseAdminClient();

  if (!adminClient) {
    return jsonError("Supabase admin auth is not configured.", 500);
  }

  const deletedAt = new Date().toISOString();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      status: "deleted",
      deleted_at: deletedAt,
      is_available: false,
      is_discoverable: false,
      consent_notifications: false,
      allow_sms_alerts: false,
      allow_email_alerts: false,
    })
    .eq("id", profile.id);

  if (profileError) {
    return jsonError(profileError.message, 500);
  }

  if (profile.account_type === "hospital") {
    await supabase
      .from("posts")
      .update({ status: "deleted" })
      .eq("created_by", profile.id)
      .in("status", ["active", "fulfilled"]);
  }

  const { error: authError } = await adminClient.auth.admin.updateUserById(user.id, {
    ban_duration: DELETION_BAN_DURATION,
    user_metadata: {
      ...(user.user_metadata ?? {}),
      deactivated: true,
      deleted_at: deletedAt,
    },
    app_metadata: {
      ...(user.app_metadata ?? {}),
      status: "deleted",
    },
  });

  if (authError) {
    return jsonError(authError.message, 500);
  }

  return NextResponse.json({
    ok: true,
    message:
      "Your account has been scheduled for deletion. Your data will be permanently removed within 30 days.",
  });
}
