"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  ArrowBigUp,
  ChevronDown,
  ChevronUp,
  Clock3,
  Droplets,
  Hospital,
  MapPin,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { DonateButton } from "@/components/posts/donate-button";
import { EmergencyBadge } from "@/components/posts/emergency-badge";
import { RadiusIndicator } from "@/components/posts/radius-indicator";
import { UpvoteButton } from "@/components/posts/upvote-button";
import { BloodTypeBadge } from "@/components/ui/blood-type-badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { formatDateTime, formatRelativeTime } from "@/lib/utils/format";
import type { FeedPost } from "@/types/post";

export function PostCard({
  post,
  isAuthenticated = false,
  index = 0,
  mode = "feed",
}: {
  post: FeedPost;
  isAuthenticated?: boolean;
  index?: number;
  mode?: "feed" | "detail";
}) {
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const tRequest = useTranslations("request");
  const isDetailView = mode === "detail";
  const [expanded, setExpanded] = useState(isDetailView);
  const isActive = post.status === "active";
  const isFulfilled = post.status === "fulfilled";
  const cardInteractive = !isDetailView;

  function handleCardClick() {
    if (!cardInteractive) return;

    if (!expanded) {
      setExpanded(true);
      return;
    }

    router.push(`/posts/${post.id}`);
  }

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      transition={{ delay: index * 0.05, duration: 0.24, ease: "easeOut" }}
      viewport={{ amount: 0.2, once: true }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
    >
      <Card
        className={cn(
          "min-w-0 p-0",
          cardInteractive && "cursor-pointer select-none transition-shadow hover:shadow-md",
          post.is_emergency ? "overflow-visible" : "overflow-hidden",
          cardInteractive && post.is_emergency && "emergency-card",
        )}
        aria-expanded={cardInteractive ? expanded : undefined}
        onClick={cardInteractive ? handleCardClick : undefined}
        onKeyDown={
          cardInteractive
            ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleCardClick();
                }
              }
            : undefined
        }
        role={cardInteractive ? "button" : undefined}
        tabIndex={cardInteractive ? 0 : undefined}
      >
        <div className="flex min-h-[4.5rem] items-center gap-3 px-5 py-3 md:px-6">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <EmergencyBadge emergency={post.is_emergency} />
              <BloodTypeBadge bloodType={post.blood_type_needed} urgent={post.is_emergency} />
            </div>
            <span className="font-display block truncate font-bold text-base md:text-lg">
              {post.patient_name}
            </span>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="truncate">
                {post.city}, {post.state}
              </span>
              <span className="flex items-center gap-1">
                <ArrowBigUp className="size-3" />
                <span className="font-mono">{post.upvote_count ?? 0}</span>
              </span>
              <span className="font-mono">
                {tRequest("requiredBy")} {formatDateTime(post.required_by)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="size-3" />
                <span className="font-mono">{post.donor_count ?? 0}</span>
              </span>
            </div>
          </div>

          <div className="shrink-0">
            {cardInteractive && expanded ? (
              <button
                aria-label="Minimize request card"
                className="flex size-9 items-center justify-center rounded-full border border-border/70 bg-card/70 text-muted-foreground transition hover:border-brand/40 hover:text-brand"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setExpanded(false);
                }}
              >
                <ChevronUp className="size-4" />
              </button>
            ) : cardInteractive ? (
              <div aria-hidden="true" className="text-muted-foreground">
                <ChevronDown className="size-4" />
              </div>
            ) : null}
          </div>
        </div>

        <AnimatePresence initial={false}>
          {expanded ? (
            <motion.div
              key="expanded"
              className="overflow-hidden"
              initial={reduceMotion ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={reduceMotion ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.22, ease: "easeInOut" }}
            >
              <div className="space-y-5 border-t border-border px-5 pb-5 pt-4 md:px-6">
                {!isActive ? (
                  <div className="flex items-center gap-2 rounded-[1.25rem] bg-muted px-4 py-3 text-sm text-muted-foreground">
                    <span className="size-2 rounded-full bg-border" />
                    {isFulfilled
                      ? "This request has been fulfilled - a donor has been found."
                      : "This blood request is no longer active."}
                  </div>
                ) : null}

                {post.is_emergency ? (
                  <div className="flex items-start gap-3 rounded-[1.25rem] border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">
                    <EmergencyBadge emergency />
                    <span>Emergency request. Hospitals should treat this as clinically urgent.</span>
                  </div>
                ) : null}

                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
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
                      <Link
                        className="font-display block truncate text-2xl font-bold hover:text-brand"
                        href={`/posts/${post.id}`}
                        onClick={(event) => event.stopPropagation()}
                      >
                        {post.patient_name}
                      </Link>
                      <p className="mt-2 truncate font-mono text-sm text-muted-foreground">
                        {post.patient_id ? `${post.patient_id} - ` : ""}
                        {tRequest("requestedBy")} {post.contact_name} |{" "}
                        {formatRelativeTime(post.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-border bg-card/60 px-4 py-3 text-right max-sm:w-full">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      {tRequest("requiredBy")}
                    </p>
                    <p className="mt-1 font-mono font-semibold">{formatDateTime(post.required_by)}</p>
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
                        onClick={(event) => event.stopPropagation()}
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
                    <p className="mt-2 text-sm text-muted-foreground">
                      <span className="font-mono">{post.units_needed}</span> units
                    </p>
                  </div>
                </div>

                {post.additional_notes ? (
                  <p className="rounded-[1.5rem] border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                    {post.additional_notes}
                  </p>
                ) : null}

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-[1.35rem] border border-border/80 bg-card/45 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
                      Eligibility signal
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Donors see blood-type compatibility ranking and distance priority before they apply.
                    </p>
                  </div>
                  <div className="rounded-[1.35rem] border border-border/80 bg-card/45 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
                      Request timeline
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Posted &rarr; donor applications &rarr; approval &rarr; completion tracking in one thread.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Users className="size-4" />
                      <span className="font-mono">{post.donor_count ?? 0}</span> donors
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock3 className="size-4" />
                      {tRequest("expires")} <span className="font-mono">{formatDateTime(post.expires_at)}</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2" onClick={(event) => event.stopPropagation()}>
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

                {cardInteractive ? (
                  <p className="text-center text-xs text-muted-foreground/60">
                    Tap again to open full post &rarr;
                  </p>
                ) : null}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
