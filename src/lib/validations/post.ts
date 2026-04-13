import { addHours } from "date-fns";
import { z } from "zod";

import { BLOOD_TYPES } from "@/lib/constants";
import { validatePhoneNumber } from "@/lib/utils/phone";

export const createPostSchema = z.object({
  patient_name: z.string().min(2).max(100).trim(),
  patient_id: z.string().min(2).max(80).trim(),
  blood_type_needed: z.enum(BLOOD_TYPES),
  units_needed: z.coerce.number().int().min(1).max(10),
  hospital_name: z.string().min(3).max(200).trim().optional(),
  hospital_address: z.string().min(5).max(500).trim().optional(),
  city: z.string().min(2).max(100).trim().optional(),
  state: z.string().min(2).max(100).trim().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  contact_name: z.string().min(2).max(100).trim(),
  contact_phone: z
    .string()
    .refine(validatePhoneNumber, "Invalid mobile number"),
  contact_email: z.union([z.string().email(), z.literal(""), z.undefined()]).optional(),
  medical_condition: z
    .string()
    .trim()
    .min(8, "Please describe the patient's medical condition or reason for blood requirement.")
    .max(500),
  additional_notes: z.string().max(1000).optional(),
  is_emergency: z.boolean().default(false),
  required_by: z
    .string()
    .datetime()
    .refine((value) => new Date(value) > addHours(new Date(), -1), "Required by must be in future"),
  initial_radius_km: z.coerce.number().int().min(1).max(35).default(7),
});

export const updatePostSchema = createPostSchema.partial();

export type CreatePostInput = z.infer<typeof createPostSchema>;
