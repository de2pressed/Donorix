import { MapPin } from "lucide-react";

import { KarmaBadge } from "@/components/profile/karma-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Profile } from "@/types/user";

export function ProfileHeader({ profile }: { profile: Profile }) {
  const fullName = profile.full_name || "Donorix user";
  const location = [profile.city, profile.state].filter(Boolean).join(", ");
  const statusLabel =
    profile.account_type === "hospital"
      ? profile.is_verified
        ? "Verified hospital"
        : "Hospital verification pending"
      : profile.is_available
        ? "Available to donate"
        : "Currently unavailable";
  const secondaryLine =
    profile.account_type === "hospital"
      ? `Hospital account${profile.username ? ` - @${profile.username}` : ""}`
      : `@${profile.username}${profile.blood_type ? ` - ${profile.blood_type}` : ""}`;

  return (
    <Card className="flex flex-col gap-6 md:flex-row md:items-center">
      <Avatar className="size-24">
        <AvatarImage src={profile.avatar_url ?? undefined} alt={fullName} />
        <AvatarFallback>{fullName.slice(0, 1)}</AvatarFallback>
      </Avatar>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-bold">{fullName}</h1>
          <Badge
            variant={profile.account_type === "hospital" ? "secondary" : profile.is_available ? "success" : "secondary"}
          >
            {statusLabel}
          </Badge>
          {profile.is_admin ? <Badge variant="danger">Admin</Badge> : null}
        </div>
        <p className="text-muted-foreground">{secondaryLine}</p>
        {location ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4" />
            {location}
          </div>
        ) : null}
        {profile.account_type === "donor" ? <KarmaBadge karma={profile.karma} /> : null}
      </div>
    </Card>
  );
}
