import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default("Donorix"),
  TWILIO_ACCOUNT_SID: z.string().min(1).optional(),
  TWILIO_AUTH_TOKEN: z.string().min(1).optional(),
  TWILIO_PHONE_NUMBER: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  NEXT_PUBLIC_MAPBOX_TOKEN: z.string().min(1).optional(),
  ADMIN_USER_ID_1: z.string().min(1).optional(),
  ADMIN_USER_ID_2: z.string().min(1).optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(32).optional(),
  CRON_SECRET: z.string().min(16).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  NOTIFICATION_FROM_EMAIL: z.string().email().optional(),
  DEMO_SETUP_TOKEN: z.string().min(16).optional(),
});

const rawEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY:
    typeof window === "undefined" ? process.env.SUPABASE_SERVICE_ROLE_KEY : undefined,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  TWILIO_ACCOUNT_SID: typeof window === "undefined" ? process.env.TWILIO_ACCOUNT_SID : undefined,
  TWILIO_AUTH_TOKEN: typeof window === "undefined" ? process.env.TWILIO_AUTH_TOKEN : undefined,
  TWILIO_PHONE_NUMBER: typeof window === "undefined" ? process.env.TWILIO_PHONE_NUMBER : undefined,
  OPENAI_API_KEY: typeof window === "undefined" ? process.env.OPENAI_API_KEY : undefined,
  UPSTASH_REDIS_REST_URL:
    typeof window === "undefined" ? process.env.UPSTASH_REDIS_REST_URL : undefined,
  UPSTASH_REDIS_REST_TOKEN:
    typeof window === "undefined" ? process.env.UPSTASH_REDIS_REST_TOKEN : undefined,
  NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
  ADMIN_USER_ID_1: typeof window === "undefined" ? process.env.ADMIN_USER_ID_1 : undefined,
  ADMIN_USER_ID_2: typeof window === "undefined" ? process.env.ADMIN_USER_ID_2 : undefined,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  NEXTAUTH_SECRET: typeof window === "undefined" ? process.env.NEXTAUTH_SECRET : undefined,
  CRON_SECRET: typeof window === "undefined" ? process.env.CRON_SECRET : undefined,
  RESEND_API_KEY: typeof window === "undefined" ? process.env.RESEND_API_KEY : undefined,
  NOTIFICATION_FROM_EMAIL:
    typeof window === "undefined" ? process.env.NOTIFICATION_FROM_EMAIL : undefined,
  DEMO_SETUP_TOKEN: typeof window === "undefined" ? process.env.DEMO_SETUP_TOKEN : undefined,
};

const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
  console.warn("Invalid environment variables detected", parsed.error.flatten().fieldErrors);
}

export const env = parsed.success ? parsed.data : envSchema.parse({});

export const hasSupabaseEnv =
  Boolean(env.NEXT_PUBLIC_SUPABASE_URL) && Boolean(env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const hasAdminSupabaseEnv = hasSupabaseEnv && Boolean(env.SUPABASE_SERVICE_ROLE_KEY);

export const hasUpstashEnv =
  Boolean(env.UPSTASH_REDIS_REST_URL) && Boolean(env.UPSTASH_REDIS_REST_TOKEN);

export const hasTwilioEnv =
  Boolean(env.TWILIO_ACCOUNT_SID) &&
  Boolean(env.TWILIO_AUTH_TOKEN) &&
  Boolean(env.TWILIO_PHONE_NUMBER);

export const adminUserIds = [env.ADMIN_USER_ID_1, env.ADMIN_USER_ID_2].filter(Boolean) as string[];
