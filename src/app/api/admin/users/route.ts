import { NextResponse } from "next/server";

import { getLeaderboard } from "@/lib/data";
import { jsonError, requireServerUser } from "@/lib/http";

export async function GET() {
  const { profile } = await requireServerUser();

  if (!profile?.is_admin) {
    return jsonError("Forbidden", 403);
  }

  const users = await getLeaderboard();
  return NextResponse.json({ users });
}
