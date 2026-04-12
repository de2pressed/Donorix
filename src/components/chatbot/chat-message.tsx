export function ChatMessage({
  role,
  content,
}: {
  role: "assistant" | "user" | "system";
  content: string;
}) {
  if (role === "system") {
    return (
      <div className="mx-auto max-w-[92%] rounded-full border border-border bg-muted/70 px-4 py-2 text-center text-xs text-muted-foreground">
        {content}
      </div>
    );
  }

  return (
    <div
      className={`max-w-[85%] rounded-[1.5rem] px-4 py-3 text-sm ${
        role === "assistant"
          ? "bg-card text-foreground"
          : "ml-auto bg-brand text-brand-foreground"
      }`}
    >
      {content}
    </div>
  );
}
