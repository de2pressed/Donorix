"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase auth is not configured yet.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSuccess(true);
      toast.success("Password reset link sent.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
        <CardDescription>
          We will send a password reset link to your verified email address.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {success ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100">
              We sent a password reset link to your email if the account exists.
            </div>
            <Button asChild className="w-full" variant="outline">
              <Link href="/login">Back to login</Link>
            </Button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="forgot-password-email">
                Email
              </label>
              <Input
                id="forgot-password-email"
                placeholder="Enter your email address"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            {error ? (
              <div className="rounded-2xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
                {error}
              </div>
            ) : null}
            <Button className="w-full" disabled={isSubmitting || !email.trim()} type="submit">
              {isSubmitting ? "Sending..." : "Send reset link"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
