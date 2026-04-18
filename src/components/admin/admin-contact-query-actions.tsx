"use client";

import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import { authenticatedFetch } from "@/lib/supabase/authenticated-fetch";

export function AdminContactQueryActions({
  queryId,
  initialReply = "",
}: {
  queryId: string;
  initialReply?: string | null;
}) {
  const router = useRouter();
  const [reply, setReply] = useState(initialReply ?? "");
  const [pending, setPending] = useState<"reply" | "solve" | "delete" | null>(null);

  async function updateQuery(payload: { reply?: string | null; status?: "unresolved" | "solved" }) {
    const response = await authenticatedFetch(`/api/admin/contact-queries/${queryId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    const data = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      throw new Error(data?.error ?? "Unable to update query.");
    }
  }

  async function handleSaveReply() {
    if (!reply.trim()) {
      toast.error("Reply cannot be empty.");
      return;
    }

    setPending("reply");
    try {
      await updateQuery({ reply: reply.trim(), status: "solved" });
      toast.success("Reply saved.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update query.");
    } finally {
      setPending(null);
    }
  }

  async function handleMarkSolved() {
    setPending("solve");
    try {
      await updateQuery({ status: "solved" });
      toast.success("Query marked solved.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update query.");
    } finally {
      setPending(null);
    }
  }

  async function handleDelete() {
    setPending("delete");
    try {
      const response = await authenticatedFetch(`/api/admin/contact-queries/${queryId}`, {
        method: "DELETE",
      });
      const data = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to delete query.");
      }

      toast.success("Query deleted.");
      router.push("/admin/queries");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete query.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="query-reply">
          Admin reply
        </label>
        <Textarea
          id="query-reply"
          placeholder="Write the response the user should see"
          value={reply}
          onChange={(event) => setReply(event.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button disabled={pending !== null} type="button" onClick={() => void handleSaveReply()}>
          {pending === "reply" ? "Saving..." : "Save reply"}
        </Button>
        <Button disabled={pending !== null} type="button" variant="outline" onClick={() => void handleMarkSolved()}>
          {pending === "solve" ? "Saving..." : "Mark solved"}
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={pending !== null} type="button" variant="danger">
              {pending === "delete" ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this query?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes the query from the admin inbox and the user&apos;s history.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={pending !== null}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-danger text-danger-foreground hover:bg-danger/85"
                disabled={pending !== null}
                onClick={() => void handleDelete()}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
