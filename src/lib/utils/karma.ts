export const KARMA_BREAKDOWN =
  "+55 for donating, -5 for applying (refunded + bonus on donation confirmation), -20 for no-show.";

export const KARMA_RANKS = [
  { min: 0, label: "Newcomer" },
  { min: 80, label: "Helper" },
  { min: 180, label: "Contributor" },
  { min: 320, label: "Guardian" },
  { min: 520, label: "Blood Hero" },
  { min: 900, label: "Lifesaver Legend" },
] as const;

export const KARMA_EVENTS = {
  donation_completed: 55,
  donation_application: -5,
  application_refund_bonus: 10,
  no_show: -20,
  approved_donor: 12,
  post_completed: 18,
} as const;

export function getKarmaRank(karma: number) {
  return [...KARMA_RANKS].reverse().find((rank) => karma >= rank.min) ?? KARMA_RANKS[0];
}

export function getNextKarmaRank(karma: number) {
  return KARMA_RANKS.find((rank) => karma < rank.min) ?? null;
}

export function calculateKarmaProgress(karma: number) {
  const current = getKarmaRank(karma);
  const next = getNextKarmaRank(karma);

  if (!next) {
    return { current, next, progress: 100 };
  }

  const range = next.min - current.min;
  const progress = Math.min(100, Math.max(0, ((karma - current.min) / range) * 100));

  return { current, next, progress };
}

export function applyKarmaEvent(karma: number, event: keyof typeof KARMA_EVENTS) {
  return karma + KARMA_EVENTS[event];
}
