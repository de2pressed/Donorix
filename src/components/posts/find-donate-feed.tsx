"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { PostCard } from "@/components/posts/post-card";
import { PostFilter } from "@/components/posts/post-filter";
import { PostSearch } from "@/components/posts/post-search";
import { BloodTypeBadge } from "@/components/ui/blood-type-badge";
import { Button } from "@/components/ui/button";
import { BLOOD_TYPES } from "@/lib/constants";
import type { FeedPost } from "@/types/post";
import { canDonateToRecipient, isBloodType } from "@/lib/utils/blood-type";

export function FindDonateFeed({
  posts,
  donorBloodType,
}: {
  posts: FeedPost[];
  donorBloodType: string | null;
}) {
  const tFeed = useTranslations("feed");
  const [query, setQuery] = useState("");
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [compatibleOnly, setCompatibleOnly] = useState(Boolean(donorBloodType));

  const compatibleTypes = useMemo(() => {
    if (!donorBloodType || !isBloodType(donorBloodType)) return [];
    return BLOOD_TYPES.filter((bloodType) => canDonateToRecipient(donorBloodType, bloodType));
  }, [donorBloodType]);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return posts.filter((post) => {
      if (compatibleOnly) {
        if (!post.blood_type_needed || !isBloodType(post.blood_type_needed)) {
          return false;
        }

        if (!compatibleTypes.includes(post.blood_type_needed)) {
          return false;
        }
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
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">{tFeed("badge")}</p>
              {donorBloodType ? <BloodTypeBadge bloodType={donorBloodType} /> : null}
            </div>
            <div className="space-y-2">
              <h1 className="text-balance text-3xl font-semibold md:text-4xl">{tFeed("title")}</h1>
              <p className="max-w-3xl text-sm text-muted-foreground md:text-base">{tFeed("subtitle")}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={compatibleOnly ? "default" : "outline"}
              onClick={() => setCompatibleOnly(true)}
            >
              {tFeed("compatibleMatches")}
            </Button>
            <Button
              type="button"
              variant={!compatibleOnly ? "default" : "outline"}
              onClick={() => setCompatibleOnly(false)}
            >
              {tFeed("allBloodTypes")}
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
          <h2 className="text-xl font-semibold">{tFeed("noMatchesTitle")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {compatibleOnly && donorBloodType
              ? tFeed("noMatchesCompatible", { bloodType: donorBloodType })
              : tFeed("noMatchesGeneral")}
          </p>
        </div>
      )}
    </div>
  );
}
