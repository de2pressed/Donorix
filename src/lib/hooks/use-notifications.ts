"use client";

import { useQuery } from "@tanstack/react-query";

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await fetch("/api/notifications");
      if (!response.ok) throw new Error("Unable to fetch notifications");
      const payload = await response.json();
      return payload.notifications;
    },
  });
}
