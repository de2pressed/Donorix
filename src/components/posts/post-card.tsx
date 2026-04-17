"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, Clock3, Droplets, Hospital, MapPin, Users } from "lucide-react";

import { DonateButton } from "@/components/posts/donate-button";
import { EmergencyBadge } from "@/components/posts/emergency-badge";
import { RadiusIndicator } from "@/components/posts/radius-indicator";
import { UpvoteButton } from "@/components/posts/upvote-button";
import { BloodTypeBadge } from "@/components/ui/blood-type-badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { formatDateTime, formatRelativeTime } from "@/lib/utils/format";
import type { FeedPost } from "@/types/post";
import { useTranslations } from "next-intl";

export function PostCard({
  post,
  isAuthenticated = false,
  index = 0,
}: {
  post: FeedPost;
  isAuthenticated?: boolean;
  index?: number;
}) {
  const reduceMotion = useReducedMotion();
  const tRequest = useTranslations("request");
  const isActive = post.status === "active";
  const isFulfilled = post.status === "fulfilled";

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      transition={{ delay: index * 0.05, duration: 0.24, ease: "easeOut" }}
      viewport={{ amount: 0.2, once: true }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
    >
      <Card
        className={cn(
          "min-w-0",
          post.is_emergency ? "overflow-visible" : "overflow-hidden",
          post.is_emergency && "emergency-card",
        )}
      >
        <CardContent className="space-y-5 p-5">
          {!isActive ? (
            <div className="flex items-center gap-2 rounded-t-[1.5rem] bg-muted px-5 py-3 text-sm text-muted-foreground">
              <span className="size-2 rounded-full bg-border" />
              {isFulfilled
                ? "This request has been fulfilled - a donor has been found."
                : "This blood request is no longer active."}
            </div>
          ) : null}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <EmergencyBadge emergency={post.is_emergency} />
                <BloodTypeBadge bloodType={post.blood_type_needed} urgent={post.is_emergency} />
                <RadiusIndicator
                  currentRadiusKm={post.current_radius_km}
                  initialRadiusKm={post.initial_radius_km}
                />
                {post.is_legacy ? (
                  <span className="rounded-full border border-border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Legacy
                  </span>
                ) : null}
              </div>
              <div className="min-w-0">
                <Link className="block truncate text-2xl font-semibold hover:text-brand" href={`/posts/${post.id}`}>
                  {post.patient_name}
                </Link>
                <p className="mt-2 truncate text-sm text-muted-foreground">
                  {post.patient_id ? `${post.patient_id} • ` : ""}
                  {tRequest("requestedBy")} {post.contact_name} | {formatRelativeTime(post.created_at)}
                </p>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-border bg-card/60 px-4 py-3 text-right max-sm:w-full">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{tRequest("requiredBy")}</p>
              <p className="mt-1 font-semibold">{formatDateTime(post.required_by)}</p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-border p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Hospital className="size-4 text-brand" />
                {tRequest("hospital")}
              </div>
              {post.creator?.username ? (
                <Link
                  className="mt-2 block truncate text-sm text-muted-foreground transition hover:text-brand"
                  href={`/profile/${post.creator.username}`}
                >
                  {post.hospital_name}
                </Link>
              ) : (
                <p className="mt-2 truncate text-sm text-muted-foreground">{post.hospital_name}</p>
              )}
              <p className="mt-2 inline-flex items-center gap-1 rounded-full border border-brand/20 bg-brand-soft/60 px-2 py-1 text-[11px] font-medium text-brand">
                <BadgeCheck className="size-3" />
                Registered facility source
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-border p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <MapPin className="size-4 text-brand" />
                {tRequest("location")}
              </div>
              <p className="mt-2 truncate text-sm text-muted-foreground">
                {post.city}, {post.state}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-border p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Droplets className="size-4 text-brand" />
                {tRequest("unitsNeeded")}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{post.units_needed} units</p>
            </div>
          </div>

          {post.additional_notes ? (
            <p className="rounded-[1.5rem] border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              {post.additional_notes}
            </p>
          ) : null}

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-[1.35rem] border border-border/80 bg-card/45 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Eligibility signal</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Donors see blood-type compatibility ranking and distance priority before they apply.
              </p>
            </div>
            <div className="rounded-[1.35rem] border border-border/80 bg-card/45 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Request timeline</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Posted -> donor applications -> approval -> completion tracking in one thread.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Users className="size-4" />
                {post.donor_count ?? 0} donors
              </span>
              <span className="flex items-center gap-2">
                <Clock3 className="size-4" />
                {tRequest("expires")} {formatDateTime(post.expires_at)}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <UpvoteButton
                count={post.upvote_count}
                hasVoted={Boolean(post.has_voted)}
                isAuthenticated={isAuthenticated}
                disabled={!isActive}
                postId={post.id}
              />
              <DonateButton disabled={!isActive} isAuthenticated={isAuthenticated} postId={post.id} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
