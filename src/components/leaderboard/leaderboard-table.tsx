"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getKarmaRank } from "@/lib/utils/karma";
import type { Profile } from "@/types/user";

export function LeaderboardTable({ leaders }: { leaders: Profile[] }) {
  const tLeaderboard = useTranslations("leaderboard");

  return (
    <Card className="overflow-hidden">
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
                className="flex flex-col gap-4 overflow-hidden rounded-[1.5rem] border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                initial={{ opacity: 0, x: -18 }}
                transition={{ delay: index * 0.03, duration: 0.22, ease: "easeOut" }}
              >
                <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-soft font-semibold text-brand">
                    {index + 1}
                  </div>
                  <Avatar className="shrink-0">
                    <AvatarImage src={leader.avatar_url ?? undefined} alt={leader.full_name} />
                    <AvatarFallback>{leader.full_name.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{leader.full_name}</p>
                    <p className="truncate text-sm text-muted-foreground">@{leader.username}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {leader.city}, {leader.state}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                  <Badge className="max-w-full shrink-0 px-2.5 text-[11px]" variant="secondary">
                    {rank.label}
                  </Badge>
                  <div className="sm:text-right">
                    <div className="flex items-center gap-2 font-semibold">
                      <Trophy className="size-4 text-brand" />
                      <span className="tabular-nums">{leader.karma}</span>
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
