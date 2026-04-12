"use client";

import { BLOOD_TYPES } from "@/lib/constants";
import { BloodTypeBadge } from "@/components/ui/blood-type-badge";

export function BloodTypeSelector({
  value,
  onChange,
}: {
  value?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {BLOOD_TYPES.map((bloodType) => (
        <button
          key={bloodType}
          type="button"
          className={`rounded-full border px-1 py-1 ${
            value === bloodType ? "border-brand bg-brand-soft" : "border-border"
          }`}
          onClick={() => onChange(bloodType)}
        >
          <BloodTypeBadge bloodType={bloodType} />
        </button>
      ))}
    </div>
  );
}
