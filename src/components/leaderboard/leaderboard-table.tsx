"use client";

import { Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getKarmaRank } from "@/lib/utils/karma";
import type { Profile } from "@/types/user";

export function LeaderboardTable({ leaders }: { leaders: Profile[] }) {
  const tLeaderboard = useTranslations("leaderboard");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tLeaderboard("cardTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {leaders.length ? (
          leaders.map((leader, index) => {
            const rank = getKarmaRank(leader.karma);

            return (
              <motion.div
                key={leader.id}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between rounded-[1.5rem] border border-border p-4"
                initial={{ opacity: 0, x: -18 }}
                transition={{ delay: index * 0.03, duration: 0.22, ease: "easeOut" }}
              >
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
                      {tLeaderboard("donations", { count: leader.total_donations })}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-border p-6 text-sm text-muted-foreground">
            {tLeaderboard("empty")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
