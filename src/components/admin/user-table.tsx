import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Profile } from "@/types/user";

export function UserTable({ users }: { users: Profile[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {users.length ? (
          users.map((user) => (
            <div
              key={user.id}
              className="grid gap-3 rounded-[1.5rem] border border-border p-4 md:grid-cols-[1.7fr_repeat(5,minmax(0,1fr))]"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{user.full_name}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {user.email} • {user.phone}
                </p>
              </div>
              <div className="text-sm capitalize">{user.account_type}</div>
              <div className="text-sm">{user.blood_type ?? "—"}</div>
              <div className="text-sm">{user.karma}</div>
              <div className="text-sm">{user.status}</div>
              <div className="truncate text-sm text-muted-foreground">{user.city}</div>
            </div>
          ))
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-border p-6 text-sm text-muted-foreground">
            No users found.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
