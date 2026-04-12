import { AuthGuard } from "@/components/auth/auth-guard";

export async function AdminGuard({ children }: { children: React.ReactNode }) {
  return <AuthGuard adminOnly>{children}</AuthGuard>;
}
