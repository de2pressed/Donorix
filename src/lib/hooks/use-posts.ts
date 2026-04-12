"use client";

import { useQuery } from "@tanstack/react-query";

export function usePosts() {
  return useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const response = await fetch("/api/posts");
      if (!response.ok) throw new Error("Unable to fetch posts");
      const payload = await response.json();
      return payload.posts;
    },
  });
}
