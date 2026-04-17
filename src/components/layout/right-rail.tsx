import Link from "next/link";
import { ClipboardList, FileText, HeartHandshake, ShieldCheck, Trophy, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfile, getHospitalDashboard, getLeaderboard } from "@/lib/data";
import { POLICY_NAV } from "@/lib/constants";
import { getRequestMessages, translate } from "@/lib/i18n";

export async function RightRail() {
  const [{ messages }, currentProfile] = await Promise.all([getRequestMessages(), getCurrentProfile()]);
  const t = (key: string) => translate(messages, key);
  const leaders = currentProfile?.account_type === "hospital" ? [] : (await getLeaderboard()).slice(0, 5);
  const hospitalDashboard =
    currentProfile?.account_type === "hospital" ? await getHospitalDashboard(currentProfile.id) : null;

  return (
    <aside className="hidden w-full min-w-0 shrink-0 xl:block">
      <div className="sticky top-5 space-y-4">
        {currentProfile?.account_type === "hospital" ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ClipboardList className="size-5 text-brand" />
                {t("rightRail.hospitalSnapshot")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="rounded-[1.25rem] border border-border px-4 py-3">
                <p className="text-muted-foreground">{t("rightRail.activeRequests")}</p>
                <p className="mt-1 font-mono text-2xl font-semibold">
                  {hospitalDashboard?.stats.activeRequests ?? 0}
                </p>
              </div>
              <div className="rounded-[1.25rem] border border-border px-4 py-3">
                <p className="text-muted-foreground">{t("rightRail.pendingApplicants")}</p>
                <p className="mt-1 font-mono text-2xl font-semibold">
                  {hospitalDashboard?.stats.pendingApplications ?? 0}
                </p>
              </div>
              <div className="rounded-[1.25rem] border border-border px-4 py-3">
                <p className="text-muted-foreground">{t("rightRail.fulfilledThisMonth")}</p>
                <p className="mt-1 font-mono text-2xl font-semibold">
                  {hospitalDashboard?.stats.fulfilledThisMonth ?? 0}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="size-5 text-brand" />
                {t("rightRail.topDonors")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {leaders.length ? (
                leaders.map((leader, index) => (
                  <div key={leader.id} className="flex items-center justify-between gap-3 rounded-[1.25rem] border border-border px-4 py-3">
                    <div className="min-w-0">
                      <Link className="truncate font-medium transition-colors hover:text-brand" href={`/profile/${leader.username}`}>
                        {leader.full_name}
                      </Link>
                      <p className="truncate text-sm text-muted-foreground">
                        <span className="font-mono">#{index + 1}</span> @{leader.username}
                      </p>
                    </div>
                    <span className="font-mono text-sm font-semibold text-brand">{leader.karma}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("rightRail.topDonorsEmpty")}
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
              {currentProfile?.account_type === "hospital" ? t("rightRail.hospitalGuide") : t("rightRail.aboutDonorix")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {currentProfile?.account_type === "hospital" ? (
              <>
                <p>
                  {t("rightRail.hospitalGuideBody")}
                </p>
                <Link className="inline-flex items-center gap-2 text-brand hover:text-brand/80" href="/hospital/donors">
                  {t("rightRail.reviewDonorApplicants")}
                </Link>
              </>
            ) : (
              <p>
                {t("rightRail.aboutDonorixBody")}
              </p>
            )}
          </CardContent>
        </Card>

        {currentProfile?.account_type === "hospital" ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="size-5 text-brand" />
                {t("rightRail.verification")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>{t("rightRail.verificationBody")}</p>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="size-5 text-brand" />
              {t("rightRail.quickPolicyLinks")}
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
