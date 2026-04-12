import { AdminGuard } from "@/components/admin/admin-guard";
import { AppShell } from "@/components/layout/root-layout";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AppShell>{children}</AppShell>
    </AdminGuard>
  );
}
