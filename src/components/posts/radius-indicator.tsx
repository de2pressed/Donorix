import { Radar } from "lucide-react";

export function RadiusIndicator({
  currentRadiusKm,
  initialRadiusKm,
}: {
  currentRadiusKm: number;
  initialRadiusKm: number;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs text-muted-foreground">
      <Radar className="size-3.5" />
      Radius {currentRadiusKm} km
      {currentRadiusKm > initialRadiusKm ? ` • expanded from ${initialRadiusKm} km` : ""}
    </div>
  );
}
