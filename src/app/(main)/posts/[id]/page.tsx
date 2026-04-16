import { notFound } from "next/navigation";

import { PostDetail } from "@/components/posts/post-detail";
import { getCurrentProfile, getDonorApplicationsForPost, getPostById } from "@/lib/data";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, profile] = await Promise.all([getPostById(id), getCurrentProfile()]);

  if (!post) {
    notFound();
  }

  const canSeeDonors =
    Boolean(profile?.is_admin) ||
    (profile?.account_type === "hospital" && post.created_by === profile.id);
  const donors = canSeeDonors ? await getDonorApplicationsForPost(id) : [];

  return <PostDetail canAct={canSeeDonors} donors={donors} isAuthenticated={Boolean(profile)} post={post} />;
}
