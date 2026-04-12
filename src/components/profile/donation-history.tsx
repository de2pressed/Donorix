import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils/format";

type DonationHistoryItem = {
  id: string;
  donated_at: string;
  units: number;
  hospital_name: string;
  city: string;
};

export function DonationHistory({ donations }: { donations: DonationHistoryItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Donation history</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {donations.length ? (
          donations.map((donation) => (
            <div key={donation.id} className="rounded-[1.5rem] border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{donation.hospital_name}</p>
                  <p className="text-sm text-muted-foreground">{donation.city}</p>
                </div>
                <div className="text-right text-sm">
                  <p>{donation.units} units</p>
                  <p className="text-muted-foreground">{formatDateTime(donation.donated_at)}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-border p-6 text-sm text-muted-foreground">
            Donation history will appear after verified matches are completed.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
