import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/utils/format";
import type { Notification } from "@/types/notification";

export function NotificationList({ notifications }: { notifications: Notification[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification inbox</CardTitle>
        <CardDescription>Realtime matches, approvals, reminders, and policy alerts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {notifications.length ? (
          notifications.map((notification) => (
            <Link
              key={notification.id}
              href={notification.post_id ? `/posts/${notification.post_id}` : "/notifications"}
              className="block rounded-[1.5rem] border border-border p-4 transition hover:bg-muted/50"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="font-medium">{notification.title}</p>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(notification.created_at)}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{notification.body}</p>
            </Link>
          ))
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-border p-6 text-sm text-muted-foreground">
            No notifications yet. Blood matches, approvals, and reminders will appear here.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
