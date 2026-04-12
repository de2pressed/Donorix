import { z } from "zod";

import { BLOOD_TYPES } from "@/lib/constants";
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
  preferred_language: z.string().min(2).max(10),
  is_available: z.boolean(),
  consent_notifications: z.boolean(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
