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

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: user } = useUser();
  const {
    data: notifications = [],
    isFetching,
    isSuccess,
  } = useNotifications({ enabled: Boolean(user), userId: user?.id });
  const queryClient = useQueryClient();
  const [toasts, setToasts] = useState<NotificationToastItem[]>([]);
  const isInitialLoadComplete = useRef(false);
  const toastTimeouts = useRef<Map<string, number>>(new Map());
  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
      isInitialLoadComplete.current = false;
      toastTimeouts.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      toastTimeouts.current.clear();
      setToasts([]);
      return;
    }

    if (isSuccess && !isFetching) {
      isInitialLoadComplete.current = true;
    }
  }, [isFetching, isSuccess, userId]);

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

          queryClient.setQueryData<Notification[]>(["notifications", userId], (current = []) => [
            notification,
            ...current.filter((item) => item.id !== notification.id),
          ]);

          if (!isInitialLoadComplete.current) {
            return;
          }

          const existingTimeout = toastTimeouts.current.get(notification.id);
          if (existingTimeout) {
            window.clearTimeout(existingTimeout);
          }

          setToasts((current) => [...current.filter((item) => item.id !== notification.id), toastItem]);

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
