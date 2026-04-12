import { subDays } from "date-fns";

import { adminUserIds } from "@/lib/env";
import { sortPostsByPriority } from "@/lib/utils/priority-score";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { FeedPost, Post } from "@/types/post";
import type { Notification } from "@/types/notification";
import type { Profile } from "@/types/user";

export async function getCurrentProfile() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select(
      "id, email, phone, full_name, username, avatar_url, blood_type, gender, date_of_birth, city, state, pincode, weight_kg, last_donated_at, total_donations, karma, is_admin, is_available, is_verified, has_chronic_disease, is_smoker, is_on_medication, preferred_language, consent_terms, consent_privacy, consent_notifications, status, timeout_until, deleted_at, created_at, updated_at",
    )
    .eq("id", user.id)
    .single();

  return (data as Profile | null) ?? null;
}

export async function getFeedPosts() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [] as FeedPost[];

  const { data } = await supabase
    .from("posts")
    .select(
      `
        id, created_by, patient_name, blood_type_needed, units_needed, hospital_name,
        hospital_address, city, state, latitude, longitude, contact_name, contact_phone,
        contact_email, medical_condition, additional_notes, is_emergency, required_by,
        initial_radius_km, current_radius_km, expires_at, status, priority_score,
        upvote_count, donor_count, approved_donor_id, sms_sent_count, created_at, updated_at
      `,
    )
    .in("status", ["active", "fulfilled"])
    .order("created_at", { ascending: false })
    .limit(20);

  return sortPostsByPriority((data as FeedPost[] | null) ?? []);
}

export async function getPostById(postId: string) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("posts")
    .select(
      `
        id, created_by, patient_name, blood_type_needed, units_needed, hospital_name,
        hospital_address, city, state, latitude, longitude, contact_name, contact_phone,
        contact_email, medical_condition, additional_notes, is_emergency, required_by,
        initial_radius_km, current_radius_km, expires_at, status, priority_score,
        upvote_count, donor_count, approved_donor_id, sms_sent_count, created_at, updated_at
      `,
    )
    .eq("id", postId)
    .single();

  return (data as Post | null) ?? null;
}

export async function getProfileByUsername(username: string) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("profiles")
    .select(
      "id, email, phone, full_name, username, avatar_url, blood_type, gender, date_of_birth, city, state, pincode, weight_kg, last_donated_at, total_donations, karma, is_admin, is_available, is_verified, has_chronic_disease, is_smoker, is_on_medication, preferred_language, consent_terms, consent_privacy, consent_notifications, status, timeout_until, deleted_at, created_at, updated_at",
    )
    .eq("username", username)
    .single();

  return (data as Profile | null) ?? null;
}

export async function getLeaderboard() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [] as Profile[];

  const { data } = await supabase
    .from("profiles")
    .select(
      "id, email, phone, full_name, username, avatar_url, blood_type, gender, date_of_birth, city, state, pincode, weight_kg, last_donated_at, total_donations, karma, is_admin, is_available, is_verified, has_chronic_disease, is_smoker, is_on_medication, preferred_language, consent_terms, consent_privacy, consent_notifications, status, timeout_until, deleted_at, created_at, updated_at",
    )
    .eq("status", "active")
    .order("karma", { ascending: false })
    .limit(100);

  return (data as Profile[] | null) ?? [];
}

export async function getNotifications(userId?: string) {
  const supabase = await createServerSupabaseClient();
  if (!supabase || !userId) return [] as Notification[];

  const { data } = await supabase
    .from("notifications")
    .select("id, user_id, type, title, body, data, post_id, read_at, sms_sent, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(30);

  return (data as Notification[] | null) ?? [];
}

export async function getRecentDonations(userId: string) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("donations")
    .select("id, donor_id, recipient_id, post_id, donated_at, units, hospital_name, city, created_at")
    .eq("donor_id", userId)
    .gte("donated_at", subDays(new Date(), 365).toISOString())
    .order("donated_at", { ascending: false })
    .limit(10);

  return data ?? [];
}

export async function getAdminDashboard() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      stats: {
        totalUsers: 0,
        activePosts: 0,
        donationsToday: 0,
        smsSentToday: 0,
      },
      actions: [],
      health: [
        { label: "Supabase", status: "Configuration required" },
        { label: "SMS edge function", status: "Awaiting deploy" },
        { label: "Realtime", status: "Awaiting configuration" },
      ],
    };
  }

  const [{ count: totalUsers }, { count: activePosts }, { count: donationsToday }, { count: smsSentToday }] =
    await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("posts").select("id", { count: "exact", head: true }).eq("status", "active"),
      supabase
        .from("donations")
        .select("id", { count: "exact", head: true })
        .gte("donated_at", subDays(new Date(), 1).toISOString()),
      supabase
        .from("sms_log")
        .select("id", { count: "exact", head: true })
        .gte("created_at", subDays(new Date(), 1).toISOString()),
    ]);

  const { data: actions } = await supabase
    .from("admin_actions")
    .select("id, admin_id, action, target_type, target_id, reason, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  return {
    stats: {
      totalUsers: totalUsers ?? 0,
      activePosts: activePosts ?? 0,
      donationsToday: donationsToday ?? 0,
      smsSentToday: smsSentToday ?? 0,
    },
    actions: actions ?? [],
    health: [
      { label: "Supabase", status: "Connected" },
      { label: "Admin users", status: adminUserIds.length ? "Seeded" : "Pending seed" },
      { label: "Realtime", status: "Enabled at table level" },
    ],
  };
}
