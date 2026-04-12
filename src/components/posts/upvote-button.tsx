"use client";

import { ArrowBigUp } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuthPrompt } from "@/components/shared/auth-prompt-modal";

export function UpvoteButton({
  postId,
  count,
  isAuthenticated = false,
}: {
  postId: string;
  count: number;
  isAuthenticated?: boolean;
}) {
  const { openPrompt } = useAuthPrompt();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        if (!isAuthenticated) {
          openPrompt();
          return;
        }

        void fetch(`/api/posts/${postId}/upvote`, { method: "POST" }).then(() =>
          toast.success("Vote recorded"),
        );
      }}
    >
      <ArrowBigUp className="size-4" />
      {count}
    </Button>
  );
}
