import { notFound } from "next/navigation";

import { AdminContactQueryActions } from "@/components/admin/admin-contact-query-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminContactQueryById } from "@/lib/data";
import { formatDateTime } from "@/lib/utils/format";

function getStatusVariant(status: "unresolved" | "solved"): "success" | "warning" {
  return status === "solved" ? "success" : "warning";
}

export default async function AdminQueryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const query = await getAdminContactQueryById(id);

  if (!query) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">{query.subject}</h1>
          <p className="text-sm text-muted-foreground">
            {query.submitted_name} - {query.submitted_email} - {formatDateTime(query.created_at)}
          </p>
        </div>
        <Badge variant={getStatusVariant(query.status)}>{query.status}</Badge>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Query details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Name</p>
                <p className="mt-1 font-medium">{query.submitted_name}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Phone</p>
                <p className="mt-1 font-medium">{query.submitted_phone}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Account type</p>
                <p className="mt-1 font-medium capitalize">{query.submitted_account_type}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Updated</p>
                <p className="mt-1 font-medium">{formatDateTime(query.updated_at)}</p>
              </div>
            </div>

            <div className="rounded-[1.25rem] border border-border bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">User message</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{query.query}</p>
            </div>

            <div className="rounded-[1.25rem] border border-border bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Latest reply</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
                {query.reply?.trim() ? query.reply : "No reply recorded yet."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminContactQueryActions initialReply={query.reply} queryId={query.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
