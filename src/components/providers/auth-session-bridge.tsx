"use client";

import type { Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import {
  markSessionSyncEnd,
  markSessionSyncStart,
  SESSION_EXPIRED_EVENT,
  SESSION_EXPIRED_STORAGE_KEY,
} from "@/lib/supabase/authenticated-fetch";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { syncSupabaseSessionToServer } from "@/lib/supabase/sync-session";

const AUTH_PATH_PREFIXES = ["/login", "/signup", "/forgot-password", "/reset-password"];

export function AuthSessionBridge() {
  const queryClient = useQueryClient();
  const router = useRouter();

  async function syncSession(session: Pick<Session, "access_token" | "refresh_token"> | null) {
    markSessionSyncStart();
    try {
      await syncSupabaseSessionToServer(session ?? null);
    } finally {
      markSessionSyncEnd();
    }
  }

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    supabase.auth.startAutoRefresh();

    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      await syncSession(session ?? null).catch(() => undefined);
      if (session) {
        queryClient.invalidateQueries({ queryKey: ["current-user"] });
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      void (async () => {
        if (event === "SIGNED_OUT" || !session) {
          queryClient.setQueryData(["current-user"], null);
          queryClient.setQueryData(["notifications"], []);
          await syncSession(null).catch(() => undefined);
          return;
        }

        await syncSession(session).catch(() => undefined);
        queryClient.invalidateQueries({ queryKey: ["current-user"] });
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        router.refresh();
      })();
    });

    return () => {
      subscription.unsubscribe();
      supabase.auth.stopAutoRefresh();
    };
  }, [queryClient, router]);

  useEffect(() => {
    const message = window.sessionStorage.getItem(SESSION_EXPIRED_STORAGE_KEY);
    if (!message) return;

    window.sessionStorage.removeItem(SESSION_EXPIRED_STORAGE_KEY);
    toast.error(message);
  }, []);

  useEffect(() => {
    function handleSessionExpired() {
      const pathname = window.location.pathname;
      const isAuthRoute = AUTH_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

      if (isAuthRoute) {
        return;
      }

      const redirectTarget = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      window.location.assign(`/login?redirect=${encodeURIComponent(redirectTarget)}`);
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    };
  }, []);

  return null;
}
