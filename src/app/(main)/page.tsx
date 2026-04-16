import Link from "next/link";
import { ArrowRight, ClipboardList, ShieldCheck, Sparkles, Users, Zap } from "lucide-react";

import { PostFeed } from "@/components/posts/post-feed";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfile, getFeedPosts, getHospitalAccountByProfileId, getHospitalDashboard } from "@/lib/data";
import { getRequestMessages, translate } from "@/lib/i18n";

export default async function HomePage() {
  const [{ messages }, currentProfile] = await Promise.all([
    getRequestMessages(),
    getCurrentProfile(),
  ]);
  const posts = await getFeedPosts(currentProfile?.id);
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
              <Badge variant="danger">Hospital operations workspace</Badge>
              <div className="space-y-4">
                <h1 className="text-balance text-4xl font-semibold md:text-6xl">
                  Manage urgent patient requests from one verified hospital dashboard.
                </h1>
                <p className="max-w-2xl text-balance text-base text-muted-foreground md:text-lg">
                  Create blood requests, review donor applicants, and monitor fulfilment without exposing hospital coordination to the public donor leaderboard.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/posts/new">
                    New Request
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/hospital/posts">View patient posts</Link>
                </Button>
              </div>
            </div>
            <div className="grid gap-4">
              {[
                {
                  icon: ClipboardList,
                  title: "Active requests",
                  description: `${dashboard.stats.activeRequests} live hospital requests`,
                },
                {
                  icon: Users,
                  title: "Pending donor applications",
                  description: `${dashboard.stats.pendingApplications} donor responses awaiting review`,
                },
                {
                  icon: ShieldCheck,
                  title: "Verification status",
                  description:
                    hospital?.verification_status === "verified"
                      ? "Verified hospital profile"
                      : "Verification pending admin review",
                },
              ].map((item) => (
                <Card key={item.title} className="bg-card/75">
                  <CardContent className="flex items-start gap-4 p-5">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                      <item.icon className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-semibold">{item.title}</h2>
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
                <CardTitle>Recent patient requests</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Active and recent requests sorted by patient name or case reference.
                </p>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href="/hospital/posts">See all</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboard.posts.slice(0, 5).length ? (
                dashboard.posts.slice(0, 5).map((post) => (
                  <div key={post.id} className="rounded-[1.25rem] border border-border p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{post.patient_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {post.patient_id ?? "No patient ID"} • {post.blood_type_needed}
                        </p>
                      </div>
                      <Badge variant={post.status === "active" ? "danger" : "secondary"}>
                        {post.status}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {post.donor_count ?? 0} donors applied • {post.units_needed} units requested
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.25rem] border border-dashed border-border p-6 text-sm text-muted-foreground">
                  No patient requests yet. Create your first request to start donor outreach.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Latest donor applicants</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Recent donor responses across your hospital&apos;s active posts.
                </p>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href="/hospital/donors">Open donors</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboard.applicants.length ? (
                dashboard.applicants.slice(0, 5).map((application) => (
                  <div key={application.id} className="rounded-[1.25rem] border border-border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{application.donor?.full_name ?? "Donor"}</p>
                        <p className="text-sm text-muted-foreground">
                          {application.donor?.username ? application.donor.username : "Donor"}
                          {application.donor?.blood_type ? ` • ${application.donor.blood_type}` : ""}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          For: {application.post?.patient_name ?? "Patient"} ({application.post?.blood_type_needed ?? "?"})
                        </p>
                      </div>
                      <Badge variant="secondary">{application.status}</Badge>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      Eligibility score {application.eligibility_score}
                      {application.distance_km ? ` • ${application.distance_km} km away` : ""}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.25rem] border border-dashed border-border p-6 text-sm text-muted-foreground">
                  Donor applications will appear here after matched donors respond to your requests.
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
              <h1 className="max-w-4xl text-balance text-4xl font-semibold md:text-6xl">
                {t("hero.title")}
              </h1>
              <p className="max-w-3xl text-balance text-base text-muted-foreground md:text-lg">
                {t("hero.subtitle")}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/find">
                  Find to Donate
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/signup?account=hospital">Register as Hospital</Link>
              </Button>
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
              <Card key={item.title} className="bg-card/75">
                <CardContent className="flex items-start gap-4 p-5">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                    <item.icon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-semibold">{item.title}</h2>
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
            <h2 className="text-2xl font-semibold">{t("hero.feedTitle")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("hero.feedSubtitle")}
            </p>
          </div>
        </div>
        <PostFeed isAuthenticated={Boolean(currentProfile)} posts={posts} />
      </section>
    </div>
  );
}
