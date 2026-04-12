import { notFound } from "next/navigation";

import { PostDetail } from "@/components/posts/post-detail";
import { getPostById } from "@/lib/data";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  return <PostDetail donors={[]} post={post} />;
}
