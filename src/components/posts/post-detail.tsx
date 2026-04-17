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
  const showDonorRail = canAct || donors.length > 0;

  return (
    <div className={showDonorRail ? "grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]" : "space-y-6"}>
      <div className="min-w-0">
        <PostCard isAuthenticated={isAuthenticated} post={post} />
      </div>
      {showDonorRail ? (
        <div className="min-w-0">
          <DonorList canAct={canAct} donors={donors} postId={post.id} />
        </div>
      ) : null}
    </div>
  );
}
