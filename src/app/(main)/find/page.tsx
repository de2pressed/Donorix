import { redirect } from "next/navigation";

import { FindDonateFeed } from "@/components/posts/find-donate-feed";
import { getCurrentProfile, getFeedPosts } from "@/lib/data";

export default async function FindPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login?redirect=/find");
  }

  if (profile.account_type !== "donor") {
    redirect("/");
  }

  const posts = await getFeedPosts(profile.id);

  return (
    <FindDonateFeed donorBloodType={profile.blood_type} posts={posts} />
  );
}
