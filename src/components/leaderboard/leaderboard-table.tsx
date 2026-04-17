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
    border: string;
    rank: string;
    trophy: string;
    avatar: string;
  }
> = {
  gold: {
    bar: "bg-gradient-to-r from-amber-300 via-brand to-amber-400",
    border: "border-amber-300/35 dark:border-amber-400/20",
    rank:
      "bg-gradient-to-br from-amber-100/95 via-white to-brand-soft/70 text-amber-900 ring-1 ring-amber-300/30 dark:from-amber-200/90 dark:via-amber-100/80 dark:to-brand-soft/40 dark:text-amber-950",
    trophy: "text-amber-600 dark:text-amber-400",
    avatar: "ring-2 ring-amber-300/35 ring-offset-2 ring-offset-background",
  },
  silver: {
    bar: "bg-gradient-to-r from-slate-300 via-brand-soft to-slate-400",
    border: "border-slate-300/35 dark:border-slate-300/20",
    rank:
      "bg-gradient-to-br from-slate-100/95 via-white to-brand-soft/65 text-slate-700 ring-1 ring-slate-300/35 dark:from-slate-200/90 dark:via-slate-100/80 dark:to-brand-soft/40 dark:text-slate-900",
    trophy: "text-slate-500 dark:text-slate-300",
    avatar: "ring-2 ring-slate-300/30 ring-offset-2 ring-offset-background",
  },
  bronze: {
    bar: "bg-gradient-to-r from-orange-300 via-brand to-orange-400",
    border: "border-orange-300/35 dark:border-orange-400/20",
    rank:
      "bg-gradient-to-br from-orange-100/95 via-white to-brand-soft/65 text-orange-800 ring-1 ring-orange-300/35 dark:from-orange-200/90 dark:via-orange-100/80 dark:to-brand-soft/40 dark:text-orange-950",
    trophy: "text-orange-500 dark:text-orange-400",
    avatar: "ring-2 ring-orange-300/30 ring-offset-2 ring-offset-background",
  },
  top10: {
    bar: "bg-gradient-to-r from-brand-soft via-brand to-brand-soft",
    border: "border-brand/18 dark:border-brand/24",
    rank:
      "bg-brand-soft/75 text-brand ring-1 ring-brand/10 dark:bg-brand/20 dark:text-brand-foreground dark:ring-brand/30",
    trophy: "text-brand",
    avatar: "ring-2 ring-brand/20 ring-offset-2 ring-offset-background",
  },
  standard: {
    bar: "bg-border/40",
    border: "border-border/70 dark:border-border/60",
    rank: "bg-muted text-muted-foreground ring-1 ring-border/60 dark:bg-muted/70 dark:text-muted-foreground",
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
    <Card className="overflow-hidden border-border/80 bg-card/80 p-0 shadow-soft">
      <CardHeader className="border-b border-border/60 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <CardTitle>{tLeaderboard("cardTitle")}</CardTitle>
          <Badge className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]" variant="secondary">
            {leaders.length} ranked
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 p-3 sm:p-4 md:p-5">
        {leaders.length ? (
          leaders.map((leader, index) => {
            const position = index + 1;
            const rank = getKarmaRank(leader.karma);
            const tier = getLeaderboardTier(position);
            const tierStyles = LEADERBOARD_TIER_STYLES[tier];
            const fullName = leader.full_name || leader.username;
            const location = [leader.city, leader.state].filter(Boolean).join(", ");

            return (
              <motion.article
                key={leader.id}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "group relative overflow-hidden !rounded-[1.35rem] px-3 py-3 transition duration-200 hover:-translate-y-0.5 sm:px-4 sm:py-4 dark:hover:shadow-[0_18px_36px_rgba(0,0,0,0.3)]",
                  "glass-panel",
                  tierStyles.border,
                )}
                initial={{ opacity: 0, y: 12 }}
                transition={{
                  delay: Math.min(index * 0.012, 0.18),
                  duration: 0.24,
                  ease: "easeOut",
                }}
              >
                <div className={cn("absolute inset-x-0 top-0 h-[0.35rem]", tierStyles.bar)} />
                <div className="grid gap-3 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-full font-mono text-sm font-semibold sm:size-11",
                        tierStyles.rank,
                      )}
                    >
                      <span>{position}</span>
                    </div>
                    <Avatar className={cn("size-10 shrink-0 sm:size-11", tierStyles.avatar)}>
                      <AvatarImage src={leader.avatar_url ?? undefined} alt={fullName} />
                      <AvatarFallback>{fullName.slice(0, 1)}</AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="min-w-0">
                    <Link
                      className="block min-w-0 transition-colors group-hover:text-brand"
                      href={`/profile/${leader.username}`}
                    >
                      <p className="truncate font-display text-base font-semibold leading-tight sm:text-lg">
                        {fullName}
                      </p>
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground sm:text-sm">
                      <span className="truncate">@{leader.username}</span>
                      {location ? <span className="text-border/80">•</span> : null}
                      {location ? <span className="truncate">{location}</span> : null}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge
                        className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]"
                        variant="secondary"
                      >
                        {rank.label}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 md:flex-col md:items-end md:gap-1 md:text-right">
                    <div className="flex items-center gap-2 font-semibold">
                      <Trophy className={cn("size-4", tierStyles.trophy)} />
                      <span className="font-mono tabular-nums text-base sm:text-lg">{leader.karma}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {tLeaderboard("donations", { count: leader.total_donations })}
                    </p>
                  </div>
                </div>
              </motion.article>
            );
          })
        ) : (
          <div className="rounded-[1.35rem] border border-dashed border-border/70 p-5 text-sm text-muted-foreground">
            {tLeaderboard("empty")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
