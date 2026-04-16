import { Header } from "@/components/layout/header";
import { FloatingAssistant } from "@/components/layout/floating-assistant";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NewPostFab } from "@/components/layout/new-post-fab";
import { RightRail } from "@/components/layout/right-rail";
import { Sidebar } from "@/components/layout/sidebar";

export async function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-grid-red mx-auto min-h-screen w-full max-w-[1900px] px-4 pb-[calc(env(safe-area-inset-bottom)+6rem)] pt-4 lg:px-8 lg:pb-8 2xl:px-10">
      <div className="grid min-h-screen gap-6 xl:grid-cols-[16rem_minmax(0,1fr)_20rem]">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <Header />
          <main className="min-w-0 pt-10 md:pt-12">{children}</main>
        </div>
        <RightRail />
      </div>
      <MobileNav />
      <NewPostFab />
      <FloatingAssistant />
    </div>
  );
}
