import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-6">
        <div className="rounded-[1.75rem] border border-border bg-card/70 p-5 shadow-soft">
          <div className="space-y-5">
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-7 w-28 rounded-full" />
              <Skeleton className="h-7 w-28 rounded-full" />
            </div>
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-5 w-4/5" />
            <div className="grid gap-3 md:grid-cols-3">
              <Skeleton className="h-24 rounded-[1.5rem]" />
              <Skeleton className="h-24 rounded-[1.5rem]" />
              <Skeleton className="h-24 rounded-[1.5rem]" />
            </div>
            <Skeleton className="h-24 rounded-[1.5rem]" />
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-6 w-40" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-24 rounded-full" />
                <Skeleton className="h-10 w-28 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Skeleton className="h-[28rem] rounded-[1.75rem]" />
    </div>
  );
}
