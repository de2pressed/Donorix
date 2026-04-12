import Link from "next/link";

import { POLICY_NAV } from "@/lib/constants";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function PoliciesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 lg:flex-row lg:px-6">
      <aside className="surface lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-80">
        <div className="space-y-3 p-6">
          <h1 className="text-2xl font-semibold">Policies</h1>
          <p className="text-sm text-muted-foreground">
            The legal, consent, privacy, and misuse controls that govern Donorix.
          </p>
        </div>
        <ScrollArea className="h-[420px] px-2 pb-4 lg:h-[calc(100%-120px)]">
          <nav className="space-y-1 px-3">
            {POLICY_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-2xl px-4 py-3 text-sm text-muted-foreground transition hover:bg-brand-soft hover:text-brand"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </ScrollArea>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
