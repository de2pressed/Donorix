"use client";

import { useTranslations } from "next-intl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function PostFilter({
  emergencyOnly,
  onEmergencyChange,
}: {
  emergencyOnly: boolean;
  onEmergencyChange: (value: boolean) => void;
}) {
  const tFeed = useTranslations("feed");

  return (
    <Select value={emergencyOnly ? "emergency" : "all"} onValueChange={(value) => onEmergencyChange(value === "emergency")}>
      <SelectTrigger aria-label={tFeed("filterLabel")} className="min-w-[220px]">
        <SelectValue placeholder={tFeed("filterLabel")} />
      </SelectTrigger>
      <SelectContent className="min-w-[220px]" position="popper" sideOffset={6}>
        <SelectItem value="all">{tFeed("filterAll")}</SelectItem>
        <SelectItem value="emergency">{tFeed("filterEmergency")}</SelectItem>
      </SelectContent>
    </Select>
  );
}
