import { QueryTable } from "@/components/admin/query-table";
import { getAdminContactQueries } from "@/lib/data";

export default async function AdminQueriesPage() {
  const queries = await getAdminContactQueries();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold">User queries</h1>
        <p className="text-sm text-muted-foreground">
          Review signed-in user messages, reply inline, mark them solved, or delete them from the inbox.
        </p>
      </div>
      <QueryTable queries={queries} />
    </div>
  );
}
