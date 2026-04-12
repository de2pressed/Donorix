import type { TableRow } from "@/types/database";

export type Profile = TableRow<"profiles">;

export type ProfileStatus = Profile["status"];
