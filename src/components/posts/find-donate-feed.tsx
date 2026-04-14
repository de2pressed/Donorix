"use client";

import { useMemo, useState } from "react";

import { PostCard } from "@/components/posts/post-card";
import { PostFilter } from "@/components/posts/post-filter";
import { PostSearch } from "@/components/posts/post-search";
import { BloodTypeBadge } from "@/components/ui/blood-type-badge";
import { Button } from "@/components/ui/button";
import type { FeedPost } from "@/types/post";

const COMPATIBLE_RECIPIENTS: Record<string, string[]> = {
  "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  "O+": ["O+", "A+", "B+", "AB+"],
  "A-": ["A-", "A+", "AB-", "AB+"],
  "A+": ["A+", "AB+"],
  "B-": ["B-", "B+", "AB-", "AB+"],
  "B+": ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"],
};

export function FindDonateFeed({
  posts,
  donorBloodType,
}: {
  posts: FeedPost[];
  donorBloodType: string | null;
}) {
  const [query, setQuery] = useState("");
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [compatibleOnly, setCompatibleOnly] = useState(Boolean(donorBloodType));

  const compatibleTypes = useMemo(() => {
    if (!donorBloodType) return [];
    return COMPATIBLE_RECIPIENTS[donorBloodType] ?? [donorBloodType];
  }, [donorBloodType]);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return posts.filter((post) => {
      if (compatibleOnly && compatibleTypes.length && !compatibleTypes.includes(post.blood_type_needed)) {
        return false;
      }

      if (emergencyOnly && !post.is_emergency) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

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
  }, [compatibleOnly, compatibleTypes, emergencyOnly, posts, query]);

  return (
    <div className="space-y-6">
      <section className="surface hero-grid overflow-hidden p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Donor matching</p>
              {donorBloodType ? <BloodTypeBadge bloodType={donorBloodType} /> : null}
            </div>
            <div className="space-y-2">
              <h1 className="text-balance text-3xl font-semibold md:text-4xl">
                Find Requests Matching Your Blood Type
              </h1>
              <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
                Start with requests your blood type can support, then expand to every live request if you want a broader view.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={compatibleOnly ? "default" : "outline"}
              onClick={() => setCompatibleOnly(true)}
            >
              Compatible matches
            </Button>
            <Button
              type="button"
              variant={!compatibleOnly ? "default" : "outline"}
              onClick={() => setCompatibleOnly(false)}
            >
              All blood types
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <PostSearch value={query} onChange={setQuery} />
        <PostFilter emergencyOnly={emergencyOnly} onEmergencyChange={setEmergencyOnly} />
      </div>

      {filteredPosts.length ? (
        <div className="space-y-5">
          {filteredPosts.map((post, index) => (
            <PostCard key={post.id} index={index} isAuthenticated post={post} />
          ))}
        </div>
      ) : (
        <div className="surface p-8 text-center">
          <h2 className="text-xl font-semibold">No matching requests right now</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {compatibleOnly && donorBloodType
              ? `No active requests for ${donorBloodType}-compatible donations are visible in your current area. Try expanding to all blood types or check back soon.`
              : "No active requests match your current search and filter settings."}
          </p>
        </div>
      )}
    </div>
  );
}
