import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="w-full space-y-6">
      <div className="mx-auto max-w-xl space-y-3 text-center">
        <Skeleton className="mx-auto h-4 w-32 rounded-full" />
        <Skeleton className="mx-auto h-10 w-4/5 rounded-full" />
        <Skeleton className="mx-auto h-5 w-11/12 rounded-full" />
      </div>

      <div className="mx-auto grid max-w-4xl gap-3 md:grid-cols-2">
        <Skeleton className="h-24 rounded-[1.75rem] border border-border/60 bg-card/70" />
        <Skeleton className="h-24 rounded-[1.75rem] border border-border/60 bg-card/70" />
      </div>

      <div className="mx-auto w-full max-w-lg rounded-[1.8rem] border border-border bg-card/70 p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-40 rounded-full" />
          <Skeleton className="h-5 w-3/4 rounded-full" />
          <div className="space-y-3 pt-2">
            <Skeleton className="h-11 w-full rounded-2xl" />
            <Skeleton className="h-11 w-full rounded-2xl" />
            <Skeleton className="h-11 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-11 w-full rounded-full" />
          <Skeleton className="h-24 w-full rounded-[1.5rem]" />
        </div>
      </div>
    </div>
  );
}
