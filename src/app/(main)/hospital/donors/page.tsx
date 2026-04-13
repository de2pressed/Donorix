import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfile, getHospitalDashboard } from "@/lib/data";

export default async function HospitalDonorsPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login?redirect=/hospital/donors");
  }

  if (profile.account_type !== "hospital") {
    redirect("/");
  }

  const dashboard = await getHospitalDashboard(profile.id);

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
          {dashboard.applicants.length ? (
            dashboard.applicants.map((application) => (
              <div key={application.id} className="rounded-[1.25rem] border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{application.donor?.full_name ?? "Donor"}</p>
                    <p className="text-sm text-muted-foreground">
                      {application.donor?.username ? `@${application.donor.username} • ` : ""}
                      {application.post?.patient_name ?? "Patient"} ({application.post?.patient_id ?? "No patient ID"})
                    </p>
                  </div>
                  <Badge variant="secondary">{application.status}</Badge>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Blood type {application.donor?.blood_type ?? "Unknown"} • Eligibility score {application.eligibility_score}
                  {application.distance_km ? ` • ${application.distance_km} km away` : ""}
                </p>
                {application.note ? <p className="mt-2 text-sm text-muted-foreground">{application.note}</p> : null}
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
