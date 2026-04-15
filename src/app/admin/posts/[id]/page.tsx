import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminPostActions } from "@/components/admin/admin-post-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminPostDetail } from "@/lib/data";
import { formatDateTime, formatDistance } from "@/lib/utils/format";

function getStatusVariant(status: string) {
  if (status === "active" || status === "fulfilled") return "success" as const;
  if (status === "deleted" || status === "shadow_banned") return "danger" as const;
  if (status === "expired") return "warning" as const;
  return "secondary" as const;
}

export default async function AdminPostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getAdminPostDetail(id);

  if (!detail.post) {
    notFound();
  }

  const post = detail.post;
  const { applications, actions } = detail;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">{post.patient_name}</h1>
          <p className="text-sm text-muted-foreground">
            {post.blood_type_needed} - {post.hospital_name} - {post.city}, {post.state}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={getStatusVariant(post.status)}>{post.status}</Badge>
          {post.is_emergency ? <Badge variant="warning">emergency</Badge> : null}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Post details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Creator</p>
              <p className="mt-1 font-medium">
                {post.creator ? `${post.creator.full_name} (@${post.creator.username})` : "Unknown"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Required by</p>
              <p className="mt-1 font-medium">{formatDateTime(post.required_by)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Radius</p>
              <p className="mt-1 font-medium">
                {post.current_radius_km} km (initial {post.initial_radius_km} km)
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Contact</p>
              <p className="mt-1 font-medium">{post.contact_name}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Medical condition</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {post.medical_condition || "No medical note provided."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Moderation</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminPostActions postId={post.id} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Donor applications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {applications.length ? (
              applications.map((application) => (
                <div key={application.id} className="rounded-[1.5rem] border border-border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        {application.donor?.full_name ?? application.donor?.username ?? "Unknown donor"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {application.donor?.blood_type ?? "Unknown blood type"} - {application.status}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">{formatDistance(application.distance_km)}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Score {application.eligibility_score} - {formatDateTime(application.created_at)}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-border p-4 text-sm text-muted-foreground">
                No donor applications found for this post.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin action history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {actions.length ? (
              actions.map((action) => (
                <div key={action.id} className="rounded-[1.5rem] border border-border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{action.action}</p>
                    <span className="text-sm text-muted-foreground">{formatDateTime(action.created_at)}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {action.reason || "No admin note recorded."}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-border p-4 text-sm text-muted-foreground">
                No admin actions recorded yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {post.creator ? (
        <p className="text-sm text-muted-foreground">
          Creator account: <Link className="text-brand hover:underline" href={`/admin/users/${post.creator.id}`}>{post.creator.full_name}</Link>
        </p>
      ) : null}
    </div>
  );
}
