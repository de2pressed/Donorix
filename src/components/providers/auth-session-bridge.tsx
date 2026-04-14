"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";

import { SESSION_EXPIRED_EVENT, SESSION_EXPIRED_STORAGE_KEY } from "@/lib/supabase/authenticated-fetch";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const AUTH_PATH_PREFIXES = ["/login", "/signup", "/forgot-password", "/reset-password"];

export function AuthSessionBridge() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    supabase.auth.startAutoRefresh();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        queryClient.setQueryData(["current-user"], null);
        queryClient.removeQueries({ queryKey: ["notifications"] });
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });

    return () => {
      subscription.unsubscribe();
      supabase.auth.stopAutoRefresh();
    };
  }, [queryClient]);

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
