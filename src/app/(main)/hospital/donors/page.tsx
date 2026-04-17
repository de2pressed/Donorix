import { redirect } from "next/navigation";

import { DonorList } from "@/components/posts/donor-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfile, getHospitalDashboard } from "@/lib/data";
import { getRequestMessages, translate } from "@/lib/i18n";
import type { DonorApplicationWithDonor } from "@/types/post";

export default async function HospitalDonorsPage() {
  const [{ messages }, profile] = await Promise.all([getRequestMessages(), getCurrentProfile()]);
  const t = (key: string) => translate(messages, key);

  if (!profile) {
    redirect("/login?redirect=/hospital/donors");
  }

  if (profile.account_type !== "hospital") {
    redirect("/");
  }

  const dashboard = await getHospitalDashboard(profile.id);
  const byPost = new Map<string, typeof dashboard.applicants>();

  for (const application of dashboard.applicants) {
    const list = byPost.get(application.post_id) ?? [];
    list.push(application);
    byPost.set(application.post_id, list);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-3xl font-bold">{t("hospitalDonors.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("hospitalDonors.subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("hospitalDonors.recentApplications")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {byPost.size ? (
            [...byPost.entries()].map(([postId, apps]) => (
              <div key={postId} className="space-y-2">
                <p className="px-1 text-sm font-medium text-muted-foreground">
                  {apps[0]?.post?.patient_name ?? t("hospitalDonors.patient")} - {apps[0]?.post?.blood_type_needed ?? t("hospitalDonors.blood")}
                </p>
                <DonorList donors={apps as DonorApplicationWithDonor[]} canAct postId={postId} />
              </div>
            ))
          ) : (
            <div className="rounded-[1.25rem] border border-dashed border-border p-6 text-sm text-muted-foreground">
              {t("hospitalDonors.empty")}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
