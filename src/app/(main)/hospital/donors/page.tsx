import { redirect } from "next/navigation";

import { DonorList } from "@/components/posts/donor-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfile, getHospitalDashboard } from "@/lib/data";
import type { DonorApplicationWithDonor } from "@/types/post";

export default async function HospitalDonorsPage() {
  const profile = await getCurrentProfile();

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
        <h1 className="text-3xl font-semibold">Donor Applicants</h1>
        <p className="text-sm text-muted-foreground">
          Review donor interest across all active patient requests from your hospital account.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent donor applications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {byPost.size ? (
            [...byPost.entries()].map(([postId, apps]) => (
              <div key={postId} className="space-y-2">
                <p className="px-1 text-sm font-medium text-muted-foreground">
                  {apps[0]?.post?.patient_name ?? "Patient"} - {apps[0]?.post?.blood_type_needed ?? "Blood"}
                </p>
                <DonorList donors={apps as DonorApplicationWithDonor[]} canAct postId={postId} />
              </div>
            ))
          ) : (
            <div className="rounded-[1.25rem] border border-dashed border-border p-6 text-sm text-muted-foreground">
              Donor applications will appear here after matched donors respond.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
