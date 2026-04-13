import { differenceInYears, isValid, parseISO } from "date-fns";
import { z } from "zod";

import { ACCOUNT_TYPES, HOSPITAL_TYPE_VALUES } from "@/lib/account";
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

export const donorSignupProfileSeedSchema = z.object({
  account_type: z.literal("donor"),
  full_name: z.string().min(2).max(100).trim(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, and underscores"),
  email: z.string().email(),
  phone: z.string().refine(validatePhoneNumber, "Invalid mobile number"),
  date_of_birth: z.string().refine(isRealAdultDate, "You must be at least 18 years old to register"),
  gender: z.enum(["male", "female", "non_binary", "other", "prefer_not_to_say"]),
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

export const hospitalSignupProfileSeedSchema = z.object({
  account_type: z.literal("hospital"),
  email: z.string().email(),
  phone: z.string().refine(validatePhoneNumber, "Invalid mobile number"),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  pincode: z.string().regex(/^\d{6}$/, "Invalid Indian pincode"),
  preferred_language: z.string().min(2).max(10).default("en"),
  consent_terms: z.boolean().refine((value) => value, "You must accept the Terms of Use"),
  consent_privacy: z.boolean().refine((value) => value, "You must accept the Privacy Policy"),
  consent_notifications: z.boolean(),
  hospital_name: z.string().min(3).max(160).trim(),
  hospital_type: z.enum(HOSPITAL_TYPE_VALUES),
  registration_number: z.string().min(4).max(80).trim(),
  address: z.string().min(10).max(500).trim(),
  contact_person_name: z.string().min(2).max(100).trim(),
  official_contact_email: z.string().email(),
  official_contact_phone: z.string().refine(validatePhoneNumber, "Invalid mobile number"),
  consent_hospital_verification: z
    .boolean()
    .refine((value) => value, "You must acknowledge that hospital details may be verified."),
});

export const signupProfileSeedSchema = z.discriminatedUnion("account_type", [
  donorSignupProfileSeedSchema,
  hospitalSignupProfileSeedSchema,
]);

export const donorSignupSchema = donorSignupProfileSeedSchema
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

export const hospitalSignupSchema = hospitalSignupProfileSeedSchema
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

export const signupSchema = donorSignupSchema;

export const loginSchema = z.object({
  account_type: z.enum(ACCOUNT_TYPES).optional(),
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

export const changePasswordSchema = resetPasswordSchema.extend({
  current_password: z.string().min(8, "Enter your current password"),
});

export const deleteAccountSchema = z.object({
  confirmation: z.literal("DELETE"),
});
