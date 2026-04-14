"use client";

import type { User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { authenticatedFetch } from "@/lib/supabase/authenticated-fetch";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/user";

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function buildProfileFallback(user: User): Profile {
  const metadata = user.user_metadata as Record<string, unknown> | undefined;
  const emailPrefix = user.email?.split("@")[0]?.trim() || "donorix";
  const username =
    typeof metadata?.username === "string" && metadata.username.trim().length >= 3
      ? metadata.username.trim()
      : emailPrefix.toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 30) || `user_${user.id.slice(0, 8)}`;
  const fullName =
    typeof metadata?.full_name === "string" && metadata.full_name.trim()
      ? metadata.full_name.trim()
      : emailPrefix;

  return {
    id: user.id,
    email: user.email ?? "",
    phone: typeof metadata?.phone === "string" ? metadata.phone : "",
    full_name: fullName,
    username,
    avatar_url: typeof metadata?.avatar_url === "string" ? metadata.avatar_url : null,
    account_type: metadata?.account_type === "hospital" ? "hospital" : "donor",
    blood_type: typeof metadata?.blood_type === "string" ? metadata.blood_type : null,
    gender: typeof metadata?.gender === "string" ? metadata.gender : "prefer_not_to_say",
    date_of_birth: typeof metadata?.date_of_birth === "string" ? metadata.date_of_birth : null,
    city: typeof metadata?.city === "string" ? metadata.city : "",
    state: typeof metadata?.state === "string" ? metadata.state : "",
    pincode: typeof metadata?.pincode === "string" ? metadata.pincode : "",
    weight_kg: typeof metadata?.weight_kg === "number" ? metadata.weight_kg : null,
    last_donated_at: null,
    total_donations: 0,
    karma: 0,
    is_admin: false,
    is_available: true,
    is_verified: false,
    has_chronic_disease: typeof metadata?.has_chronic_disease === "boolean" ? metadata.has_chronic_disease : false,
    is_smoker: typeof metadata?.is_smoker === "boolean" ? metadata.is_smoker : false,
    is_on_medication: typeof metadata?.is_on_medication === "boolean" ? metadata.is_on_medication : false,
    allow_sms_alerts: false,
    allow_email_alerts: true,
    is_discoverable: true,
    allow_emergency_direct_contact: false,
    hide_from_leaderboard: false,
    notification_radius_km: 25,
    preferred_language:
      typeof metadata?.preferred_language === "string" ? metadata.preferred_language : "en",
    consent_terms: typeof metadata?.consent_terms === "boolean" ? metadata.consent_terms : false,
    consent_privacy:
      typeof metadata?.consent_privacy === "boolean" ? metadata.consent_privacy : false,
    consent_notifications:
      typeof metadata?.consent_notifications === "boolean" ? metadata.consent_notifications : true,
    status: "active",
    timeout_until: null,
    deleted_at: null,
    is_demo: false,
    created_at: user.created_at,
    updated_at: user.updated_at ?? user.created_at,
  };
}

export function useUser() {
  const queryClient = useQueryClient();
  const [sessionFallback, setSessionFallback] = useState<Profile | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSessionFallback(session?.user ? buildProfileFallback(session.user) : null);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionFallback(session?.user ? buildProfileFallback(session.user) : null);
      void queryClient.invalidateQueries({ queryKey: ["current-user"] });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const query = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return null;

      for (const delay of [0, 250, 750]) {
        if (delay > 0) {
          await wait(delay);
        }

        const response = await authenticatedFetch("/api/users/me", {
          cache: "no-store",
          redirectOnAuthFailure: false,
        });
        if (response.ok) {
          return (await response.json()) as Profile;
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        return buildProfileFallback(session.user);
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      return user ? buildProfileFallback(user) : null;
    },
    staleTime: 0,
  });

  return {
    ...query,
    data: query.data ?? sessionFallback,
    isLoading: query.isLoading && !sessionFallback,
  };
}
