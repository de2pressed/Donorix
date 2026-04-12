import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FeedPost } from "@/types/post";

export function PostTable({ posts }: { posts: FeedPost[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Post moderation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {posts.length ? (
          posts.map((post) => (
            <div key={post.id} className="grid gap-3 rounded-[1.5rem] border border-border p-4 md:grid-cols-[1.5fr_repeat(4,1fr)]">
              <div>
                <p className="font-medium">{post.patient_name}</p>
                <p className="text-sm text-muted-foreground">{post.hospital_name}</p>
              </div>
              <div className="text-sm">{post.blood_type_needed}</div>
              <div className="text-sm">{post.city}</div>
              <div className="text-sm">{post.status}</div>
              <div className="text-sm">{post.donor_count} donors</div>
            </div>
          ))
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-border p-6 text-sm text-muted-foreground">
            No posts found.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
