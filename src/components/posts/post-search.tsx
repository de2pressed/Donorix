"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

export function PostSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        aria-label="Search posts"
        className="pl-11"
        placeholder="Search by blood type, city, hospital, or condition"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
