"use client";

import { HeartHandshake } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { useAuthPrompt } from "@/components/shared/auth-prompt-modal";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useUser } from "@/lib/hooks/use-user";
import { authenticatedFetch } from "@/lib/supabase/authenticated-fetch";
import {
  getNextEligibleDonationDate,
  isDonationEligible,
} from "@/lib/utils/donation-eligibility";
import { useTranslations } from "next-intl";

export function DonateButton({
  postId,
  isAuthenticated = false,
}: {
  postId: string;
  isAuthenticated?: boolean;
}) {
  const router = useRouter();
  const { openPrompt } = useAuthPrompt();
  const tRequest = useTranslations("request");
  const { data: user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const nextEligibleDate = getNextEligibleDonationDate(user?.last_donated_at);
  const eligibleToDonate = isDonationEligible(user?.last_donated_at);
  const cooldownMessage = nextEligibleDate
    ? tRequest("eligibleAgainOn", { date: format(nextEligibleDate, "d MMM yyyy") })
    : tRequest("currentlyNotEligible");

  if (isAuthenticated && user?.account_type === "hospital") {
    return null;
  }

  async function handleDonate() {
    if (!isAuthenticated) {
      openPrompt();
      return;
    }

    if (!eligibleToDonate) {
      toast.error(cooldownMessage);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authenticatedFetch(`/api/posts/${postId}/donors`, {
        method: "POST",
      });
      const body = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        toast.error(body?.error ?? tRequest("unableToSubmit"));
        return;
      }

      toast.success(tRequest("applicationSubmitted"));
      setSubmitted(true);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  const buttonLabel = submitted
    ? tRequest("requestSubmitted")
    : isSubmitting
      ? tRequest("submitting")
      : tRequest("iCanDonate");

  const button = (
    <Button
      disabled={submitted || isSubmitting || (isAuthenticated && !eligibleToDonate)}
      variant={submitted ? "outline" : "secondary"}
      onClick={() => {
        void handleDonate();
      }}
    >
      <HeartHandshake className="size-4" />
      {buttonLabel}
    </Button>
  );

  if (isAuthenticated && !eligibleToDonate && !submitted) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>{cooldownMessage}</TooltipContent>
      </Tooltip>
    );
  }

  return button;
}
