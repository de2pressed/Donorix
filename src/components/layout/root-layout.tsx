import { Header } from "@/components/layout/header";
import { FloatingAssistant } from "@/components/layout/floating-assistant";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NewPostFab } from "@/components/layout/new-post-fab";
import { RightRail } from "@/components/layout/right-rail";
import { Sidebar } from "@/components/layout/sidebar";

export async function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-[1400px] overflow-x-hidden px-4 pb-[calc(env(safe-area-inset-bottom)+6rem)] pt-4 lg:px-6 lg:pb-6">
      <div className="flex min-h-screen gap-6 xl:grid xl:grid-cols-[250px_minmax(0,760px)_320px]">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <Header />
          <main className="min-w-0 pt-4">{children}</main>
        </div>
        <RightRail />
      </div>
      <MobileNav />
      <NewPostFab />
      <FloatingAssistant />
    </div>
  );
}
