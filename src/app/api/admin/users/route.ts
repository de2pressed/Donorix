import { NextResponse } from "next/server";

import { getAdminUsers } from "@/lib/data";
import { jsonError, requireServerUser } from "@/lib/http";

export async function GET(request: Request) {
  const { profile } = await requireServerUser(request);

  if (!profile?.is_admin) {
    return jsonError("Forbidden", 403);
  }

  const users = await getAdminUsers();
  return NextResponse.json({ users });
}
