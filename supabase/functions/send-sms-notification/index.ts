import { createClient } from "jsr:@supabase/supabase-js@2";
import twilio from "npm:twilio@5.13.1";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const client = twilio(
  Deno.env.get("TWILIO_ACCOUNT_SID")!,
  Deno.env.get("TWILIO_AUTH_TOKEN")!,
);

Deno.serve(async (request) => {
  const { post_id } = await request.json();

  const { data: post } = await supabase
    .from("posts")
    .select("id, blood_type_needed, units_needed, hospital_name, city, is_emergency")
    .eq("id", post_id)
    .single();

  if (!post) {
    return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
  }

  const { data: donors } = await supabase
    .from("profiles")
    .select("id, phone")
    .eq("blood_type", post.blood_type_needed)
    .eq("is_available", true)
    .eq("consent_notifications", true)
    .limit(50);

  let sent = 0;

  for (const donor of donors ?? []) {
    await client.messages.create({
      to: donor.phone,
      from: Deno.env.get("TWILIO_PHONE_NUMBER")!,
      body: `${post.is_emergency ? "EMERGENCY: " : ""}${post.blood_type_needed} blood needed at ${post.hospital_name}, ${post.city}. ${post.units_needed} units requested.`,
    });
    sent += 1;
  }

  return new Response(JSON.stringify({ sent }), { status: 200 });
});
