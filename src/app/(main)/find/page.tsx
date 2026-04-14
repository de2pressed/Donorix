import { redirect } from "next/navigation";

import { FindDonateFeed } from "@/components/posts/find-donate-feed";
import { getCurrentProfile, getFeedPosts } from "@/lib/data";

export default async function FindPage() {
  const [profile, posts] = await Promise.all([getCurrentProfile(), getFeedPosts()]);

  if (!profile) {
    redirect("/login?redirect=/find");
  }

  if (profile.account_type !== "donor") {
    redirect("/");
  }

  return (
    <FindDonateFeed donorBloodType={profile.blood_type} posts={posts} />
  );
}
