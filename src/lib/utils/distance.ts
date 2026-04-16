const EARTH_RADIUS_KM = 6371;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function haversineDistanceKm(
  startLatitude: number,
  startLongitude: number,
  endLatitude: number,
  endLongitude: number,
) {
  const deltaLatitude = toRadians(endLatitude - startLatitude);
  const deltaLongitude = toRadians(endLongitude - startLongitude);

  const a =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(toRadians(startLatitude)) *
      Math.cos(toRadians(endLatitude)) *
      Math.sin(deltaLongitude / 2) ** 2;

  return EARTH_RADIUS_KM * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function normalizeLocationPart(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

export function estimateDistanceKm(
  originCity?: string | null,
  originState?: string | null,
  destinationCity?: string | null,
  destinationState?: string | null,
) {
  if (!originCity || !originState || !destinationCity || !destinationState) {
    return null;
  }

  const normalizedOriginCity = normalizeLocationPart(originCity);
  const normalizedOriginState = normalizeLocationPart(originState);
  const normalizedDestinationCity = normalizeLocationPart(destinationCity);
  const normalizedDestinationState = normalizeLocationPart(destinationState);

  if (
    normalizedOriginCity === normalizedDestinationCity &&
    normalizedOriginState === normalizedDestinationState
  ) {
    return 0;
  }

  if (normalizedOriginState === normalizedDestinationState) {
    return 25;
  }

  return 125;
}
