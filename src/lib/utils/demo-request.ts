import { BLOOD_TYPES } from "@/lib/constants";

const DEMO_FIRST_NAMES = [
  "Aarav",
  "Aisha",
  "Ananya",
  "Arjun",
  "Diya",
  "Ishita",
  "Kabir",
  "Meera",
  "Rahul",
  "Riya",
  "Sahil",
  "Vikram",
] as const;

const DEMO_LAST_NAMES = [
  "Bansal",
  "Chaudhary",
  "Gupta",
  "Jain",
  "Khan",
  "Kumar",
  "Nair",
  "Patel",
  "Sharma",
  "Verma",
] as const;

const DEMO_CONDITIONS = [
  "Post-operative blood loss",
  "Severe anaemia under treatment",
  "Accident trauma stabilization",
  "Emergency C-section support",
  "Dengue platelet and blood support",
  "Scheduled surgery preparation",
] as const;

const DEMO_NOTES = [
  "Share the ward desk before arriving.",
  "Please coordinate through the hospital desk.",
  "Demo request for stakeholder walkthroughs.",
  "Use the main reception contact for updates.",
  "Please keep donor contact on-platform.",
] as const;

const DEMO_PREFIXES = ["DEMO", "CASE", "PT"] as const;

type BloodType = (typeof BLOOD_TYPES)[number];

export type DemoRequestDraft = {
  patientName: string;
  patientId: string;
  bloodTypeNeeded: BloodType;
  unitsNeeded: number;
  medicalCondition: string;
  additionalNotes: string;
  isEmergency: boolean;
};

function pick<T>(items: readonly T[]) {
  return items[Math.floor(Math.random() * items.length)] as T;
}

function randomToken(length = 6) {
  return Math.random().toString(36).slice(2, 2 + length).toUpperCase();
}

export function createDemoRequestDraft(isEmergency = true): DemoRequestDraft {
  return {
    patientName: `${pick(DEMO_FIRST_NAMES)} ${pick(DEMO_LAST_NAMES)}`,
    patientId: `${pick(DEMO_PREFIXES)}-${randomToken()}`,
    bloodTypeNeeded: pick(BLOOD_TYPES),
    unitsNeeded: Math.floor(Math.random() * 4) + 1,
    medicalCondition: pick(DEMO_CONDITIONS),
    additionalNotes: pick(DEMO_NOTES),
    isEmergency,
  };
}

export function getDemoRequestReadyLabel(isEmergency: boolean) {
  return isEmergency ? "about 1 hour" : "about 4 hours";
}
