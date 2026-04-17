"use client";

import { Sparkles, Clock3, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authenticatedFetch } from "@/lib/supabase/authenticated-fetch";
import type { HospitalAccount } from "@/types/user";

export function DemoRequestCard({ hospital }: { hospital: HospitalAccount }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreateDemoRequest() {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authenticatedFetch("/api/posts/demo", {
        method: "POST",
      });

      const payload = (await response.json().catch(() => null)) as { error?: string; postId?: string } | null;

      if (!response.ok) {
        toast.error(payload?.error ?? "Unable to create demo request");
        return;
      }

      if (!payload?.postId) {
        toast.error("Demo request created, but no request id was returned.");
        return;
      }

      toast.success("Demo request created");
      router.push(`/posts/${payload.postId}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="h-fit overflow-hidden xl:sticky xl:top-6">
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-brand">
          <Sparkles className="size-4" />
          Demo shortcut
        </div>
        <div className="space-y-1">
          <CardTitle>Create a demo request</CardTitle>
          <CardDescription>
            One click posts a prefilled emergency request for stakeholder walkthroughs.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 rounded-[1.25rem] border border-border bg-muted/30 p-4 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Hospital</span>
            <span className="font-medium text-foreground">{hospital.hospital_name}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Blood type</span>
            <span className="font-medium text-foreground">O+</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Units</span>
            <span className="font-medium text-foreground">1</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium text-foreground">Emergency</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Ready by</span>
            <span className="font-medium text-foreground">about 1 hour</span>
          </div>
        </div>

        <Button className="w-full" disabled={isSubmitting} onClick={() => void handleCreateDemoRequest()}>
          {isSubmitting ? (
            <>
              <Clock3 className="size-4" />
              Creating demo request...
            </>
          ) : (
            <>
              <FileText className="size-4" />
              Create demo request
            </>
          )}
        </Button>

        <p className="text-xs leading-5 text-muted-foreground">
          This uses the current hospital profile and creates a flagged demo request immediately.
        </p>
      </CardContent>
    </Card>
  );
}
