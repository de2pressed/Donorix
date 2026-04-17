import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeletePostButton } from "@/components/posts/delete-post-button";
import { getCurrentProfile, getHospitalPosts } from "@/lib/data";
import { getRequestMessages, translate } from "@/lib/i18n";

export default async function HospitalPostsPage() {
  const [{ messages }, profile] = await Promise.all([getRequestMessages(), getCurrentProfile()]);
  const t = (key: string) => translate(messages, key);

  if (!profile) {
    redirect("/login?redirect=/hospital/posts");
  }

  if (profile.account_type !== "hospital") {
    redirect("/");
  }

  const posts = await getHospitalPosts(profile.id);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">{t("hospitalPosts.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("hospitalPosts.subtitle")}</p>
        </div>
        <Button asChild>
          <Link href="/posts/new">{t("hospitalPosts.newRequest")}</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("hospitalPosts.requestLog")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {posts.length ? (
            posts.map((post) => (
              <div
                key={post.id}
                className="grid gap-3 rounded-[1.25rem] border border-border p-4 md:grid-cols-[1.2fr_1fr_auto] md:items-center"
              >
                <div>
                  <Link className="font-display font-semibold transition-colors hover:text-brand" href={`/posts/${post.id}`}>
                    {post.patient_name}
                  </Link>
                  <p className="font-mono text-sm text-muted-foreground">
                    {post.patient_id ?? t("hospitalPosts.noPatientId")} - {post.blood_type_needed}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-mono">{post.units_needed}</span> {t("hospitalPosts.units")} -{" "}
                  <span className="font-mono">{post.donor_count ?? 0}</span> {t("hospitalPosts.donorApplicants")}
                </div>
                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  <Badge
                    variant={post.status === "active" ? "danger" : post.status === "deleted" ? "warning" : "secondary"}
                  >
                    {post.status}
                  </Badge>
                  <DeletePostButton postId={post.id} patientName={post.patient_name} status={post.status} />
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[1.25rem] border border-dashed border-border p-6 text-sm text-muted-foreground">
              {t("hospitalPosts.empty")}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

