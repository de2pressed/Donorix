import { NextRequest, NextResponse } from "next/server";

import { jsonError, requireServerUser } from "@/lib/http";

type BulkDeleteBody = {
  postIds?: unknown;
};

function normalizePostIds(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as string[];
  }

  return [
    ...new Set(
      value
        .filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
        .map((entry) => entry.trim()),
    ),
  ];
}

export async function POST(request: NextRequest) {
  const { supabase, profile } = await requireServerUser(request);

  if (!supabase || !profile) {
    return jsonError("Unauthorized", 401);
  }

  if (profile.account_type !== "hospital" && !profile.is_admin) {
    return jsonError("Forbidden", 403);
  }

  const body = (await request.json().catch(() => null)) as BulkDeleteBody | null;
  const postIds = normalizePostIds(body?.postIds);

  if (!postIds.length) {
    return jsonError("At least one post is required.", 422);
  }

  let query = supabase.from("posts").select("id, created_by, status").in("id", postIds);

  if (!profile.is_admin) {
    query = query.eq("created_by", profile.id);
  }

  const { data, error } = await query;

  if (error) {
    return jsonError(error.message, 500);
  }

  const matchedRows = data ?? [];
  if (matchedRows.length !== postIds.length) {
    return jsonError("One or more posts could not be found.", 404);
  }

  const deletableIds = matchedRows.filter((post) => post.status !== "deleted").map((post) => post.id);

  if (!deletableIds.length) {
    return NextResponse.json({ ok: true, deletedCount: 0, deletedIds: [] });
  }

  const { error: updateError } = await supabase
    .from("posts")
    .update({ status: "deleted" })
    .in("id", deletableIds);

  if (updateError) {
    return jsonError(updateError.message, 500);
  }

  return NextResponse.json({
    ok: true,
    deletedCount: deletableIds.length,
    deletedIds: deletableIds,
  });
}
