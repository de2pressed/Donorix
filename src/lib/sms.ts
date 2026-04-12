import twilio from "twilio";

import { env, hasTwilioEnv } from "@/lib/env";

export async function sendSms(to: string, body: string) {
  if (!hasTwilioEnv || !env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_PHONE_NUMBER) {
    return { skipped: true, reason: "Twilio not configured" };
  }

  const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

  const message = await client.messages.create({
    to,
    body,
    from: env.TWILIO_PHONE_NUMBER,
  });

  return { skipped: false, sid: message.sid };
}
