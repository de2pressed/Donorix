import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Zap } from "lucide-react";

import { PostFeed } from "@/components/posts/post-feed";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getFeedPosts } from "@/lib/data";

export default async function HomePage() {
  const posts = await getFeedPosts();

  return (
    <div className="space-y-6">
      <section className="surface hero-grid overflow-hidden p-8 md:p-10">
        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <Badge variant="danger">SDG 3 aligned • Emergency-first routing</Badge>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-balance text-4xl font-semibold md:text-6xl">
                Find verified blood donors faster when the window is tight.
              </h1>
              <p className="max-w-2xl text-balance text-base text-muted-foreground md:text-lg">
                Donorix combines urgency scoring, karma-backed trust, privacy-safe donor matching, and multilingual support for recipients across India.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/posts/new">
                  Create blood request
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/leaderboard">View top donors</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-4">
            {[
              {
                icon: ShieldCheck,
                title: "Verified donor graph",
                description: "Consent-aware profiles, 90-day donation cooldown, and public reputation signals.",
              },
              {
                icon: Zap,
                title: "Emergency prioritisation",
                description: "Critical requests rise to the top and unlock direct contact when medically urgent.",
              },
              {
                icon: Sparkles,
                title: "Multilingual assistance",
                description: "English and Hindi today, with architecture ready for 28+ Indian languages.",
              },
            ].map((item) => (
              <Card key={item.title} className="bg-card/75">
                <CardContent className="flex items-start gap-4 p-5">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                    <item.icon className="size-5" />
                  </div>
                  <div>
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Live request feed</h2>
            <p className="text-sm text-muted-foreground">
              Emergency posts are ranked first, followed by urgency, freshness, and community trust.
            </p>
          </div>
        </div>
        <PostFeed posts={posts} />
      </section>
    </div>
  );
}
