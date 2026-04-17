"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { getKarmaRank } from "@/lib/utils/karma";
import type { Profile } from "@/types/user";

type LeaderboardTier = "gold" | "silver" | "bronze" | "top10" | "standard";

const LEADERBOARD_TIER_STYLES: Record<
  LeaderboardTier,
  {
    bar: string;
    card: string;
    rank: string;
    trophy: string;
    avatar: string;
  }
> = {
  gold: {
    bar: "bg-gradient-to-r from-amber-300 via-brand to-amber-400",
    card:
      "border-amber-300/35 bg-gradient-to-br from-amber-50/85 via-card/85 to-brand-soft/50 shadow-[0_18px_42px_rgba(234,179,8,0.12)]",
    rank:
      "bg-gradient-to-br from-amber-200/80 via-white/90 to-brand-soft/70 text-amber-900 shadow-[0_10px_20px_rgba(234,179,8,0.16)] ring-1 ring-amber-300/40",
    trophy: "text-amber-600",
    avatar: "ring-2 ring-amber-300/35 ring-offset-2 ring-offset-background",
  },
  silver: {
    bar: "bg-gradient-to-r from-slate-300 via-brand-soft to-slate-400",
    card:
      "border-slate-300/35 bg-gradient-to-br from-slate-50/80 via-card/85 to-brand-soft/45 shadow-[0_18px_42px_rgba(148,163,184,0.1)]",
    rank:
      "bg-gradient-to-br from-slate-200/85 via-white/90 to-brand-soft/65 text-slate-700 shadow-[0_10px_20px_rgba(148,163,184,0.14)] ring-1 ring-slate-300/45",
    trophy: "text-slate-500",
    avatar: "ring-2 ring-slate-300/30 ring-offset-2 ring-offset-background",
  },
  bronze: {
    bar: "bg-gradient-to-r from-orange-300 via-brand to-orange-400",
    card:
      "border-orange-300/35 bg-gradient-to-br from-orange-50/85 via-card/85 to-brand-soft/45 shadow-[0_18px_42px_rgba(249,115,22,0.1)]",
    rank:
      "bg-gradient-to-br from-orange-200/80 via-white/90 to-brand-soft/65 text-orange-800 shadow-[0_10px_20px_rgba(249,115,22,0.14)] ring-1 ring-orange-300/45",
    trophy: "text-orange-500",
    avatar: "ring-2 ring-orange-300/30 ring-offset-2 ring-offset-background",
  },
  top10: {
    bar: "bg-gradient-to-r from-brand-soft via-brand to-brand-soft",
    card:
      "border-brand/15 bg-gradient-to-br from-brand-soft/45 via-card/82 to-card/65 shadow-soft",
    rank:
      "bg-brand-soft/75 text-brand shadow-[0_8px_18px_rgba(179,12,49,0.1)] ring-1 ring-brand/10",
    trophy: "text-brand",
    avatar: "ring-2 ring-brand/20 ring-offset-2 ring-offset-background",
  },
  standard: {
    bar: "bg-border/40",
    card: "border-border/70 bg-card/70 shadow-soft",
    rank: "bg-muted text-muted-foreground ring-1 ring-border/60",
    trophy: "text-brand",
    avatar: "ring-1 ring-border/70 ring-offset-2 ring-offset-background",
  },
};

function getLeaderboardTier(position: number): LeaderboardTier {
  if (position === 1) return "gold";
  if (position === 2) return "silver";
  if (position === 3) return "bronze";
  if (position <= 10) return "top10";
  return "standard";
}

export function LeaderboardTable({ leaders }: { leaders: Profile[] }) {
  const tLeaderboard = useTranslations("leaderboard");

  return (
    <Card className="overflow-hidden border-border/80 bg-card/85 shadow-soft">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle>{tLeaderboard("cardTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-3">
        {leaders.length ? (
          leaders.map((leader, index) => {
            const position = index + 1;
            const rank = getKarmaRank(leader.karma);
            const tier = getLeaderboardTier(position);
            const tierStyles = LEADERBOARD_TIER_STYLES[tier];

            return (
              <motion.div
                key={leader.id}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "relative overflow-hidden rounded-[1.6rem] border p-4 backdrop-blur-xl transition-transform duration-200 sm:p-5",
                  tierStyles.card,
                )}
                initial={{ opacity: 0, x: -18 }}
                transition={{ delay: index * 0.03, duration: 0.22, ease: "easeOut" }}
              >
                <div className={cn("absolute inset-x-0 top-0 h-1", tierStyles.bar)} />
                <div className="flex flex-col gap-4">
                  <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
                    <div
                      className={cn(
                        "flex size-11 shrink-0 items-center justify-center rounded-full font-mono text-sm font-semibold sm:size-12",
                        tierStyles.rank,
                      )}
                    >
                      <span>{position}</span>
                    </div>
                    <Avatar className={cn("shrink-0", tierStyles.avatar)}>
                      <AvatarImage src={leader.avatar_url ?? undefined} alt={leader.full_name} />
                      <AvatarFallback>{leader.full_name.slice(0, 1)}</AvatarFallback>
                    </Avatar>
                    <Link
                      className="min-w-0 flex-1 transition-colors hover:text-brand"
                      href={`/profile/${leader.username}`}
                    >
                      <p className="truncate font-medium leading-tight sm:text-lg">{leader.full_name}</p>
                      <p className="truncate text-sm text-muted-foreground">@{leader.username}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {leader.city}, {leader.state}
                      </p>
                    </Link>
                  </div>
                  <div className="flex flex-wrap items-end justify-between gap-3 border-t border-border/50 pt-3 sm:pt-4">
                    <Badge className="max-w-full shrink-0 px-2.5 text-[11px]" variant="secondary">
                      {rank.label}
                    </Badge>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2 font-semibold">
                        <Trophy className={cn("size-4", tierStyles.trophy)} />
                        <span className="font-mono tabular-nums">{leader.karma}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {tLeaderboard("donations", { count: leader.total_donations })}
                      </p>
                    </div>
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
