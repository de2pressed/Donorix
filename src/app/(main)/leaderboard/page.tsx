import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { getLeaderboard } from "@/lib/data";
import { getRequestMessages, translate } from "@/lib/i18n";

export default async function LeaderboardPage() {
  const [{ messages }, leaders] = await Promise.all([getRequestMessages(), getLeaderboard()]);
  const t = (key: string) => translate(messages, key);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[clamp(2.25rem,8vw,3rem)] font-semibold leading-[1.05]">
          {t("leaderboard.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("leaderboard.subtitle")}
        </p>
      </div>
      <LeaderboardTable leaders={leaders} />
    </div>
  );
}
