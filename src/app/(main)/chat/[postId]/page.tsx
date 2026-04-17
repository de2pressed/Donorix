import { redirect, notFound } from "next/navigation";

import { ChatThread } from "@/components/chats/chat-thread";
import { Button } from "@/components/ui/button";
import { getCurrentProfile, getHospitalChatThread } from "@/lib/data";

export default async function ChatThreadPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect(`/login?redirect=/chat/${postId}`);
  }

  const thread = await getHospitalChatThread(postId, profile);

  if (!thread) {
    if (profile.account_type === "hospital") {
      redirect("/hospital/chats");
    }

    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Chat</h1>
          <p className="text-sm text-muted-foreground">
            Contact details and live coordination for this approved request.
          </p>
        </div>
        <Button asChild variant="outline">
          <a href={profile.account_type === "hospital" ? "/hospital/chats" : "/"}>
            {profile.account_type === "hospital" ? "Back to chats" : "Back home"}
          </a>
        </Button>
      </div>

      <ChatThread thread={thread} viewer={profile} />
    </div>
  );
}
