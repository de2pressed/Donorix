import { z } from "zod";

import { BLOOD_TYPES } from "@/lib/constants";

const minimumAdultAgeYears = 18;

export const signupSchema = z
  .object({
    full_name: z.string().min(2).max(100).trim(),
    username: z
      .string()
      .min(3)
      .max(30)
      .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, and underscores"),
    email: z.string().email(),
    phone: z.string().regex(/^\+91[6-9]\d{9}$/, "Invalid Indian mobile number"),
    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/, "Must contain uppercase")
      .regex(/[0-9]/, "Must contain number")
      .regex(/[^A-Za-z0-9]/, "Must contain special character"),
    confirm_password: z.string(),
    date_of_birth: z.string().refine((value) => {
      const age = (Date.now() - new Date(value).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      return age >= minimumAdultAgeYears;
    }, "You must be at least 18 years old"),
    gender: z.enum(["male", "female", "other", "prefer_not_to_say"]),
    blood_type: z.enum(BLOOD_TYPES),
    city: z.string().min(2).max(100),
    state: z.string().min(2).max(100),
    pincode: z.string().regex(/^\d{6}$/, "Invalid Indian pincode"),
    weight_kg: z.coerce
      .number()
      .min(50, "Minimum weight for donation is 50kg")
      .max(200),
    has_chronic_disease: z.boolean(),
    is_smoker: z.boolean(),
    is_on_medication: z.boolean(),
    consent_terms: z.literal(true, {
      message: "You must accept the Terms of Use",
    }),
    consent_privacy: z.literal(true, {
      message: "You must accept the Privacy Policy",
    }),
    consent_notifications: z.boolean(),
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
