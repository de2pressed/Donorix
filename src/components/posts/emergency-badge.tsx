import { Siren } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function EmergencyBadge({ emergency }: { emergency: boolean }) {
  if (!emergency) return null;

  return (
    <Badge className="gap-2" variant="danger">
      <Siren className="size-3.5" />
      Emergency
    </Badge>
  );
}
