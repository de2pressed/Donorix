import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminUserActions } from "@/components/admin/admin-user-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminUserDetail } from "@/lib/data";
import { formatDateTime } from "@/lib/utils/format";

function getStatusVariant(status: string) {
  if (status === "active") return "success" as const;
  if (status === "deleted" || status === "banned") return "danger" as const;
  if (status === "timeout") return "warning" as const;
  return "secondary" as const;
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getAdminUserDetail(id);

  if (!detail.profile) {
    notFound();
  }

  const profile = detail.profile;
  const { hospitalAccount, posts, applications, actions } = detail;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">{profile.full_name}</h1>
          <p className="text-sm text-muted-foreground">
            {profile.email} - {profile.phone}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={getStatusVariant(profile.status)}>{profile.status}</Badge>
          <Badge variant="secondary">{profile.account_type}</Badge>
          {profile.is_admin ? <Badge>admin</Badge> : null}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Username</p>
              <p className="mt-1 font-medium">@{profile.username}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Joined</p>
              <p className="mt-1 font-medium">{formatDateTime(profile.created_at)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Location</p>
              <p className="mt-1 font-medium">
                {profile.city}, {profile.state}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Blood type</p>
              <p className="mt-1 font-medium">{profile.blood_type ?? "Not set"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Karma</p>
              <p className="mt-1 font-medium">{profile.karma}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Total donations</p>
              <p className="mt-1 font-medium">{profile.total_donations}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Last donated</p>
              <p className="mt-1 font-medium">{formatDateTime(profile.last_donated_at, "Not recorded")}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Timeout until</p>
              <p className="mt-1 font-medium">{formatDateTime(profile.timeout_until, "Not set")}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Moderation</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminUserActions userId={profile.id} />
          </CardContent>
        </Card>
      </div>

      {hospitalAccount ? (
        <Card>
          <CardHeader>
            <CardTitle>Hospital account</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Hospital</p>
              <p className="mt-1 font-medium">{hospitalAccount.hospital_name}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Verification</p>
              <p className="mt-1 font-medium">{hospitalAccount.verification_status}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Registration</p>
              <p className="mt-1 font-medium">{hospitalAccount.registration_number}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Contact</p>
              <p className="mt-1 font-medium">{hospitalAccount.official_contact_email}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{profile.account_type === "hospital" ? "Recent posts" : "Recent applications"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.account_type === "hospital" ? (
              posts.length ? (
                posts.map((post) => (
                  <Link
                    key={post.id}
                    className="block rounded-[1.5rem] border border-border p-4 transition hover:bg-muted/40"
                    href={`/admin/posts/${post.id}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{post.patient_name}</p>
                      <Badge variant={getStatusVariant(post.status)}>{post.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {post.blood_type_needed} - {post.city} - {formatDateTime(post.created_at)}
                    </p>
                  </Link>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-border p-4 text-sm text-muted-foreground">
                  No posts found for this account.
                </div>
              )
            ) : applications.length ? (
              applications.map((application) => (
                <div key={application.id} className="rounded-[1.5rem] border border-border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{application.post?.patient_name ?? "Unknown post"}</p>
                    <Badge variant="secondary">{application.status}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {application.post?.blood_type_needed ?? "Unknown"} - {application.post?.city ?? "Unknown city"} -{" "}
                    {formatDateTime(application.created_at)}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-border p-4 text-sm text-muted-foreground">
                No donor applications found for this account.
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
    </div>
  );
}
