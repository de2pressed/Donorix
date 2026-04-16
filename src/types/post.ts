import type { TableRow } from "@/types/database";
import type { Profile } from "@/types/user";

export type Post = TableRow<"posts">;
export type DonorApplication = TableRow<"donor_applications">;
export type DonorApplicationWithDonor = DonorApplication & {
  donor: Pick<
    Profile,
    "id" | "full_name" | "username" | "blood_type" | "total_donations" | "karma" | "is_verified"
  > | null;
};

export type FeedPost = Post & {
  patient_id?: string | null;
  is_legacy?: boolean;
  is_demo?: boolean;
  has_voted?: boolean;
  creator?: Pick<Profile, "id" | "full_name" | "username" | "city" | "state" | "karma"> | null;
  approved_donor?: Pick<Profile, "id" | "full_name" | "phone"> | null;
};
