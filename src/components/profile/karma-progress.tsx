import { Progress } from "@/components/ui/progress";
import { calculateKarmaProgress } from "@/lib/utils/karma";

export function KarmaProgress({ karma }: { karma: number }) {
  const { current, next, progress } = calculateKarmaProgress(karma);

  return (
    <div className="space-y-2 rounded-[1.5rem] border border-border p-4">
      <div className="flex items-center justify-between text-sm">
        <span>{current.label}</span>
        <span className="text-muted-foreground">{next ? `Next: ${next.label}` : "Max rank reached"}</span>
      </div>
      <Progress value={progress} />
    </div>
  );
}
