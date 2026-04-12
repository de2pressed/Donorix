import { notFound } from "next/navigation";

import { DonationHistory } from "@/components/profile/donation-history";
import { KarmaProgress } from "@/components/profile/karma-progress";
import { ProfileHeader } from "@/components/profile/profile-header";
import { getProfileByUsername, getRecentDonations } from "@/lib/data";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);

  if (!profile) {
    notFound();
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
