import { startOfMonth, subDays } from "date-fns";

import { adminUserIds } from "@/lib/env";
import { HOSPITAL_ACCOUNT_SELECT, PROFILE_SELECT } from "@/lib/http";
import { estimateDistanceKm } from "@/lib/utils/distance";
import { sortPostsByPriority } from "@/lib/utils/priority-score";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { TableRow } from "@/types/database";
import type { Notification } from "@/types/notification";
import type { DonorApplicationWithDonor, FeedPost, Post } from "@/types/post";
import type { HospitalAccount, Profile } from "@/types/user";

type AdminAction = TableRow<"admin_actions">;
type ServerSupabaseClient = Awaited<ReturnType<typeof createServerSupabaseClient>>;
type CreatorSummary = Pick<Profile, "id" | "full_name" | "username" | "city" | "state" | "karma">;

export type AdminUserApplication = TableRow<"donor_applications"> & {
  post: Pick<Post, "id" | "patient_name" | "patient_id" | "blood_type_needed" | "city" | "status"> | null;
};

export type AdminUserDetail = {
  profile: Profile | null;
  hospitalAccount: HospitalAccount | null;
  posts: Post[];
  applications: AdminUserApplication[];
  actions: AdminAction[];
};

type AdminPostRecord = Post & {
  creator: Pick<Profile, "id" | "full_name" | "username" | "email"> | null;
};

export type AdminPostDetail = {
  post: AdminPostRecord | null;
  applications: DonorApplicationWithDonor[];
  actions: AdminAction[];
};

type DonorSummary = Pick<
  Profile,
  "id" | "full_name" | "username" | "blood_type" | "total_donations" | "karma" | "is_verified" | "city" | "state"
>;

async function getCreatorMap(supabase: ServerSupabaseClient, creatorIds: string[]) {
  if (!supabase || !creatorIds.length) {
    return new Map<string, CreatorSummary>();
  }

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, username, city, state, karma")
    .in("id", creatorIds);

  return new Map(((data ?? []) as CreatorSummary[]).map((creator) => [creator.id, creator]));
}

export async function getCurrentProfile() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", user.id)
    .single();

  return (data as Profile | null) ?? null;
}

export async function getFeedPosts(userId?: string) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [] as FeedPost[];

  const { data } = await supabase
    .from("posts")
    .select(
      `
        id, created_by, patient_name, blood_type_needed, units_needed, hospital_name,
        patient_id,
        hospital_address, city, state, latitude, longitude, contact_name, contact_phone,
        contact_email, medical_condition, additional_notes, is_emergency, required_by,
        initial_radius_km, current_radius_km, expires_at, status, priority_score,
        upvote_count, donor_count, approved_donor_id, sms_sent_count, is_legacy, is_demo, created_at, updated_at
      `,
    )
    .in("status", ["active", "fulfilled"])
    .order("created_at", { ascending: false })
    .limit(20);

  const posts = (data as FeedPost[] | null) ?? [];
  const postIds = posts.map((post) => post.id);
  const creatorMap = await getCreatorMap(supabase, posts.map((post) => post.created_by));
  const countClient = getSupabaseAdminClient() ?? supabase;
  let donorCountMap = new Map<string, number>();

  if (postIds.length && countClient) {
    const { data: applicationRows } = await countClient
      .from("donor_applications")
      .select("post_id")
      .in("post_id", postIds);

    donorCountMap = new Map();
    for (const row of applicationRows ?? []) {
      donorCountMap.set(row.post_id, (donorCountMap.get(row.post_id) ?? 0) + 1);
    }
  }

  const postsWithCounts = posts.map((post) => ({
    ...post,
    donor_count: donorCountMap.get(post.id) ?? post.donor_count ?? 0,
    creator: creatorMap.get(post.created_by) ?? null,
  }));

  if (!userId || !postsWithCounts.length) {
    return sortPostsByPriority(postsWithCounts);
  }

  const { data: votes } = await supabase
    .from("upvotes")
    .select("post_id")
    .eq("user_id", userId)
    .in("post_id", postIds);

  const votedSet = new Set((votes ?? []).map((vote) => vote.post_id));

  return sortPostsByPriority(
    postsWithCounts.map((post) => ({
      ...post,
      has_voted: votedSet.has(post.id),
    })),
  );
}

