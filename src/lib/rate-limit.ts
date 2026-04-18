import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { env, hasUpstashEnv } from "@/lib/env";

type RateLimitOptions = {
  points?: number;
  duration?: Duration;
  prefix?: string;
};

const rateLimiters = new Map<string, Ratelimit>();
let warnedMissingUpstash = false;

function getLimiterKey(options: RateLimitOptions) {
  return JSON.stringify({
    points: options.points ?? 30,
    duration: options.duration ?? "1 m",
    prefix: options.prefix ?? "donorix",
  });
}

export function getRateLimiter(options: RateLimitOptions = {}) {
  if (!hasUpstashEnv || !env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    if (process.env.NODE_ENV === "development" && !warnedMissingUpstash) {
      warnedMissingUpstash = true;
      console.warn("[rate-limit] Upstash not configured - rate limiting disabled");
    }
    return null;
  }

  const cacheKey = getLimiterKey(options);
  const cached = rateLimiters.get(cacheKey);
  if (cached) {
    return cached;
  }

  const points = options.points ?? 30;
  const duration = options.duration ?? "1 m";
  const prefix = options.prefix ?? "donorix";

  const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(points, duration),
    analytics: true,
    prefix,
  });

  rateLimiters.set(cacheKey, limiter);
  return limiter;
}

export async function enforceRateLimit(identifier: string, options: RateLimitOptions = {}) {
  const limiter = getRateLimiter(options);
  if (!limiter) {
    return { success: true };
  }

  try {
    return await limiter.limit(identifier);
  } catch (error) {
    console.warn("[rate-limit] Allowing request after limiter error", {
      identifier,
      error: error instanceof Error ? error.message : error,
    });
    return { success: true };
  }
}
