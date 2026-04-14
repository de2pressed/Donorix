"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import { SESSION_EXPIRED_EVENT, SESSION_EXPIRED_STORAGE_KEY } from "@/lib/supabase/authenticated-fetch";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { syncSupabaseSessionToServer } from "@/lib/supabase/sync-session";

const AUTH_PATH_PREFIXES = ["/login", "/signup", "/forgot-password", "/reset-password"];

export function AuthSessionBridge() {
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    supabase.auth.startAutoRefresh();

    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      await syncSupabaseSessionToServer(session ?? null).catch(() => undefined);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void (async () => {
        await syncSupabaseSessionToServer(session ?? null).catch(() => undefined);

        if (!session) {
          queryClient.setQueryData(["current-user"], null);
          queryClient.removeQueries({ queryKey: ["notifications"] });
          router.refresh();
          return;
        }

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
