import { PostTable } from "@/components/admin/post-table";
import { getAdminPosts } from "@/lib/data";

export default async function AdminPostsPage() {
  const posts = await getAdminPosts();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold">Post moderation</h1>
        <p className="text-sm text-muted-foreground">
          Review emergency routing, shadow bans, fulfilment, and donor applications.
        </p>
      </div>
      <PostTable posts={posts} />
    </div>
  );
}
