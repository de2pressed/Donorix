import { NotificationList } from "@/components/notifications/notification-list";
import { getCurrentProfile, getNotifications } from "@/lib/data";

export default async function NotificationsPage() {
  const profile = await getCurrentProfile();
  const notifications = await getNotifications(profile?.id);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold">Notifications</h1>
        <p className="text-sm text-muted-foreground">
          Match alerts, donor approvals, expiry reminders, and admin notices.
        </p>
      </div>
      <NotificationList notifications={notifications} />
    </div>
  );
}
