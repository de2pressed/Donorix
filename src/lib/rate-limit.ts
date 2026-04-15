import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { env, hasUpstashEnv } from "@/lib/env";

let ratelimit: Ratelimit | null = null;
let warnedMissingUpstash = false;

export function getRateLimiter() {
  if (!hasUpstashEnv || !env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    if (process.env.NODE_ENV === "development" && !warnedMissingUpstash) {
      warnedMissingUpstash = true;
      console.warn("[rate-limit] Upstash not configured - rate limiting disabled");
    }
    return null;
  }

  if (!ratelimit) {
    const redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });

    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "1 m"),
      analytics: true,
      prefix: "donorix",
    });
  }

  return ratelimit;
}

export async function enforceRateLimit(identifier: string) {
  const limiter = getRateLimiter();
  if (!limiter) return { success: true };

  return limiter.limit(identifier);
}
