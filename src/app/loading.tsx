import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-6xl items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl space-y-4 rounded-[1.75rem] border border-border bg-card/70 p-5 shadow-soft md:p-6">
        <Skeleton className="h-8 w-44 rounded-full" />
        <Skeleton className="h-5 w-2/3" />
        <div className="grid gap-3 pt-2 md:grid-cols-2">
          <Skeleton className="h-28 rounded-[1.5rem]" />
          <Skeleton className="h-28 rounded-[1.5rem]" />
        </div>
        <Skeleton className="h-12 w-40 rounded-full" />
      </div>
    </div>
  );
}
