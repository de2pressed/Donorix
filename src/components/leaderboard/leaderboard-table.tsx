import { Trophy } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getKarmaRank } from "@/lib/utils/karma";
import type { Profile } from "@/types/user";

export function LeaderboardTable({ leaders }: { leaders: Profile[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 100 lifesavers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {leaders.length ? (
          leaders.map((leader, index) => {
            const rank = getKarmaRank(leader.karma);

            return (
              <div key={leader.id} className="flex items-center justify-between rounded-[1.5rem] border border-border p-4">
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-full bg-brand-soft font-semibold text-brand">
                    {index + 1}
                  </div>
                  <Avatar>
                    <AvatarImage src={leader.avatar_url ?? undefined} alt={leader.full_name} />
                    <AvatarFallback>{leader.full_name.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{leader.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      @{leader.username} • {leader.city}, {leader.state}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{rank.label}</Badge>
                  <div className="text-right">
                    <div className="flex items-center gap-2 font-semibold">
                      <Trophy className="size-4 text-brand" />
                      {leader.karma}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {leader.total_donations} donations
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-border p-6 text-sm text-muted-foreground">
            Leaderboard unlocks once verified donations begin flowing through the platform.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
