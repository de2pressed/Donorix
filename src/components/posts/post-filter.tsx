"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function PostFilter({
  emergencyOnly,
  onEmergencyChange,
}: {
  emergencyOnly: boolean;
  onEmergencyChange: (value: boolean) => void;
}) {
  return (
    <Select value={emergencyOnly ? "emergency" : "all"} onValueChange={(value) => onEmergencyChange(value === "emergency")}>
      <SelectTrigger aria-label="Filter feed">
        <SelectValue placeholder="Filter requests" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All requests</SelectItem>
        <SelectItem value="emergency">Emergency only</SelectItem>
      </SelectContent>
    </Select>
  );
}
