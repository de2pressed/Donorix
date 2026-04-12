import { UserTable } from "@/components/admin/user-table";
import { getLeaderboard } from "@/lib/data";

export default async function AdminUsersPage() {
  const users = await getLeaderboard();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold">User management</h1>
        <p className="text-sm text-muted-foreground">
          Search, review, and moderate donors with complete activity context.
        </p>
      </div>
      <UserTable users={users} />
    </div>
  );
}
