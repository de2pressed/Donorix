"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/utils/format";
import type { Notification } from "@/types/notification";

export function NotificationList({ notifications }: { notifications: Notification[] }) {
  const tNotifications = useTranslations("notifications");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tNotifications("sectionTitle")}</CardTitle>
        <CardDescription>{tNotifications("sectionSubtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {notifications.length ? (
          notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.04, duration: 0.22, ease: "easeOut" }}
            >
              <Link
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
            </motion.div>
          ))
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-border p-6 text-sm text-muted-foreground">
            {tNotifications("empty")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
