"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

export function useInfinitePosts() {
  return useInfiniteQuery({
    queryKey: ["posts", "infinite"],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const response = await fetch(`/api/posts?page=${pageParam}`);
      if (!response.ok) throw new Error("Unable to fetch posts");
      return response.json();
    },
    getNextPageParam: (lastPage) => (lastPage.nextPage ?? null),
  });
}
