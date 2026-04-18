"use client";

import { useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { NotificationToast, type NotificationToastItem } from "@/components/notifications/notification-toast";
import { useNotifications } from "@/lib/hooks/use-notifications";
import { useUser } from "@/lib/hooks/use-user";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Notification } from "@/types/notification";

type NotificationContextValue = {
  notifications: Notification[];
  unreadCount: number;
  toasts: NotificationToastItem[];
  dismissToast: (id: string) => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

function mapNotificationToToast(notification: Notification): NotificationToastItem {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.body,
    type:
      notification.type === "emergency"
        ? "emergency"
        : notification.type === "success"
          ? "success"
          : notification.type === "warning"
            ? "warning"
            : "info",
    createdAt: notification.created_at,
  };
}

function showBrowserNotification(notification: Notification) {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return;
  }

  if (window.Notification.permission !== "granted") {
    return;
  }

  if (document.visibilityState === "visible" && document.hasFocus()) {
    return;
  }

  try {
    const popup = new window.Notification(notification.title, {
      body: notification.body,
      tag: notification.id,
    });

    popup.onclick = () => {
      window.focus();
      popup.close();
    };
  } catch {
    // Native notifications are a best-effort enhancement only.
  }
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: user } = useUser();
  const {
    data: notifications = [],
    isFetching,
    isSuccess,
  } = useNotifications({ enabled: Boolean(user), userId: user?.id });
  const queryClient = useQueryClient();
  const [toasts, setToasts] = useState<NotificationToastItem[]>([]);
  const toastTimeouts = useRef<Map<string, number>>(new Map());
  const seenNotificationIds = useRef<Set<string>>(new Set());
  const previousNotificationIds = useRef<string[]>([]);
  const initializedNotifications = useRef(false);
  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
      toastTimeouts.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      toastTimeouts.current.clear();
      seenNotificationIds.current = new Set();
      previousNotificationIds.current = [];
      initializedNotifications.current = false;
      setToasts([]);
      return;
    }

    if (isSuccess && !isFetching) {
      const currentIds = notifications.map((notification) => notification.id);

      if (!initializedNotifications.current) {
        initializedNotifications.current = true;
        previousNotificationIds.current = currentIds;
        for (const notification of notifications) {
          seenNotificationIds.current.add(notification.id);
        }
        return;
      }

      const previousIds = new Set(previousNotificationIds.current);
      for (const notification of notifications) {
        if (!previousIds.has(notification.id) && !seenNotificationIds.current.has(notification.id)) {
          seenNotificationIds.current.add(notification.id);
          const toastItem = mapNotificationToToast(notification);

          const existingTimeout = toastTimeouts.current.get(notification.id);
          if (existingTimeout) {
            window.clearTimeout(existingTimeout);
          }

          setToasts((current) => [...current.filter((item) => item.id !== notification.id), toastItem]);
          showBrowserNotification(notification);

          const timeoutId = window.setTimeout(() => {
            setToasts((current) => current.filter((item) => item.id !== notification.id));
            toastTimeouts.current.delete(notification.id);
          }, 5000);

          toastTimeouts.current.set(notification.id, timeoutId);
        }
      }

      previousNotificationIds.current = currentIds;
    }
  }, [isFetching, isSuccess, notifications, userId]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }
    const timeouts = toastTimeouts.current;

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const notification = payload.new as Notification;
          const toastItem = mapNotificationToToast(notification);
          const wasSeen = seenNotificationIds.current.has(notification.id);

          queryClient.setQueryData<Notification[]>(["notifications", userId], (current = []) => [
            notification,
            ...current.filter((item) => item.id !== notification.id),
          ]);

          if (wasSeen) {
            return;
          }

          seenNotificationIds.current.add(notification.id);
          previousNotificationIds.current = [
            notification.id,
            ...previousNotificationIds.current.filter((id) => id !== notification.id),
          ];

          const existingTimeout = toastTimeouts.current.get(notification.id);
          if (existingTimeout) {
            window.clearTimeout(existingTimeout);
          }

          setToasts((current) => [...current.filter((item) => item.id !== notification.id), toastItem]);
          showBrowserNotification(notification);

          const timeoutId = window.setTimeout(() => {
            setToasts((current) => current.filter((item) => item.id !== notification.id));
            toastTimeouts.current.delete(notification.id);
          }, 5000);

          toastTimeouts.current.set(notification.id, timeoutId);
        },
      );

    channel.subscribe();

    return () => {
      timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timeouts.clear();
      void supabase.removeChannel(channel);
    };
  }, [queryClient, userId]);

  const dismissToast = useCallback((id: string) => {
    const timeoutId = toastTimeouts.current.get(id);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      toastTimeouts.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read_at).length,
    [notifications],
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      toasts,
      dismissToast,
    }),
    [dismissToast, notifications, toasts, unreadCount],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationToast onDismiss={dismissToast} toasts={toasts} />
    </NotificationContext.Provider>
  );
}

export function useNotificationsContext() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotificationsContext must be used within NotificationProvider");
  }

  return context;
}

export function useNotificationsContextSafe() {
  return useContext(NotificationContext);
}
