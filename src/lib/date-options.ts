export const MONTH_OPTIONS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export function getDayOptions(month?: number, year?: number) {
  const dayCount = month && year ? new Date(year, month, 0).getDate() : 31;
  return Array.from({ length: dayCount }, (_, index) => String(index + 1));
}
