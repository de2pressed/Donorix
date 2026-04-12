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
            <div key={user.id} className="grid gap-3 rounded-[1.5rem] border border-border p-4 md:grid-cols-[1.5fr_repeat(4,1fr)]">
              <div>
                <p className="font-medium">{user.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  {user.email} • {user.phone}
                </p>
              </div>
              <div className="text-sm">{user.blood_type}</div>
              <div className="text-sm">{user.karma}</div>
              <div className="text-sm">{user.status}</div>
              <div className="text-sm text-muted-foreground">{user.city}</div>
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
