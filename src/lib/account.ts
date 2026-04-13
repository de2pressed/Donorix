export const ACCOUNT_TYPES = ["donor", "hospital"] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

export const HOSPITAL_TYPE_VALUES = [
  "government_hospital",
  "private_hospital",
  "clinic",
  "blood_bank",
  "nursing_home",
  "other",
] as const;

export const HOSPITAL_TYPES = [
  { value: "government_hospital", label: "Government Hospital" },
  { value: "private_hospital", label: "Private Hospital" },
  { value: "clinic", label: "Clinic" },
  { value: "blood_bank", label: "Blood Bank" },
  { value: "nursing_home", label: "Nursing Home" },
  { value: "other", label: "Other" },
] as const;

export type HospitalType = (typeof HOSPITAL_TYPE_VALUES)[number];

export const HOSPITAL_VERIFICATION_STATUSES = ["unverified", "verified", "rejected"] as const;
export type HospitalVerificationStatus = (typeof HOSPITAL_VERIFICATION_STATUSES)[number];

export function isHospitalAccount(accountType?: string | null) {
  return accountType === "hospital";
}

export function isDonorAccount(accountType?: string | null) {
  return accountType === "donor";
}

export function buildHospitalUsername(hospitalName: string, registrationNumber: string) {
  const hospitalSlug = hospitalName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 18);
  const registrationSlug = registrationNumber
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(-8);

  return `${hospitalSlug || "hospital"}_${registrationSlug || "acct"}`.slice(0, 30);
}
