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

export function canDonateToRecipient(donorType: BloodType, recipientType: BloodType) {
  return getCompatibleDonors(recipientType).includes(donorType);
}

export function getCompatibilityLabel(donorType: BloodType, recipientType: BloodType) {
  return canDonateToRecipient(donorType, recipientType) ? "Compatible" : "Incompatible";
}

export function computeEligibilityScore(
  donorBloodType: string | null | undefined,
  recipientBloodType: string | null | undefined,
) {
  if (!donorBloodType || !recipientBloodType) return 60;

  if (!isBloodType(donorBloodType) || !isBloodType(recipientBloodType)) return 60;

  if (!canDonateToRecipient(donorBloodType, recipientBloodType)) return 0;

  let score = 80;
  if (donorBloodType === "O-") score += 15;
  if (donorBloodType === recipientBloodType) score += 10;

  return Math.min(score, 100);
}
