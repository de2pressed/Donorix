"use client";

import { ArrowBigUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
  const router = useRouter();
  const { openPrompt } = useAuthPrompt();
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <Button
      disabled={isSubmitting}
      variant="ghost"
      size="sm"
      onClick={async () => {
        if (!isAuthenticated) {
          openPrompt();
          return;
        }

        setIsSubmitting(true);
        try {
          const response = await fetch(`/api/posts/${postId}/upvote`, { method: "POST" });
          const body = (await response.json().catch(() => null)) as { error?: string } | null;

          if (!response.ok) {
            toast.error(body?.error ?? "Unable to record vote");
            return;
          }

          toast.success("Vote recorded");
          router.refresh();
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      <ArrowBigUp className="size-4" />
      {count}
    </Button>
  );
}
