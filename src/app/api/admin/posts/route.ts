import { NextResponse } from "next/server";

import { getFeedPosts } from "@/lib/data";
import { jsonError, requireServerUser } from "@/lib/http";

export async function GET() {
  const { profile } = await requireServerUser();

  if (!profile?.is_admin) {
    return jsonError("Forbidden", 403);
  }

  const posts = await getFeedPosts();
  return NextResponse.json({ posts });
}
