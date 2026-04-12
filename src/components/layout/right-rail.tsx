import Link from "next/link";
import { FileText, HeartHandshake, Trophy } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLeaderboard } from "@/lib/data";
import { POLICY_NAV } from "@/lib/constants";

export async function RightRail() {
  const leaders = (await getLeaderboard()).slice(0, 5);

  return (
    <aside className="hidden w-[320px] shrink-0 xl:block">
      <div className="sticky top-6 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="size-5 text-brand" />
              Top donors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {leaders.length ? (
              leaders.map((leader, index) => (
                <div key={leader.id} className="flex items-center justify-between gap-3 rounded-[1.25rem] border border-border px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{leader.full_name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      #{index + 1} @{leader.username}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-brand">{leader.karma}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Leaderboard entries will appear once verified donations begin flowing.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <HeartHandshake className="size-5 text-brand" />
              About Donorix
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Donorix is built for emergency blood coordination in India, with consent-aware onboarding, location-based matching, and trust signals that help urgent requests move faster.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="size-5 text-brand" />
              Quick policy links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {POLICY_NAV.slice(0, 5).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-2xl px-4 py-3 text-sm text-muted-foreground transition hover:bg-brand-soft hover:text-brand"
              >
                {item.label}
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
