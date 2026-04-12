import { MapPin } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { KarmaBadge } from "@/components/profile/karma-badge";
import type { Profile } from "@/types/user";

export function ProfileHeader({ profile }: { profile: Profile }) {
  return (
    <Card className="flex flex-col gap-6 md:flex-row md:items-center">
      <Avatar className="size-24">
        <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name} />
        <AvatarFallback>{profile.full_name.slice(0, 1)}</AvatarFallback>
      </Avatar>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold">{profile.full_name}</h1>
          <Badge variant={profile.is_available ? "success" : "secondary"}>
            {profile.is_available ? "Available to donate" : "Currently unavailable"}
          </Badge>
          {profile.is_admin ? <Badge variant="danger">Admin</Badge> : null}
        </div>
        <p className="text-muted-foreground">
          @{profile.username} • {profile.blood_type}
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="size-4" />
          {profile.city}, {profile.state}
        </div>
        <KarmaBadge karma={profile.karma} />
      </div>
    </Card>
  );
}
