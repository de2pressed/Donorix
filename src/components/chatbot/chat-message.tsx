import { format } from "date-fns";

import { cn } from "@/lib/utils/cn";

export function ChatMessage({
  role,
  content,
  createdAt,
}: {
  role: "assistant" | "user" | "system";
  content: string;
  createdAt?: string;
}) {
  if (role === "system") {
    return (
      <div className="mx-auto max-w-full rounded-full border border-border bg-surface-3/60 px-4 py-2 text-center text-xs leading-relaxed text-content-secondary break-words whitespace-pre-wrap">
        {content}
      </div>
    );
  }

  const formattedTime = createdAt ? format(new Date(createdAt), "p") : null;

  return (
    <div className="group relative flex w-full">
      <div
        className={cn(
          "min-w-0 max-w-[86%] rounded-2xl rounded-br-sm px-3 py-2 text-sm leading-relaxed shadow-sm break-words whitespace-pre-wrap",
          role === "assistant"
            ? "max-w-[88%] rounded-bl-sm glass-panel text-content-primary"
            : "ml-auto bg-red-600 text-white",
        )}
      >
        {content}
      </div>
      {formattedTime ? (
        <span className="absolute -bottom-4 right-0 whitespace-nowrap text-[10px] text-content-secondary opacity-0 transition-opacity duration-150 group-hover:opacity-60">
          {formattedTime}
        </span>
      ) : null}
    </div>
  );
}
