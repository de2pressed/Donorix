import { PostCard } from "@/components/posts/post-card";
import { DonorList } from "@/components/posts/donor-list";
import type { DonorApplicationWithDonor, FeedPost } from "@/types/post";

export function PostDetail({
  post,
  donors,
  canAct = false,
  isAuthenticated = false,
}: {
  post: FeedPost;
  donors: DonorApplicationWithDonor[];
  canAct?: boolean;
  isAuthenticated?: boolean;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <PostCard isAuthenticated={isAuthenticated} post={post} />
      <DonorList canAct={canAct} donors={donors} postId={post.id} />
    </div>
  );
}
