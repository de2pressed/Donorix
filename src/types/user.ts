import type { TableRow } from "@/types/database";

export type Profile = TableRow<"profiles">;
export type HospitalAccount = TableRow<"hospital_accounts">;
export type AccountType = Profile["account_type"];

export type ProfileStatus = Profile["status"];
