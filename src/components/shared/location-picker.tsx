"use client";

import { MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGeolocation } from "@/lib/hooks/use-geolocation";

export function LocationPicker() {
  const location = useGeolocation();

  return (
    <div className="space-y-3 rounded-[1.5rem] border border-border p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <MapPin className="size-4 text-brand" />
        Location
      </div>
      <Input
        readOnly
        value={
          location.latitude && location.longitude
            ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
            : location.error ?? "Use your device location for donor matching"
        }
      />
      <Button type="button" variant="outline">
        Detect location
      </Button>
    </div>
  );
}
