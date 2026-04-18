import type { TableRow } from "@/types/database";
import type { Profile } from "@/types/user";

export type ContactQuery = TableRow<"contact_queries">;

export type ContactQueryWithAuthor = ContactQuery & {
  author: Pick<Profile, "id" | "full_name" | "username" | "email" | "phone" | "account_type"> | null;
};
