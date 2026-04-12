import Link from "next/link";
import { Clock3, Droplets, Hospital, MapPin, Users } from "lucide-react";

import { BloodTypeBadge } from "@/components/ui/blood-type-badge";
import { Card, CardContent } from "@/components/ui/card";
import { DonateButton } from "@/components/posts/donate-button";
import { EmergencyBadge } from "@/components/posts/emergency-badge";
import { RadiusIndicator } from "@/components/posts/radius-indicator";
import { UpvoteButton } from "@/components/posts/upvote-button";
import { formatDateTime, formatRelativeTime } from "@/lib/utils/format";
import type { FeedPost } from "@/types/post";

export function PostCard({ post }: { post: FeedPost }) {
  return (
    <Card className={post.is_emergency ? "border-danger/40 shadow-glow" : undefined}>
      <CardContent className="space-y-5 p-0">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <EmergencyBadge emergency={post.is_emergency} />
              <BloodTypeBadge bloodType={post.blood_type_needed} urgent={post.is_emergency} />
              <RadiusIndicator
                currentRadiusKm={post.current_radius_km}
                initialRadiusKm={post.initial_radius_km}
              />
            </div>
            <div>
              <Link href={`/posts/${post.id}`} className="text-2xl font-semibold hover:text-brand">
                {post.patient_name}
              </Link>
              <p className="mt-2 text-sm text-muted-foreground">
                Requested by {post.contact_name} • {formatRelativeTime(post.created_at)}
              </p>
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-border bg-card/60 px-4 py-3 text-right">
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
            <p className="mt-2 text-sm text-muted-foreground">{post.hospital_name}</p>
          </div>
          <div className="rounded-[1.5rem] border border-border p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="size-4 text-brand" />
              Location
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
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
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Users className="size-4" />
              {post.donor_count} donors
            </span>
            <span className="flex items-center gap-2">
              <Clock3 className="size-4" />
              Expires {formatDateTime(post.expires_at)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <UpvoteButton count={post.upvote_count} postId={post.id} />
            <DonateButton postId={post.id} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
