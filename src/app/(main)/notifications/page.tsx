import { NotificationList } from "@/components/notifications/notification-list";
import { getCurrentProfile, getNotifications } from "@/lib/data";
import { getRequestMessages, translate } from "@/lib/i18n";

export default async function NotificationsPage() {
  const [{ messages }, profile] = await Promise.all([getRequestMessages(), getCurrentProfile()]);
  const notifications = await getNotifications(profile?.id);
  const t = (key: string) => translate(messages, key);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold">{t("notifications.title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("notifications.subtitle")}
        </p>
      </div>
      <NotificationList notifications={notifications} />
    </div>
  );
}
