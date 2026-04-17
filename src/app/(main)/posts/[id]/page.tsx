import Link from "next/link";

import { PostDetail } from "@/components/posts/post-detail";
import { Button } from "@/components/ui/button";
import { getCurrentProfile, getDonorApplicationsForPost, getPostById } from "@/lib/data";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  const post = await getPostById(id, profile?.id);

  if (!post) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Request unavailable</p>
        <h1 className="text-3xl font-semibold">This blood request is no longer available.</h1>
        <p className="max-w-md text-muted-foreground">
          The request may have been fulfilled, expired, or removed. Return to the live feed to find active requests.
        </p>
        <Button asChild>
          <Link href="/">Back to feed</Link>
        </Button>
      </div>
    );
  }

  const canSeeDonors =
    Boolean(profile?.is_admin) ||
    (profile?.account_type === "hospital" && post.created_by === profile.id);
  const donors = canSeeDonors ? await getDonorApplicationsForPost(id) : [];

  return <PostDetail canAct={canSeeDonors} donors={donors} isAuthenticated={Boolean(profile)} post={post} />;
}
