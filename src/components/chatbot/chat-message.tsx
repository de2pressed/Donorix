export function ChatMessage({
  role,
  content,
}: {
  role: "assistant" | "user";
  content: string;
}) {
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
