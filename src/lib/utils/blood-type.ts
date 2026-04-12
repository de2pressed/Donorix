import { BLOOD_TYPES } from "@/lib/constants";

export type BloodType = (typeof BLOOD_TYPES)[number];

const compatibilityMatrix: Record<BloodType, BloodType[]> = {
  "A+": ["A+", "A-", "O+", "O-"],
  "A-": ["A-", "O-"],
  "B+": ["B+", "B-", "O+", "O-"],
  "B-": ["B-", "O-"],
  "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  "AB-": ["A-", "B-", "AB-", "O-"],
  "O+": ["O+", "O-"],
  "O-": ["O-"],
};

export function isBloodType(value: string): value is BloodType {
  return BLOOD_TYPES.includes(value as BloodType);
}

export function getCompatibleDonors(recipientType: BloodType) {
  return compatibilityMatrix[recipientType];
}

export function getCompatibilityLabel(donorType: BloodType, recipientType: BloodType) {
  return getCompatibleDonors(recipientType).includes(donorType) ? "Compatible" : "Incompatible";
}
