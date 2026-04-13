import { UserTable } from "@/components/admin/user-table";
import { getAdminUsers } from "@/lib/data";

export default async function AdminUsersPage() {
  const users = await getAdminUsers();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold">User management</h1>
        <p className="text-sm text-muted-foreground">
          Search, review, and moderate donor and hospital accounts with complete activity context.
        </p>
      </div>
      <UserTable users={users} />
    </div>
  );
}
