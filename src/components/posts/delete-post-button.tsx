"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { authenticatedFetch } from "@/lib/supabase/authenticated-fetch";

export function DeletePostButton({
  postId,
  patientName,
  status,
  onDeleted,
}: {
  postId: string;
  patientName: string;
  status: string;
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (isDeleting) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await authenticatedFetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        toast.error(payload?.error ?? "Unable to delete post");
        return;
      }

      toast.success("Post deleted");
      onDeleted?.();
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }

  if (status === "deleted") {
    return (
      <Button disabled size="sm" variant="secondary">
        Deleted
      </Button>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" type="button" variant="danger">
          <Trash2 className="size-4" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete patient post?</AlertDialogTitle>
          <AlertDialogDescription>
            Delete {patientName}&apos;s request from the hospital workspace. The post will be marked deleted and removed
            from active workflows.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-danger text-danger-foreground hover:bg-danger/85"
            disabled={isDeleting}
            onClick={() => {
              void handleDelete();
            }}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
