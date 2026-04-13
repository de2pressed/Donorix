"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowBigUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuthPrompt } from "@/components/shared/auth-prompt-modal";
import { authenticatedFetch } from "@/lib/supabase/authenticated-fetch";

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
  const [displayCount, setDisplayCount] = useState(count);
  const [popped, setPopped] = useState(false);

  useEffect(() => {
    setDisplayCount(count);
  }, [count]);

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
          const response = await authenticatedFetch(`/api/posts/${postId}/upvote`, {
            method: "POST",
          });
          const body = (await response.json().catch(() => null)) as { error?: string } | null;

          if (!response.ok) {
            toast.error(body?.error ?? "Unable to record vote");
            return;
          }

          setDisplayCount((current) => current + 1);
          setPopped(true);
          window.setTimeout(() => setPopped(false), 220);
          toast.success("Vote recorded");
          router.refresh();
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      <motion.span
        animate={popped ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        className="inline-flex"
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        <ArrowBigUp className="size-4" />
      </motion.span>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={displayCount}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          initial={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          {displayCount}
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}
