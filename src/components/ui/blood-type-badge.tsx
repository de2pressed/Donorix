import { Droplets } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

export function BloodTypeBadge({
  bloodType,
  urgent = false,
  className,
}: {
  bloodType: string;
  urgent?: boolean;
  className?: string;
}) {
  return (
    <Badge
      className={cn("gap-2 rounded-full px-4 py-1.5 text-[11px]", className)}
      variant={urgent ? "danger" : "default"}
    >
      <Droplets className="size-3.5" />
      {bloodType}
    </Badge>
  );
}
