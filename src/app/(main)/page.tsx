/* eslint-disable @next/next/no-html-link-for-pages */
import { ArrowRight, ClipboardList, ShieldCheck, Sparkles, Users, Zap } from "lucide-react";

import { PostFeed } from "@/components/posts/post-feed";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfile, getFeedPosts, getHospitalAccountByProfileId, getHospitalDashboard } from "@/lib/data";
import { getRequestMessages, translate } from "@/lib/i18n";
import { formatDistance } from "@/lib/utils/format";

export default async function HomePage() {
  const [{ messages }, currentProfile, publicPosts] = await Promise.all([
    getRequestMessages(),
    getCurrentProfile(),
    getFeedPosts(),
  ]);
  const t = (key: string) => translate(messages, key);

  if (currentProfile?.account_type === "hospital") {
    const [hospital, dashboard] = await Promise.all([
      getHospitalAccountByProfileId(currentProfile.id),
      getHospitalDashboard(currentProfile.id),
    ]);

    return (
      <div className="space-y-6">
        <section className="surface hero-grid overflow-hidden p-8 md:p-10">
          <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <Badge variant="danger">{t("home.hospitalBadge")}</Badge>
              <div className="space-y-4">
                <h1 className="font-display text-balance text-4xl font-bold md:text-5xl">
                  {t("home.hospitalTitle")}
                </h1>
                <p className="max-w-2xl text-balance text-base text-muted-foreground md:text-lg">
                  {t("home.hospitalSubtitle")}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <a href="/posts/new">
                    {t("home.newRequest")}
                    <ArrowRight className="size-4" />
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="/hospital/posts">{t("home.viewPatientPosts")}</a>
                </Button>
              </div>
            </div>
            <div className="grid gap-4">
              {[
                {
                  icon: ClipboardList,
                  title: t("home.activeRequests"),
                  description: t("home.activeRequestsDescription").replace("{count}", String(dashboard.stats.activeRequests)),
                },
                {
                  icon: Users,
                  title: t("home.pendingDonorApplications"),
                  description: t("home.pendingDonorApplicationsDescription").replace(
                    "{count}",
                    String(dashboard.stats.pendingApplications),
                  ),
                },
                {
                  icon: ShieldCheck,
                  title: t("home.verificationStatus"),
                  description:
                    hospital?.verification_status === "verified"
                      ? t("home.verificationVerified")
                      : t("home.verificationPending"),
                },
              ].map((item) => (
                <Card key={item.title} className="hero-stat-card">
                  <CardContent className="flex items-start gap-4 p-5">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                      <item.icon className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-display font-semibold">{item.title}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>{t("home.recentPatientRequestsTitle")}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("home.recentPatientRequestsSubtitle")}
                </p>
              </div>
              <Button asChild size="sm" variant="outline">
                <a href="/hospital/posts">{t("home.seeAll")}</a>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboard.posts.slice(0, 5).length ? (
                dashboard.posts.slice(0, 5).map((post) => (
                  <div key={post.id} className="rounded-[1.25rem] border border-border p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <a className="font-display font-bold transition-colors hover:text-brand" href={`/posts/${post.id}`}>
                          {post.patient_name}
                        </a>
                        <p className="font-mono text-sm text-muted-foreground">
                          {post.patient_id ?? t("home.noPatientId")} • {post.blood_type_needed}
                        </p>
                      </div>
                      <Badge variant={post.status === "active" ? "danger" : "secondary"}>
                        {post.status}
                      </Badge>
                    </div>
                    <p className="mt-3 font-mono text-sm text-muted-foreground">
                      {post.donor_count ?? 0} {t("home.donorsApplied")} • {post.units_needed} {t("home.unitsRequested")}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.25rem] border border-dashed border-border p-6 text-sm text-muted-foreground">
                  {t("home.noPatientRequests")}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>{t("home.latestDonorApplicantsTitle")}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("home.latestDonorApplicantsSubtitle")}
                </p>
              </div>
              <Button asChild size="sm" variant="outline">
                <a href="/hospital/donors">{t("home.openDonors")}</a>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboard.applicants.length ? (
                dashboard.applicants.slice(0, 5).map((application) => (
                  <div key={application.id} className="rounded-[1.25rem] border border-border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {application.donor?.username ? (
                          <a
                            className="font-display font-semibold transition-colors hover:text-brand"
                            href={`/profile/${application.donor.username}`}
                          >
                            {application.donor.full_name ?? application.donor.username}
                          </a>
                        ) : (
                          <p className="font-medium">{application.donor?.full_name ?? "Donor"}</p>
                        )}
                        <p className="font-mono text-sm text-muted-foreground">
                          {application.donor?.username ? application.donor.username : t("home.donor")}
                          {application.donor?.blood_type ? ` • ${application.donor.blood_type}` : ""}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {t("home.forLabel")} {application.post?.patient_name ?? t("home.patient")} ({application.post?.blood_type_needed ?? "?"})
                        </p>
                      </div>
                      <Badge variant="secondary">{application.status}</Badge>
                    </div>
                    <p className="mt-3 font-mono text-sm text-muted-foreground">
                      {t("home.eligibilityScore")} {application.eligibility_score}
                      {application.distance_km != null ? ` • ${formatDistance(application.distance_km)}` : ""}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.25rem] border border-dashed border-border p-6 text-sm text-muted-foreground">
                  {t("home.donorApplicationsEmpty")}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="surface hero-grid overflow-hidden p-8 md:p-10">
        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <Badge variant="danger">{t("hero.badge")}</Badge>
            <div className="space-y-4">
              <h1 className="font-display max-w-4xl text-balance text-4xl font-bold md:text-5xl">
                {t("hero.title")}
              </h1>
              <p className="max-w-3xl text-balance text-base text-muted-foreground md:text-lg">
                {t("hero.subtitle")}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href="/find">
                  {t("nav.find")}
                  <ArrowRight className="size-4" />
                </a>
              </Button>
              {!currentProfile && (
                <Button asChild size="lg" variant="outline">
                  <a href="/signup?account=hospital">{t("nav.registerHospital")}</a>
                </Button>
              )}
            </div>
          </div>
          <div className="grid gap-4">
            {[
              {
                icon: ShieldCheck,
                title: t("hero.featureOneTitle"),
                description: t("hero.featureOneBody"),
              },
              {
                icon: Zap,
                title: t("hero.featureTwoTitle"),
                description: t("hero.featureTwoBody"),
              },
              {
                icon: Sparkles,
                title: t("hero.featureThreeTitle"),
                description: t("hero.featureThreeBody"),
              },
            ].map((item) => (
              <Card key={item.title} className="hero-stat-card">
                <CardContent className="flex items-start gap-4 p-5">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                    <item.icon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-display font-semibold">{item.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4" id="feed">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold">{t("hero.feedTitle")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("hero.feedSubtitle")}
            </p>
          </div>
        </div>
        <PostFeed isAuthenticated={Boolean(currentProfile)} posts={publicPosts} />
      </section>
    </div>
  );
}
