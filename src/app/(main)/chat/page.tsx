export default function ChatPage() {
  return (
    <div className="surface space-y-4 p-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold">Assistant moved to the floating panel</h1>
        <p className="text-sm text-muted-foreground">
          The Donorix Assistant now lives in the bottom-right corner so it stays available without taking over a full page.
        </p>
      </div>
      <p className="text-sm text-muted-foreground">
        Open the floating assistant from any main app page to continue the same session conversation.
      </p>
    </div>
  );
}
