import { addDays, isAfter } from "date-fns";

export const DONATION_COOLDOWN_DAYS = 90;

export function getNextEligibleDonationDate(lastDonatedAt?: string | null) {
  if (!lastDonatedAt) return null;

  const lastDonation = new Date(lastDonatedAt);
  if (Number.isNaN(lastDonation.getTime())) return null;

  return addDays(lastDonation, DONATION_COOLDOWN_DAYS);
}

export function isDonationEligible(lastDonatedAt?: string | null, now = new Date()) {
  const nextEligibleDate = getNextEligibleDonationDate(lastDonatedAt);
  if (!nextEligibleDate) return true;

  return !isAfter(nextEligibleDate, now);
}
