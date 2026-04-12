"use client";

import { useQuery } from "@tanstack/react-query";

export function useUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const response = await fetch("/api/users/me");
      if (!response.ok) return null;
      return response.json();
    },
  });
}
