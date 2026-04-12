import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NewPostFab } from "@/components/layout/new-post-fab";
import { Sidebar } from "@/components/layout/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-[1440px] gap-6 px-4 py-6 lg:px-6">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col gap-4 pb-24 lg:pb-6">
        <Header />
        <main className="flex-1">{children}</main>
      </div>
      <MobileNav />
      <NewPostFab />
    </div>
  );
}
