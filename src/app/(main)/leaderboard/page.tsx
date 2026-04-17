import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { Card, CardContent } from "@/components/ui/card";
import { getLeaderboard } from "@/lib/data";
import { getRequestMessages, translate } from "@/lib/i18n";
import { ShieldCheck, Trophy, Users } from "lucide-react";

export default async function LeaderboardPage() {
  const [{ messages }, leaders] = await Promise.all([getRequestMessages(), getLeaderboard()]);
  const t = (key: string) => translate(messages, key);
  const rankedCount = leaders.length;
  const verifiedCount = leaders.filter((leader) => leader.is_verified).length;
  const topKarma = leaders[0]?.karma ?? 0;

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="surface hero-grid overflow-hidden p-6 md:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr] xl:items-end">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Leaderboard</p>
            <h1 className="font-display text-balance text-4xl font-semibold leading-[1.02] md:text-5xl">
              {t("leaderboard.title")}
            </h1>
            <p className="max-w-3xl text-balance text-base text-muted-foreground md:text-lg">
              {t("leaderboard.subtitle")}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            {[
              {
                icon: Users,
                title: "Ranked donors",
                value: rankedCount,
                description: "Showing the current top 100 leaders.",
              },
              {
                icon: ShieldCheck,
                title: "Verified donors",
                value: verifiedCount,
                description: "Profiles with verification signals active.",
              },
              {
                icon: Trophy,
                title: "Highest karma",
                value: topKarma,
                description: "The current score at the top of the board.",
              },
            ].map((item) => (
              <Card key={item.title} className="hero-stat-card">
                <CardContent className="flex items-start gap-4 p-5">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                    <item.icon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-display font-semibold">{item.title}</h2>
                    <p className="font-mono text-lg font-semibold tabular-nums text-foreground">
                      {item.value}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <LeaderboardTable leaders={leaders} />
    </div>
  );
}
