"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { authenticatedFetch } from "@/lib/supabase/authenticated-fetch";

export function ContactForm() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length < 10 || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authenticatedFetch("/api/contact-queries", {
        method: "POST",
        body: JSON.stringify({ query: trimmed }),
      });
      const data = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to send query.");
      }

      toast.success("Your query was sent to the Donorix admins.");
      setQuery("");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send query.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="contact-query">
          Your query
        </label>
        <Textarea
          id="contact-query"
          placeholder="Tell us what you need help with"
          rows={7}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button disabled={isSubmitting || query.trim().length < 10} type="submit">
          {isSubmitting ? "Sending..." : "Send query"}
        </Button>
        <p className="text-sm text-muted-foreground">Admins will review your message inside Donorix.</p>
      </div>
    </form>
  );
}
