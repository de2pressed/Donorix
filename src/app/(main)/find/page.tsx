import { redirect } from "next/navigation";

import { PostFeed } from "@/components/posts/post-feed";
import { getCurrentProfile, getFeedPosts } from "@/lib/data";

export default async function FindPage() {
  const [profile, posts] = await Promise.all([getCurrentProfile(), getFeedPosts()]);

  if (!profile) {
    redirect("/login?redirect=/find");
  }

  const filteredPosts =
    profile.account_type === "donor" && profile.blood_type
      ? posts.filter(
          (post) =>
            post.blood_type_needed === profile.blood_type ||
            post.blood_type_needed === "O-" ||
            post.is_emergency,
        )
      : posts;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold">Find to Donate</h1>
        <p className="text-sm text-muted-foreground">
          Requests are prioritised for your blood group, emergency level, and current availability.
        </p>
      </div>
      <PostFeed isAuthenticated posts={filteredPosts} />
    </div>
  );
}
