import { NextRequest, NextResponse } from "next/server";

import { jsonError } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/utils/sanitize";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { message?: string; language?: string } | null;

  if (!body?.message) {
    return jsonError("Message is required", 422);
  }

  const rateLimit = await enforceRateLimit(`chatbot:${request.headers.get("x-forwarded-for") ?? "anonymous"}`);
  if (!rateLimit.success) {
    return jsonError("Too many requests", 429);
  }

  const message = sanitizeText(body.message).toLowerCase();
  const language = body.language ?? "en";

  let reply =
    "I can help you create a blood request, explain donor eligibility, or guide you to the live feed. Connect OPENAI_API_KEY to replace this fallback response with the multilingual model-backed assistant.";

  if (message.includes("eligib")) {
    reply =
      "Donors typically need to be 18+, weigh at least 50 kg, and observe a 90-day gap after whole blood donation. Final eligibility must still be confirmed by the supervising hospital.";
  } else if (message.includes("emergency")) {
    reply =
      "Emergency posts receive priority ranking, but Donorix is not an emergency service. Call 112 or your nearest hospital immediately in life-threatening situations.";
  } else if (message.includes("post") || message.includes("request")) {
    reply =
      "To create a request, share patient name, blood group, hospital, city, contact details, required-by time, and whether the case is emergency. The /posts/new flow validates each field.";
  }

  return NextResponse.json({ reply, language });
}