export async function getPostById(postId: string, userId?: string) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("posts")
    .select(
      `
        id, created_by, patient_name, blood_type_needed, units_needed, hospital_name,
        patient_id,
        hospital_address, city, state, latitude, longitude, contact_name, contact_phone,
        contact_email, medical_condition, additional_notes, is_emergency, required_by,
        initial_radius_km, current_radius_km, expires_at, status, priority_score,
        upvote_count, donor_count, approved_donor_id, sms_sent_count, is_legacy, is_demo, created_at, updated_at
      `,
    )
    .eq("id", postId)
    .single();

  const post = (data as FeedPost | null) ?? null;

  const creatorMap = await getCreatorMap(supabase, post ? [post.created_by] : []);
  const postWithCreator = post
    ? {
        ...post,
        creator: creatorMap.get(post.created_by) ?? null,
      }
    : null;

  if (!postWithCreator || !userId) {
    return postWithCreator;
  }

  const { data: vote } = await supabase
    .from("upvotes")
    .select("post_id")
    .eq("user_id", userId)
    .eq("post_id", postId)
    .maybeSingle();

  return {
    ...postWithCreator,
    has_voted: Boolean(vote),
  };
}

export async function getDonorApplicationsForPost(postId: string) {
  const supabase = getSupabaseAdminClient() ?? (await createServerSupabaseClient());
  if (!supabase) return [] as DonorApplicationWithDonor[];

  const { data: post } = await supabase
    .from("posts")
    .select("id, city, state")
    .eq("id", postId)
    .maybeSingle();

  const { data: applications, error } = await supabase
    .from("donor_applications")
    .select("id, post_id, donor_id, status, eligibility_score, distance_km, note, created_at, updated_at")
    .eq("post_id", postId)
    .order("eligibility_score", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return [] as DonorApplicationWithDonor[];
  }

  const donorIds = [...new Set((applications ?? []).map((application) => application.donor_id))];
  const donorLookup =
    donorIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name, username, blood_type, total_donations, karma, is_verified, city, state")
          .in("id", donorIds)
      : { data: [] };

  const donorMap = new Map(
    ((donorLookup.data ?? []) as DonorSummary[]).map((donor) => [
      donor.id,
      donor,
    ]),
  );

  return ((applications ?? []) as TableRow<"donor_applications">[]).map((application) => ({
    ...application,
    distance_km:
      application.distance_km ??
      estimateDistanceKm(
        donorMap.get(application.donor_id)?.city,
        donorMap.get(application.donor_id)?.state,
        post?.city,
        post?.state,
      ),
    donor: donorMap.get(application.donor_id) ?? null,
  }));
}

export async function getProfileByUsername(username: string) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("username", username)
    .single();

  return (data as Profile | null) ?? null;
}

export async function getLeaderboard() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [] as Profile[];

  const { data } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("status", "active")
    .eq("account_type", "donor")
    .eq("is_discoverable", true)
    .eq("hide_from_leaderboard", false)
    .order("karma", { ascending: false })
    .limit(100);

  return (data as Profile[] | null) ?? [];
}

export async function getAdminUsers() {
  const supabase = getSupabaseAdminClient() ?? (await createServerSupabaseClient());
  if (!supabase) return [] as Profile[];

  const { data } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .order("created_at", { ascending: false })
    .limit(200);

  return (data as Profile[] | null) ?? [];
}

export async function getAdminPosts() {
  const supabase = getSupabaseAdminClient() ?? (await createServerSupabaseClient());
  if (!supabase) return [] as FeedPost[];

  const { data } = await supabase
    .from("posts")
    .select(
      `
        id, created_by, patient_name, blood_type_needed, units_needed, hospital_name,
        patient_id,
        hospital_address, city, state, latitude, longitude, contact_name, contact_phone,
        contact_email, medical_condition, additional_notes, is_emergency, required_by,
        initial_radius_km, current_radius_km, expires_at, status, priority_score,
        upvote_count, donor_count, approved_donor_id, sms_sent_count, is_legacy, is_demo, created_at, updated_at
      `,
    )
    .order("created_at", { ascending: false })
    .limit(200);

  return (data as FeedPost[] | null) ?? [];
}

export async function getHospitalAccountByProfileId(profileId: string) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("hospital_accounts")
    .select(HOSPITAL_ACCOUNT_SELECT)
    .eq("profile_id", profileId)
    .maybeSingle();

  return (data as HospitalAccount | null) ?? null;
}

