import { Header } from "@/components/layout/header";
import { RightRail } from "@/components/layout/right-rail";
import { Sidebar } from "@/components/layout/sidebar";

export async function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-[1760px] px-3 pb-6 pt-4 sm:px-4 lg:px-6 lg:pb-10 2xl:px-10">
      <div className="grid min-h-screen gap-4 min-[1100px]:gap-5 xl:gap-6 min-[1100px]:grid-cols-[14.25rem_minmax(0,1fr)] xl:grid-cols-[15.5rem_minmax(0,1fr)_18rem] 2xl:grid-cols-[16.25rem_minmax(0,1fr)_20rem]">
        <Sidebar />
        <div className="min-w-0 w-full">
          <div className="flex min-h-screen w-full flex-col">
            <Header />
            <main className="min-w-0 overflow-x-clip pb-[calc(env(safe-area-inset-bottom)+6rem)] pt-8 md:pt-10 lg:pb-16">
              {children}
            </main>
          </div>
        </div>
        <RightRail />
      </div>
    </div>
  );
}
