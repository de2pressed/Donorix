import { z } from "zod";

import { BLOOD_TYPES, SUPPORTED_LANGUAGE_CODES } from "@/lib/constants";
import { validatePhoneNumber } from "@/lib/utils/phone";

export const profileSchema = z.object({
  full_name: z.string().min(2).max(100).trim(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, and underscores"),
  phone: z.string().refine(validatePhoneNumber, "Invalid mobile number"),
  blood_type: z.enum(BLOOD_TYPES),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  pincode: z.string().regex(/^\d{6}$/, "Invalid Indian pincode"),
  preferred_language: z.enum(SUPPORTED_LANGUAGE_CODES),
  is_available: z.boolean(),
  allow_sms_alerts: z.boolean(),
  allow_email_alerts: z.boolean(),
  is_discoverable: z.boolean(),
  allow_emergency_direct_contact: z.boolean(),
  hide_from_leaderboard: z.boolean(),
  notification_radius_km: z.number().int().min(5).max(50),
  consent_notifications: z.boolean(),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const updateProfileSchema = z
  .object({
    full_name: z.string().min(2).max(100).trim().optional(),
    username: z
      .string()
      .min(3)
      .max(30)
      .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, and underscores")
      .optional(),
    phone: z.string().refine(validatePhoneNumber, "Invalid mobile number").optional(),
    blood_type: z.enum(BLOOD_TYPES).optional(),
    city: z.string().min(2).max(100).optional(),
    state: z.string().min(2).max(100).optional(),
    pincode: z.string().regex(/^\d{6}$/, "Invalid Indian pincode").optional(),
    preferred_language: z.enum(SUPPORTED_LANGUAGE_CODES).optional(),
    is_available: z.boolean().optional(),
    allow_sms_alerts: z.boolean().optional(),
    allow_email_alerts: z.boolean().optional(),
    is_discoverable: z.boolean().optional(),
    allow_emergency_direct_contact: z.boolean().optional(),
    hide_from_leaderboard: z.boolean().optional(),
    notification_radius_km: z.number().int().min(5).max(50).optional(),
    consent_notifications: z.boolean().optional(),
  })
  .strict();

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
