import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/data";

export async function AuthGuard({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (adminOnly && !profile.is_admin) {
    redirect("/");
  }

  return <>{children}</>;
}
