import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistance } from "@/lib/utils/format";
import type { DonorApplication } from "@/types/post";

export function DonorList({ donors }: { donors: DonorApplication[] }) {
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
                  <p className="font-medium">{donor.status.toUpperCase()}</p>
                  <p className="text-sm text-muted-foreground">Eligibility score: {donor.eligibility_score}</p>
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
