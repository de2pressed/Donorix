import Link from "next/link";
import { ClipboardList, FileText, HeartHandshake, ShieldCheck, Trophy, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfile, getHospitalDashboard, getLeaderboard } from "@/lib/data";
import { POLICY_NAV } from "@/lib/constants";

export async function RightRail() {
  const currentProfile = await getCurrentProfile();
  const leaders = currentProfile?.account_type === "hospital" ? [] : (await getLeaderboard()).slice(0, 5);
  const hospitalDashboard =
    currentProfile?.account_type === "hospital" ? await getHospitalDashboard(currentProfile.id) : null;

  return (
    <aside className="hidden w-[19rem] shrink-0 xl:block">
      <div className="sticky top-6 space-y-4">
        {currentProfile?.account_type === "hospital" ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ClipboardList className="size-5 text-brand" />
                Hospital snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="rounded-[1.25rem] border border-border px-4 py-3">
                <p className="text-muted-foreground">Active requests</p>
                <p className="mt-1 text-2xl font-semibold">{hospitalDashboard?.stats.activeRequests ?? 0}</p>
              </div>
              <div className="rounded-[1.25rem] border border-border px-4 py-3">
                <p className="text-muted-foreground">Pending applicants</p>
                <p className="mt-1 text-2xl font-semibold">{hospitalDashboard?.stats.pendingApplications ?? 0}</p>
              </div>
              <div className="rounded-[1.25rem] border border-border px-4 py-3">
                <p className="text-muted-foreground">Fulfilled this month</p>
                <p className="mt-1 text-2xl font-semibold">{hospitalDashboard?.stats.fulfilledThisMonth ?? 0}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
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
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              {currentProfile?.account_type === "hospital" ? (
                <Users className="size-5 text-brand" />
              ) : (
                <HeartHandshake className="size-5 text-brand" />
              )}
              {currentProfile?.account_type === "hospital" ? "Hospital guide" : "About Donorix"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {currentProfile?.account_type === "hospital" ? (
              <>
                <p>
                  Hospital accounts can post verified patient requests, review donor applicants, and manage fulfilment without entering the public karma system.
                </p>
                <Link className="inline-flex items-center gap-2 text-brand hover:text-brand/80" href="/hospital/donors">
                  Review donor applicants
                </Link>
              </>
            ) : (
              <p>
                Donorix is built for emergency blood coordination in India, with consent-aware onboarding, location-based matching, and trust signals that help urgent requests move faster.
              </p>
            )}
          </CardContent>
        </Card>

        {currentProfile?.account_type === "hospital" ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="size-5 text-brand" />
                Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Hospitals begin unverified and can be reviewed by Donorix admins before trust badges appear across requests.</p>
            </CardContent>
          </Card>
        ) : null}

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
