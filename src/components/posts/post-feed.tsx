"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { PostCard } from "@/components/posts/post-card";
import { PostFilter } from "@/components/posts/post-filter";
import { PostSearch } from "@/components/posts/post-search";
import type { FeedPost } from "@/types/post";

export function PostFeed({
  posts,
  isAuthenticated = false,
}: {
  posts: FeedPost[];
  isAuthenticated?: boolean;
}) {
  const tFeed = useTranslations("feed");
  const [query, setQuery] = useState("");
  const [emergencyOnly, setEmergencyOnly] = useState(false);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return posts.filter((post) => {
      if (emergencyOnly && !post.is_emergency) return false;
      if (!normalizedQuery) return true;

      return [
        post.patient_name,
        post.blood_type_needed,
        post.city,
        post.state,
        post.hospital_name,
        post.medical_condition,
      ]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(normalizedQuery));
    });
  }, [emergencyOnly, posts, query]);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <PostSearch value={query} onChange={setQuery} />
        <PostFilter emergencyOnly={emergencyOnly} onEmergencyChange={setEmergencyOnly} />
      </div>

      <div className="space-y-5 [overflow-x:clip]">
        {filteredPosts.length ? (
          filteredPosts.map((post, index) => (
            <PostCard key={post.id} index={index} isAuthenticated={isAuthenticated} post={post} />
          ))
        ) : (
          <div className="rounded-[1.75rem] border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            {tFeed("noMatches")}
          </div>
        )}
      </div>
    </div>
  );
}
