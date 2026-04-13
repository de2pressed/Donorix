import { NextResponse } from "next/server";

import { getNotifications } from "@/lib/data";
import { requireServerUser } from "@/lib/http";

export async function GET(request: Request) {
  const { profile } = await requireServerUser(request);

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await getNotifications(profile.id);

  return NextResponse.json({ notifications });
}
