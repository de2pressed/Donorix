import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils/format";
import type { ContactQuery } from "@/types/contact-query";

function getStatusVariant(status: ContactQuery["status"]): "success" | "warning" {
  return status === "solved" ? "success" : "warning";
}

export function QueryTable({ queries }: { queries: ContactQuery[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User queries</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {queries.length ? (
          queries.map((query) => (
            <Link
              key={query.id}
              href={`/admin/queries/${query.id}`}
              className="grid gap-3 rounded-[1.5rem] border border-border p-4 transition hover:bg-muted/40 md:grid-cols-[1.4fr_1fr_0.7fr]"
            >
              <div className="min-w-0 space-y-1">
                <p className="truncate font-medium">{query.subject}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {query.submitted_name} - {query.submitted_email}
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>{query.submitted_account_type}</p>
                <p className="font-mono">{formatDateTime(query.created_at)}</p>
              </div>
              <div className="flex items-center justify-start md:justify-end">
                <Badge variant={getStatusVariant(query.status)}>{query.status}</Badge>
              </div>
            </Link>
          ))
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-border p-6 text-sm text-muted-foreground">
            No queries found.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
