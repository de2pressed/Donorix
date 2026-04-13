import type { TableRow } from "@/types/database";
import type { Profile } from "@/types/user";

export type Post = TableRow<"posts">;
export type DonorApplication = TableRow<"donor_applications">;

export type FeedPost = Post & {
  patient_id?: string | null;
  is_legacy?: boolean;
  is_demo?: boolean;
  creator?: Pick<Profile, "id" | "full_name" | "username" | "city" | "state" | "karma"> | null;
  approved_donor?: Pick<Profile, "id" | "full_name" | "phone"> | null;
};
