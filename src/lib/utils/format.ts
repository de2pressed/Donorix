import { format, formatDistanceToNowStrict, isValid, parseISO } from "date-fns";

export function formatDateTime(value?: string | null, fallback = "Not available") {
  if (!value) return fallback;
  const parsed = parseISO(value);
  if (!isValid(parsed)) return fallback;
  return format(parsed, "dd MMM yyyy, hh:mm a");
}

export function formatRelativeTime(value?: string | null, fallback = "Now") {
  if (!value) return fallback;
  const parsed = parseISO(value);
  if (!isValid(parsed)) return fallback;
  return formatDistanceToNowStrict(parsed, { addSuffix: true });
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDistance(value?: number | null) {
  if (value == null) return "Unknown distance";
  if (value < 1) return `${Math.round(value * 1000)} m`;
  return `${value.toFixed(1)} km`;
}

export function maskPhoneNumber(phone?: string | null) {
  if (!phone) return "Hidden";
  return phone.replace(/(\+91)(\d{2})\d{5}(\d{3})/, "$1 $2*****$3");
}
