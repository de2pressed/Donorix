import { differenceInYears, isValid, parseISO } from "date-fns";
import { z } from "zod";

import { BLOOD_TYPES } from "@/lib/constants";
import { validatePhoneNumber } from "@/lib/utils/phone";

const minimumAdultAgeYears = 18;
const minimumWeightKg = 50;

function isRealAdultDate(value: string) {
  const date = parseISO(`${value}T00:00:00`);
  if (!isValid(date)) return false;

  const [year, month, day] = value.split("-").map(Number);
  if (
    date.getFullYear() !== year ||
    date.getMonth() + 1 !== month ||
    date.getDate() !== day
  ) {
    return false;
  }

  return differenceInYears(new Date(), date) >= minimumAdultAgeYears;
}

export const signupProfileSeedSchema = z.object({
  full_name: z.string().min(2).max(100).trim(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, and underscores"),
  email: z.string().email(),
  phone: z.string().refine(validatePhoneNumber, "Invalid mobile number"),
  date_of_birth: z.string().refine(isRealAdultDate, "You must be at least 18 years old to register"),
  gender: z.enum(["male", "female", "non_binary", "prefer_not_to_say"]),
  blood_type: z.enum(BLOOD_TYPES),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  pincode: z.string().regex(/^\d{6}$/, "Invalid Indian pincode"),
  weight_kg: z.coerce
    .number()
    .min(minimumWeightKg, "Minimum weight for blood donation eligibility is 50 kg")
    .max(200),
  has_chronic_disease: z.boolean(),
  is_smoker: z.boolean(),
  is_on_medication: z.boolean(),
  consent_terms: z.boolean().refine((value) => value, "You must accept the Terms of Use"),
  consent_privacy: z.boolean().refine((value) => value, "You must accept the Privacy Policy"),
  consent_notifications: z.boolean(),
});

export const signupSchema = signupProfileSeedSchema
  .extend({
    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/, "Must contain uppercase")
      .regex(/[0-9]/, "Must contain number")
      .regex(/[^A-Za-z0-9]/, "Must contain special character"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/, "Must contain uppercase")
      .regex(/[0-9]/, "Must contain number")
      .regex(/[^A-Za-z0-9]/, "Must contain special character"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });
