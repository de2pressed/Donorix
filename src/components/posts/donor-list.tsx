import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistance } from "@/lib/utils/format";
import type { DonorApplicationWithDonor } from "@/types/post";

export function DonorList({ donors }: { donors: DonorApplicationWithDonor[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Donor applications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {donors.length ? (
          donors.map((donor) => (
            <div key={donor.id} className="rounded-[1.5rem] border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {donor.donor?.full_name ?? donor.donor?.username ?? "Donor application"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {donor.status.toUpperCase()} - Eligibility score: {donor.eligibility_score}
                  </p>
                  {donor.donor ? (
                    <p className="text-sm text-muted-foreground">
                      {donor.donor.blood_type ?? "Unknown blood type"} - {donor.donor.total_donations} donations -{" "}
                      {donor.donor.karma} karma
                    </p>
                  ) : null}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDistance(donor.distance_km)}
                </div>
              </div>
              {donor.note ? <p className="mt-2 text-sm text-muted-foreground">{donor.note}</p> : null}
            </div>
          ))
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-border p-6 text-sm text-muted-foreground">
            Donor applications will appear here after volunteers respond.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
