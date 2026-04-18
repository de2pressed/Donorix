import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-border bg-card/70 p-5 shadow-soft md:p-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-56 rounded-full" />
          <Skeleton className="h-5 w-2/3" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-28 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Skeleton className="h-40 rounded-[1.5rem]" />
            <Skeleton className="h-40 rounded-[1.5rem]" />
            <Skeleton className="h-40 rounded-[1.5rem] max-md:hidden xl:block" />
          </div>
          <Skeleton className="h-64 rounded-[1.75rem]" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-3 rounded-[1.75rem] border border-border bg-card/70 p-5 shadow-soft">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-12 w-2/3 rounded-2xl" />
          </div>
          <Skeleton className="h-48 rounded-[1.75rem]" />
        </div>
      </div>
    </div>
  );
}
