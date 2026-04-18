import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DonationHistory } from "@/components/profile/donation-history";
import { KarmaProgress } from "@/components/profile/karma-progress";
import { ProfileHeader } from "@/components/profile/profile-header";
import {
  getHospitalAccountByProfileId,
  getHospitalPosts,
  getProfileByUsername,
  getRecentDonations,
} from "@/lib/data";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);

  if (!profile || !profile.is_discoverable) {
    notFound();
  }

  if (profile.account_type === "hospital") {
    const [hospitalAccount, posts] = await Promise.all([
      getHospitalAccountByProfileId(profile.id),
      getHospitalPosts(profile.id),
    ]);
    const recentPosts = [...posts]
      .filter((post) => post.status !== "deleted")
      .sort(
      (left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
      );

    return (
      <div className="space-y-6">
        <ProfileHeader profile={profile} />

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card>
            <CardHeader>
              <CardTitle>Hospital details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Hospital name</p>
                <p className="mt-1 font-medium">
                  {hospitalAccount?.hospital_name ?? profile.full_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Verification</p>
                <div className="mt-1">
                  <Badge
                    variant={
                      hospitalAccount?.verification_status === "verified" ? "success" : "secondary"
                    }
                  >
                    {hospitalAccount?.verification_status ?? "unknown"}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Registration number</p>
                <p className="mt-1 font-medium">
                  {hospitalAccount?.registration_number ?? "Not available"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact</p>
                <p className="mt-1 font-medium">
                  {hospitalAccount?.contact_person_name ?? "Not available"}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="mt-1 font-medium">
                  {hospitalAccount?.address ?? [profile.city, profile.state].filter(Boolean).join(", ")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent requests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentPosts.length ? (
                recentPosts.slice(0, 5).map((post) => (
                  <div key={post.id} className="rounded-[1.25rem] border border-border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link className="font-medium transition-colors hover:text-brand" href={`/posts/${post.id}`}>
                          {post.patient_name}
                        </Link>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {post.blood_type_needed} - {post.city}
                        </p>
                      </div>
                      <Badge variant={post.status === "active" ? "success" : "secondary"}>
                        {post.status}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {post.donor_count ?? 0} donor applicants
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.25rem] border border-dashed border-border p-6 text-sm text-muted-foreground">
                  No public requests yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const donations = await getRecentDonations(profile.id);

  return (
    <div className="space-y-6">
      <ProfileHeader profile={profile} />
      <KarmaProgress karma={profile.karma} />
      <DonationHistory donations={donations} />
    </div>
  );
}
