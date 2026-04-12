import { COUNTRY_CODES } from "@/lib/constants";

export const DEFAULT_COUNTRY_CODE = COUNTRY_CODES[0];

export function sanitizePhoneDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function parsePhoneNumber(value?: string | null) {
  if (!value) {
    return {
      country: DEFAULT_COUNTRY_CODE,
      nationalNumber: "",
    };
  }

  const matchingCountry =
    [...COUNTRY_CODES]
      .sort((a, b) => b.code.length - a.code.length)
      .find((country) => value.startsWith(country.code)) ?? DEFAULT_COUNTRY_CODE;

  return {
    country: matchingCountry,
    nationalNumber: sanitizePhoneDigits(value.slice(matchingCountry.code.length)),
  };
}

export function formatPhoneNumber(countryCode: string, nationalNumber: string) {
  const digits = sanitizePhoneDigits(nationalNumber);
  return digits ? `${countryCode}${digits}` : "";
}

export function validatePhoneNumber(value: string) {
  const { country, nationalNumber } = parsePhoneNumber(value);

  if (country.code === "+91") {
    return /^[6-9]\d{9}$/.test(nationalNumber);
  }

  return /^\d{6,14}$/.test(nationalNumber);
}
