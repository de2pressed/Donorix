import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Zap } from "lucide-react";

import { PostFeed } from "@/components/posts/post-feed";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentProfile, getFeedPosts } from "@/lib/data";
import { getRequestMessages, translate } from "@/lib/i18n";

export default async function HomePage() {
  const [{ messages }, posts, currentProfile] = await Promise.all([
    getRequestMessages(),
    getFeedPosts(),
    getCurrentProfile(),
  ]);
  const t = (key: string) => translate(messages, key);

  return (
    <div className="space-y-6">
      <section className="surface hero-grid overflow-hidden p-8 md:p-10">
        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <Badge variant="danger">{t("hero.badge")}</Badge>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-balance text-4xl font-semibold md:text-6xl">
                {t("hero.title")}
              </h1>
              <p className="max-w-2xl text-balance text-base text-muted-foreground md:text-lg">
                {t("hero.subtitle")}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/posts/new">
                  {t("hero.primaryCta")}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/leaderboard">{t("hero.secondaryCta")}</Link>
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

      <section className="space-y-4">
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
