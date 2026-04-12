import { ChatWindow } from "@/components/chatbot/chat-window";

export default function ChatPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold">AI blood assistant</h1>
        <p className="text-sm text-muted-foreground">
          Ask about eligibility, create a request conversationally, or find matching donations by blood type.
        </p>
      </div>
      <ChatWindow />
    </div>
  );
}
