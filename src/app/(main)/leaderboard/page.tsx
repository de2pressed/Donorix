import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { getLeaderboard } from "@/lib/data";

export default async function LeaderboardPage() {
  const leaders = await getLeaderboard();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold">Karma leaderboard</h1>
        <p className="text-sm text-muted-foreground">
          Ranked by verified donations, responsive participation, and zero no-shows.
        </p>
      </div>
      <LeaderboardTable leaders={leaders} />
    </div>
  );
}
