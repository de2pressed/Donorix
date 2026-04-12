import Link from "next/link";
import { Award, Bell, FileText, HeartHandshake, Home, MessageSquareHeart, PlusSquare } from "lucide-react";

import { MAIN_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";

const icons = [Home, Award, PlusSquare, Bell, MessageSquareHeart, FileText];

export function Sidebar() {
  return (
    <aside className="glass sticky top-6 hidden h-[calc(100vh-3rem)] w-72 flex-col justify-between p-5 lg:flex">
      <div className="space-y-8">
        <div className="space-y-3">
          <Badge className="w-fit" variant="danger">
            India-first blood matching
          </Badge>
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-glow">
              <HeartHandshake className="size-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Donorix</h1>
              <p className="text-sm text-muted-foreground">Urgent care starts with faster matching.</p>
            </div>
          </div>
        </div>
        <nav className="space-y-2">
          {MAIN_NAV.map((item, index) => {
            const Icon = icons[index];
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-brand-soft hover:text-brand",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="rounded-[1.5rem] border border-border bg-card/60 p-4">
        <p className="text-sm font-medium">Emergency routing enabled</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Requests marked emergency receive priority scoring, contact unlock, and expanded notification reach.
        </p>
      </div>
    </aside>
  );
}
