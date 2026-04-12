"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Clock3, Droplets, Hospital, MapPin, Users } from "lucide-react";

import { DonateButton } from "@/components/posts/donate-button";
import { EmergencyBadge } from "@/components/posts/emergency-badge";
import { RadiusIndicator } from "@/components/posts/radius-indicator";
import { UpvoteButton } from "@/components/posts/upvote-button";
import { BloodTypeBadge } from "@/components/ui/blood-type-badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { formatDateTime, formatRelativeTime } from "@/lib/utils/format";
import type { FeedPost } from "@/types/post";

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

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      transition={{ delay: index * 0.05, duration: 0.24, ease: "easeOut" }}
      viewport={{ amount: 0.2, once: true }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
    >
      <Card
        className={cn(
          "min-w-0 overflow-hidden",
          post.is_emergency && "emergency-pulse border-danger/40 shadow-glow",
        )}
      >
        <CardContent className="space-y-5 p-0">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <EmergencyBadge emergency={post.is_emergency} />
              <BloodTypeBadge bloodType={post.blood_type_needed} urgent={post.is_emergency} />
              <RadiusIndicator
                currentRadiusKm={post.current_radius_km}
                initialRadiusKm={post.initial_radius_km}
              />
            </div>
            <div className="min-w-0">
              <Link className="block truncate text-2xl font-semibold hover:text-brand" href={`/posts/${post.id}`}>
                {post.patient_name}
              </Link>
              <p className="mt-2 truncate text-sm text-muted-foreground">
                Requested by {post.contact_name} | {formatRelativeTime(post.created_at)}
              </p>
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-border bg-card/60 px-4 py-3 text-right max-sm:w-full">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Required by</p>
            <p className="mt-1 font-semibold">{formatDateTime(post.required_by)}</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-border p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Hospital className="size-4 text-brand" />
              Hospital
            </div>
            <p className="mt-2 truncate text-sm text-muted-foreground">{post.hospital_name}</p>
          </div>
          <div className="rounded-[1.5rem] border border-border p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="size-4 text-brand" />
              Location
            </div>
            <p className="mt-2 truncate text-sm text-muted-foreground">
              {post.city}, {post.state}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-border p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Droplets className="size-4 text-brand" />
              Units needed
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{post.units_needed} units</p>
          </div>
        </div>

        {post.additional_notes ? (
          <p className="rounded-[1.5rem] border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            {post.additional_notes}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Users className="size-4" />
              {post.donor_count} donors
            </span>
            <span className="flex items-center gap-2">
              <Clock3 className="size-4" />
              Expires {formatDateTime(post.expires_at)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <UpvoteButton count={post.upvote_count} isAuthenticated={isAuthenticated} postId={post.id} />
            <DonateButton isAuthenticated={isAuthenticated} postId={post.id} />
          </div>
        </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
