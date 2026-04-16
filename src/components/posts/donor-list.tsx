"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authenticatedFetch } from "@/lib/supabase/authenticated-fetch";
import { formatDistance } from "@/lib/utils/format";
import type { DonorApplicationWithDonor } from "@/types/post";
import { useTranslations } from "next-intl";

export function DonorList({
  donors,
  canAct = false,
  postId,
}: {
  donors: DonorApplicationWithDonor[];
  canAct?: boolean;
  postId?: string;
}) {
  const router = useRouter();
  const tRequest = useTranslations("request");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function updateStatus(donorId: string, status: "approved" | "rejected") {
    if (!postId) {
      return;
    }

    setBusyId(donorId);
    try {
      const response = await authenticatedFetch(`/api/posts/${postId}/donors/${donorId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      const body = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        toast.error(body?.error ?? "Unable to update donor application");
        return;
      }

      toast.success(status === "approved" ? "Donor approved" : "Application rejected");
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tRequest("donorApplicationsTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {donors.length ? (
          donors.map((donor) => (
            <div key={donor.id} className="rounded-[1.5rem] border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  {donor.donor?.username ? (
                    <Link
                      className="font-medium transition-colors hover:text-brand"
                      href={`/profile/${donor.donor.username}`}
                    >
                      {donor.donor.full_name ?? donor.donor.username}
                    </Link>
                  ) : (
                    <p className="font-medium">
                      {donor.donor?.full_name ?? "Donor application"}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {tRequest(`status.${donor.status}`)} - {tRequest("eligibilityScore")} {donor.eligibility_score}
                  </p>
                  {donor.donor ? (
                    <p className="text-sm text-muted-foreground">
                      {donor.donor.blood_type ?? tRequest("unknownBloodType")} - {donor.donor.total_donations}{" "}
                      {tRequest("donations")} - {donor.donor.karma} {tRequest("karma")}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-col items-end gap-2 text-sm text-muted-foreground">
                  <span>{formatDistance(donor.distance_km)}</span>
                  {canAct && donor.status === "pending" && postId ? (
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        disabled={busyId === donor.id}
                        size="sm"
                        onClick={() => {
                          void updateStatus(donor.donor_id, "approved");
                        }}
                      >
                        {tRequest("accept")}
                      </Button>
                      <Button
                        disabled={busyId === donor.id}
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          void updateStatus(donor.donor_id, "rejected");
                        }}
                      >
                        {tRequest("reject")}
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
              {donor.note ? <p className="mt-2 text-sm text-muted-foreground">{donor.note}</p> : null}
            </div>
          ))
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-border p-6 text-sm text-muted-foreground">
            {tRequest("donorApplicationsEmpty")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
