import { cn } from "@/lib/utils/cn";

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-2xl bg-[linear-gradient(110deg,hsl(var(--muted))_40%,hsl(var(--brand-soft))_50%,hsl(var(--muted))_60%)] bg-[length:200%_100%]",
        className,
      )}
    />
  );
}

export { Skeleton };
