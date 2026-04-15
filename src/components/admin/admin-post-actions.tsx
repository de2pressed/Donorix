"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { authenticatedFetch } from "@/lib/supabase/authenticated-fetch";

export function AdminPostActions({ postId }: { postId: string }) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  async function runAction(action: "expire" | "delete" | "fulfill") {
    setPendingAction(action);

    try {
      const response = await authenticatedFetch(`/api/admin/posts/${postId}/action`, {
        method: "POST",
        body: JSON.stringify({
          action,
          reason: reason.trim() || null,
        }),
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to update post.");
      }

      toast.success(`Post ${action} action completed.`);
      setReason("");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update post.");
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="admin-post-reason">
          Admin reason
        </label>
        <Textarea
          id="admin-post-reason"
          placeholder="Optional moderation note"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <Button
          disabled={pendingAction !== null}
          type="button"
          variant="outline"
          onClick={() => void runAction("expire")}
        >
          {pendingAction === "expire" ? "Expiring..." : "Expire"}
        </Button>
        <Button
          disabled={pendingAction !== null}
          type="button"
          variant="outline"
          onClick={() => void runAction("fulfill")}
        >
          {pendingAction === "fulfill" ? "Updating..." : "Mark fulfilled"}
        </Button>
        <Button
          disabled={pendingAction !== null}
          type="button"
          variant="danger"
          onClick={() => void runAction("delete")}
        >
          {pendingAction === "delete" ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </div>
  );
}