export async function getHospitalPosts(profileId: string, sortBy: "patient_name" | "patient_id" = "patient_name") {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [] as Post[];

  const { data } = await supabase
    .from("posts")
    .select(
      `
        id, created_by, patient_name, patient_id, blood_type_needed, units_needed, hospital_name,
        hospital_address, city, state, latitude, longitude, contact_name, contact_phone,
        contact_email, medical_condition, additional_notes, is_emergency, required_by,
        initial_radius_km, current_radius_km, expires_at, status, priority_score,
        upvote_count, donor_count, approved_donor_id, sms_sent_count, is_legacy, is_demo, created_at, updated_at
      `,
    )
    .eq("created_by", profileId)
    .order(sortBy, { ascending: true })
    .order("created_at", { ascending: false });

  const posts = (data as Post[] | null) ?? [];
  const postIds = posts.map((post) => post.id);
  const countClient = getSupabaseAdminClient() ?? supabase;
  let donorCountMap = new Map<string, number>();

  if (postIds.length && countClient) {
    const { data: applicationRows } = await countClient
      .from("donor_applications")
      .select("post_id")
      .in("post_id", postIds);

    donorCountMap = new Map();
    for (const row of applicationRows ?? []) {
      donorCountMap.set(row.post_id, (donorCountMap.get(row.post_id) ?? 0) + 1);
    }
  }

  return posts.map((post) => ({
    ...post,
    donor_count: donorCountMap.get(post.id) ?? post.donor_count ?? 0,
  }));
}

export async function getHospitalDashboard(profileId: string) {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      stats: {
        activeRequests: 0,
        pendingApplications: 0,
        fulfilledThisMonth: 0,
      },
      posts: [] as Post[],
      applicants: [] as Array<{
        id: string;
        post_id: string;
        donor_id: string;
        status: string;
        eligibility_score: number;
        distance_km: number | null;
        note: string | null;
        created_at: string;
        updated_at: string;
        donor: Pick<Profile, "id" | "full_name" | "username" | "blood_type" | "city" | "state" | "karma"> | null;
        post: Pick<Post, "id" | "patient_name" | "patient_id" | "blood_type_needed" | "status"> | null;
      }>,
    };
  }

  const posts = await getHospitalPosts(profileId);
  const postIds = posts.map((post) => post.id);
  const monthStart = startOfMonth(new Date()).toISOString();

  const pendingApplicationsPromise = postIds.length
    ? supabase
        .from("donor_applications")
        .select("id", { count: "exact", head: true })
        .in("post_id", postIds)
        .eq("status", "pending")
    : Promise.resolve({ count: 0 } as { count: number | null });

  const fulfilledThisMonthPromise = supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("created_by", profileId)
    .eq("status", "fulfilled")
    .gte("updated_at", monthStart);

  const donorApplicationsPromise = postIds.length
    ? supabase
        .from("donor_applications")
        .select("id, post_id, donor_id, status, eligibility_score, distance_km, note, created_at, updated_at")
        .in("post_id", postIds)
        .order("created_at", { ascending: false })
        .limit(20)
    : Promise.resolve({ data: [] } as { data: [] });

  const [{ count: pendingApplications }, { count: fulfilledThisMonth }, { data: donorApplications }] =
    await Promise.all([pendingApplicationsPromise, fulfilledThisMonthPromise, donorApplicationsPromise]);

  const donorIds = [...new Set((donorApplications ?? []).map((application) => application.donor_id))];
  const donorLookup =
    donorIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name, username, blood_type, city, state, karma")
          .in("id", donorIds)
      : { data: [] };

  const donorMap = new Map((donorLookup.data ?? []).map((donor) => [donor.id, donor]));
  const postMap = new Map(posts.map((post) => [post.id, post]));

  return {
    stats: {
      activeRequests: posts.filter((post) => post.status === "active").length,
      pendingApplications: pendingApplications ?? 0,
      fulfilledThisMonth: fulfilledThisMonth ?? 0,
    },
    posts,
    applicants: (donorApplications ?? []).map((application) => ({
      ...application,
      distance_km:
        application.distance_km ??
        estimateDistanceKm(
          donorMap.get(application.donor_id)?.city,
          donorMap.get(application.donor_id)?.state,
          postMap.get(application.post_id)?.city,
          postMap.get(application.post_id)?.state,
        ),
      donor: donorMap.get(application.donor_id) ?? null,
      post: postMap.get(application.post_id)
        ? {
            id: postMap.get(application.post_id)!.id,
            patient_name: postMap.get(application.post_id)!.patient_name,
            patient_id: postMap.get(application.post_id)!.patient_id,
            blood_type_needed: postMap.get(application.post_id)!.blood_type_needed,
            status: postMap.get(application.post_id)!.status,
          }
        : null,
    })),
  };
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

