import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { jsonError, requireServerUser } from "@/lib/http";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { changePasswordSchema } from "@/lib/validations/auth";
import type { Database } from "@/types/database";

function createPasswordVerifierClient() {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function POST(request: Request) {
  const { user, profile } = await requireServerUser(request);

  if (!user?.email) {
    return jsonError("Unauthorized", 401);
  }

  if (profile?.is_demo) {
    return jsonError("Demo accounts cannot change passwords.", 403);
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const parsed = changePasswordSchema.safeParse(body);

  if (!parsed.success) {
    const firstError =
      parsed.error.flatten().fieldErrors.current_password?.[0] ??
      parsed.error.flatten().fieldErrors.password?.[0] ??
      parsed.error.flatten().fieldErrors.confirm_password?.[0] ??
      parsed.error.flatten().formErrors[0] ??
      "Invalid password update payload";
    return jsonError(firstError, 422);
  }

  const verifierClient = createPasswordVerifierClient();
  const adminClient = getSupabaseAdminClient();

  if (!verifierClient || !adminClient) {
    return jsonError("Supabase admin auth is not configured.", 500);
  }

  const { error: verifyError } = await verifierClient.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.current_password,
  });

  if (verifyError) {
    return jsonError("Current password is incorrect.", 400);
  }

  const { error: updateError } = await adminClient.auth.admin.updateUserById(user.id, {
    password: parsed.data.password,
  });

  if (updateError) {
    return jsonError(updateError.message, 500);
  }

  return NextResponse.json({ ok: true });
}
