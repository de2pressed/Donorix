"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DeletePostButton } from "@/components/posts/delete-post-button";
import { authenticatedFetch } from "@/lib/supabase/authenticated-fetch";
import { cn } from "@/lib/utils/cn";
import type { Post } from "@/types/post";

type HospitalPostHistoryProps = {
  posts: Post[];
  copy: HospitalPostHistoryCopy;
};

type HospitalPostHistoryCopy = {
  requestLog: string;
  bulkDeleteHint: string;
  selectAll: string;
  selectedCount: string;
  deleteSelected: string;
  deleteAll: string;
  deleteSelectedTitle: string;
  deleteAllTitle: string;
  deleteSelectedDescription: string;
  deleteAllDescription: string;
  deleteAction: string;
  deleting: string;
  cancel: string;
  deleteSuccess: string;
  noPatientId: string;
  units: string;
  donorApplicants: string;
  empty: string;
};

function formatCount(template: string, count: number) {
  return template.replace(/\{count\}/g, String(count));
}

function getStatusLabel(status: Post["status"]) {
  if (status === "fulfilled") {
    return "Fulfilled";
  }

  if (status === "deleted") {
    return "Deleted";
  }

  return "Not fulfilled";
}

export function HospitalPostHistory({ posts, copy }: HospitalPostHistoryProps) {
  const router = useRouter();
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [confirmTarget, setConfirmTarget] = useState<"selected" | "all" | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const selectAllRef = useRef<HTMLInputElement | null>(null);

  const deletablePosts = useMemo(() => posts.filter((post) => post.status !== "deleted"), [posts]);
  const deletablePostIds = useMemo(() => deletablePosts.map((post) => post.id), [deletablePosts]);
  const selectedDeletableIds = useMemo(
    () => selectedPostIds.filter((postId) => deletablePostIds.includes(postId)),
    [deletablePostIds, selectedPostIds],
  );
  const allSelected = deletablePostIds.length > 0 && selectedDeletableIds.length === deletablePostIds.length;
  const partiallySelected = selectedDeletableIds.length > 0 && !allSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = partiallySelected;
    }
  }, [partiallySelected]);

  useEffect(() => {
    setSelectedPostIds((current) => current.filter((postId) => deletablePostIds.includes(postId)));
  }, [deletablePostIds]);

  function togglePost(postId: string) {
    setSelectedPostIds((current) =>
      current.includes(postId) ? current.filter((currentId) => currentId !== postId) : [...current, postId],
    );
  }

  function toggleAll(nextValue: boolean) {
    setSelectedPostIds(nextValue ? deletablePostIds : []);
  }

  async function performBulkDelete(postIds: string[]) {
    if (!postIds.length || isDeleting) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await authenticatedFetch("/api/posts/bulk-delete", {
        method: "POST",
        body: JSON.stringify({ postIds }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; deletedCount?: number; error?: string }
        | null;

      if (!response.ok) {
        toast.error(payload?.error ?? "Unable to delete posts");
        return;
      }

      const deletedCount =
        typeof payload?.deletedCount === "number" ? payload.deletedCount : postIds.length;

      toast.success(formatCount(copy.deleteSuccess, deletedCount));
      setSelectedPostIds([]);
      setConfirmTarget(null);
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }

  const confirmCount = confirmTarget === "all" ? deletablePostIds.length : selectedDeletableIds.length;
  const confirmTitle = confirmTarget === "all" ? copy.deleteAllTitle : copy.deleteSelectedTitle;
  const confirmDescription =
    confirmTarget === "all"
      ? formatCount(copy.deleteAllDescription, deletablePostIds.length)
      : formatCount(copy.deleteSelectedDescription, selectedDeletableIds.length);
  const confirmDisabled = confirmCount === 0 || isDeleting;

  return (
    <>
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle>{copy.requestLog}</CardTitle>
              <CardDescription>{copy.bulkDeleteHint}</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                disabled={!selectedDeletableIds.length || isDeleting}
                size="sm"
                type="button"
                variant="secondary"
                onClick={() => setConfirmTarget("selected")}
              >
                <Trash2 className="size-4" />
                {copy.deleteSelected}
              </Button>
              <Button
                disabled={!deletablePostIds.length || isDeleting}
                size="sm"
                type="button"
                variant="danger"
                onClick={() => setConfirmTarget("all")}
              >
                <Trash2 className="size-4" />
                {copy.deleteAll}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-muted/20 px-4 py-3">
            <label className="flex items-center gap-3 text-sm font-medium text-foreground">
              <input
                ref={selectAllRef}
                checked={allSelected}
                className="size-4 rounded border-border text-brand focus:ring-brand"
                disabled={!deletablePostIds.length}
                type="checkbox"
                onChange={(event) => toggleAll(event.target.checked)}
              />
              {copy.selectAll}
            </label>
            <p className="text-sm text-muted-foreground">
              {selectedDeletableIds.length
                ? formatCount(copy.selectedCount, selectedDeletableIds.length)
                : copy.bulkDeleteHint}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {posts.length ? (
            posts.map((post) => {
              const selected = selectedPostIds.includes(post.id);
              const isDeleted = post.status === "deleted";

              return (
                <div
                  key={post.id}
                  className={cn(
                    "grid gap-3 rounded-[1.25rem] border border-border p-4 transition",
                    selected && "border-brand/40 bg-brand-soft/25",
                    "md:grid-cols-[auto_minmax(0,1.2fr)_1fr_auto] md:items-center",
                  )}
                >
                  <label className="flex items-start pt-1">
                    <input
                      checked={selected}
                      className="size-4 rounded border-border text-brand focus:ring-brand"
                      disabled={isDeleted}
                      type="checkbox"
                      onChange={() => togglePost(post.id)}
                    />
                  </label>

                  <div className="min-w-0">
                    <Link className="font-display font-semibold transition-colors hover:text-brand" href={`/posts/${post.id}`}>
                      {post.patient_name}
                    </Link>
                    <p className="font-mono text-sm text-muted-foreground">
                      {post.patient_id ?? copy.noPatientId} - {post.blood_type_needed}
                    </p>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <span className="font-mono">{post.units_needed}</span> {copy.units} -{" "}
                    <span className="font-mono">{post.donor_count ?? 0}</span> {copy.donorApplicants}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 md:justify-end">
                    <Badge
                      variant={
                        post.status === "fulfilled"
                          ? "success"
                          : post.status === "deleted"
                            ? "warning"
                            : "secondary"
                      }
                    >
                      {getStatusLabel(post.status)}
                    </Badge>
                    <DeletePostButton postId={post.id} patientName={post.patient_name} status={post.status} />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-[1.25rem] border border-dashed border-border p-6 text-sm text-muted-foreground">
              {copy.empty}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={confirmTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{copy.cancel}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-danger text-danger-foreground hover:bg-danger/85"
              disabled={confirmDisabled}
              onClick={() => void performBulkDelete(confirmTarget === "all" ? deletablePostIds : selectedDeletableIds)}
            >
              {isDeleting ? copy.deleting : copy.deleteAction}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