export async function getAdminUserDetail(userId: string): Promise<AdminUserDetail> {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return {
      profile: null,
      hospitalAccount: null,
      posts: [],
      applications: [],
      actions: [],
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", userId)
    .maybeSingle();

  const { data: hospitalAccount } = await supabase
    .from("hospital_accounts")
    .select(HOSPITAL_ACCOUNT_SELECT)
    .eq("profile_id", userId)
    .maybeSingle();

  const { data: posts } = await supabase
    .from("posts")
    .select(
      `
        id, created_by, patient_name, patient_id, blood_type_needed, units_needed, hospital_name,
        hospital_address, city, state, latitude, longitude, contact_name, contact_phone,
        contact_email, medical_condition, additional_notes, is_emergency, required_by,
        initial_radius_km, current_radius_km, expires_at, status, priority_score,
        upvote_count, donor_count, approved_donor_id, sms_sent_count, is_legacy, is_demo, created_at, updated_at
      `,
    )
    .eq("created_by", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: applicationRows } = await supabase
    .from("donor_applications")
    .select("id, post_id, donor_id, status, eligibility_score, distance_km, note, created_at, updated_at")
    .eq("donor_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  const applicationPostIds = [...new Set((applicationRows ?? []).map((application) => application.post_id))];
  const applicationPosts =
    applicationPostIds.length > 0
      ? await supabase
          .from("posts")
          .select("id, patient_name, patient_id, blood_type_needed, city, status")
          .in("id", applicationPostIds)
      : { data: [] };

  const postLookup = new Map((applicationPosts.data ?? []).map((post) => [post.id, post]));

  const { data: actions } = await supabase
    .from("admin_actions")
    .select("id, admin_id, action, target_type, target_id, reason, metadata, created_at")
    .eq("target_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  return {
    profile: (profile as Profile | null) ?? null,
    hospitalAccount: (hospitalAccount as HospitalAccount | null) ?? null,
    posts: (posts as Post[] | null) ?? [],
    applications: ((applicationRows ?? []) as TableRow<"donor_applications">[]).map((application) => ({
      ...application,
      post: (postLookup.get(application.post_id) as AdminUserApplication["post"]) ?? null,
    })),
    actions: (actions as AdminAction[] | null) ?? [],
  };
}

export async function getAdminPostDetail(postId: string): Promise<AdminPostDetail> {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return {
      post: null,
      applications: [],
      actions: [],
    };
  }

  const { data: post } = await supabase
    .from("posts")
    .select(
      `
        id, created_by, patient_name, patient_id, blood_type_needed, units_needed, hospital_name,
        hospital_address, city, state, latitude, longitude, contact_name, contact_phone,
        contact_email, medical_condition, additional_notes, is_emergency, required_by,
        initial_radius_km, current_radius_km, expires_at, status, priority_score,
        upvote_count, donor_count, approved_donor_id, sms_sent_count, is_legacy, is_demo, created_at, updated_at
      `,
    )
    .eq("id", postId)
    .maybeSingle();

  const creatorId = post?.created_by;
  const { data: creator } = creatorId
    ? await supabase
        .from("profiles")
        .select("id, full_name, username, email")
        .eq("id", creatorId)
        .maybeSingle()
    : { data: null };

  const applications = await getDonorApplicationsForPost(postId);

  const { data: actions } = await supabase
    .from("admin_actions")
    .select("id, admin_id, action, target_type, target_id, reason, metadata, created_at")
    .eq("target_id", postId)
    .order("created_at", { ascending: false })
    .limit(10);

  return {
    post: post ? ({ ...post, creator: (creator as AdminPostRecord["creator"]) ?? null } as AdminPostRecord) : null,
    applications,
    actions: (actions as AdminAction[] | null) ?? [],
  };
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
