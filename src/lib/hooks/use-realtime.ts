"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function useRealtime(userId?: string, postId?: string) {
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const subscriptions = [
      supabase
        .channel("public:posts")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "posts", filter: "status=eq.active" },
          () => toast.info("New blood request posted"),
        )
        .subscribe(),
    ];

    if (userId) {
      subscriptions.push(
        supabase
          .channel(`notifications:${userId}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "notifications",
              filter: `user_id=eq.${userId}`,
            },
            () => toast.info("New notification received"),
          )
          .subscribe(),
      );
    }

    if (postId) {
      subscriptions.push(
        supabase
          .channel(`post:${postId}`)
          .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "posts", filter: `id=eq.${postId}` },
            () => toast.info("Post updated"),
          )
          .subscribe(),
      );
    }

    return () => {
      subscriptions.forEach((channel) => {
        void supabase.removeChannel(channel);
      });
    };
  }, [postId, userId]);
}
