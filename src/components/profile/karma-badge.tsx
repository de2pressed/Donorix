import { Sparkles } from "lucide-react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getKarmaRank, KARMA_BREAKDOWN } from "@/lib/utils/karma";

export function KarmaBadge({ karma }: { karma: number }) {
  const rank = getKarmaRank(karma);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold">
            <Sparkles className="size-4 text-brand" />
            {rank.label} • {karma}
          </div>
        </TooltipTrigger>
        <TooltipContent>{KARMA_BREAKDOWN}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
