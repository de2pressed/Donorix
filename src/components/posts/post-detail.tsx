import { PostCard } from "@/components/posts/post-card";
import { DonorList } from "@/components/posts/donor-list";
import type { DonorApplicationWithDonor, FeedPost } from "@/types/post";

export function PostDetail({
  post,
  donors,
}: {
  post: FeedPost;
  donors: DonorApplicationWithDonor[];
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <PostCard post={post} />
      <DonorList donors={donors} />
    </div>
  );
}
