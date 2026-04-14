"use client";

import { useQuery } from "@tanstack/react-query";

import { authenticatedFetch } from "@/lib/supabase/authenticated-fetch";
import type { Notification } from "@/types/notification";

export function useNotifications({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery<Notification[]>({
    enabled,
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/notifications");
      if (response.status === 401) {
        return [];
      }
      if (!response.ok) throw new Error("Unable to fetch notifications");
      const payload = await response.json();
      return payload.notifications as Notification[];
    },
  });
}
