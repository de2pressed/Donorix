import Link from "next/link";
import { Plus } from "lucide-react";

export function NewPostFab() {
  return (
    <Link
      aria-label="Create new blood request"
      href="/posts/new"
      className="fixed bottom-24 right-4 z-40 flex size-14 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-glow lg:hidden"
    >
      <Plus className="size-5" />
    </Link>
  );
}
