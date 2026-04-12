import { AppShell } from "@/components/layout/root-layout";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
