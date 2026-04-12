"use client";

import { HeartHandshake } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuthPrompt } from "@/components/shared/auth-prompt-modal";

export function DonateButton({
  postId,
  isAuthenticated = false,
}: {
  postId: string;
  isAuthenticated?: boolean;
}) {
  const { openPrompt } = useAuthPrompt();

  return (
    <Button
      variant="secondary"
      onClick={() => {
        if (!isAuthenticated) {
          openPrompt();
          return;
        }

        void fetch(`/api/posts/${postId}/donors`, { method: "POST" }).then(() =>
          toast.success("Application submitted"),
        );
      }}
    >
      <HeartHandshake className="size-4" />
      I can donate
    </Button>
  );
}
