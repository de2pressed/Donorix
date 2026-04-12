import { createClient } from "jsr:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async () => {
  const { data: posts } = await supabase
    .from("posts")
    .select("id, current_radius_km")
    .eq("status", "active")
    .lt("current_radius_km", 35);

  for (const post of posts ?? []) {
    await supabase
      .from("posts")
      .update({ current_radius_km: Math.min(35, post.current_radius_km + 5) })
      .eq("id", post.id);
  }

  return new Response(JSON.stringify({ expanded: posts?.length ?? 0 }), { status: 200 });
});
