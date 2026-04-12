import { NextResponse } from "next/server";

import { requireServerUser } from "@/lib/http";

export async function GET() {
  const { profile } = await requireServerUser();

  if (!profile) {
    return NextResponse.json(null, { status: 401 });
  }

  return NextResponse.json(profile);
}
