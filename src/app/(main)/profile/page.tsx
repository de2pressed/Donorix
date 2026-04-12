import { redirect } from "next/navigation";

import { DonationHistory } from "@/components/profile/donation-history";
import { EditProfileForm } from "@/components/profile/edit-profile-form";
import { KarmaProgress } from "@/components/profile/karma-progress";
import { ProfileHeader } from "@/components/profile/profile-header";
import { getCurrentProfile, getRecentDonations } from "@/lib/data";

export default async function ProfilePage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  const donations = await getRecentDonations(profile.id);

  return (
    <div className="space-y-6">
      <ProfileHeader profile={profile} />
      <KarmaProgress karma={profile.karma} />
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <EditProfileForm profile={profile} />
        <DonationHistory donations={donations} />
      </div>
    </div>
  );
}
