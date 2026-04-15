"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { DEMO_ACCOUNTS } from "@/lib/demo-accounts";
import { authenticatedFetch } from "@/lib/supabase/authenticated-fetch";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { syncSupabaseSessionToServer } from "@/lib/supabase/sync-session";
import { loginSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type LoginValues = {
  email: string;
  password: string;
};

type PendingLogin = {
  expectedAccountType: "donor" | "hospital";
  redirectFallback: string;
  useRedirectParam: boolean;
  successMessage: string;
};

export function LoginForm({ accountType = "donor" }: { accountType?: "donor" | "hospital" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [demoLoading, setDemoLoading] = useState<"donor" | "hospital" | null>(null);
  const [demoStatus, setDemoStatus] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [isSettingUpDemo, setIsSettingUpDemo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  function getRedirectDestination(fallback: string, useRedirectParam = true) {
    if (!useRedirectParam) {
      return fallback;
    }

    const redirectTo = searchParams.get("redirect");
    return redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
      ? redirectTo
      : fallback;
  }

  async function finalizeLogin(attempt: PendingLogin) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      toast.error("Supabase auth is not configured yet.");
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      await syncSupabaseSessionToServer(session).catch(() => undefined);
    }

    for (const delay of [0, 250, 750]) {
      if (delay > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, delay));
      }

      const response = await authenticatedFetch("/api/users/me", {
        cache: "no-store",
        redirectOnAuthFailure: false,
      });
      const profile = (await response.json().catch(() => null)) as { account_type?: "donor" | "hospital" } | null;

      if (!response.ok || !profile?.account_type) {
        continue;
      }

      if (profile.account_type !== attempt.expectedAccountType) {
        await supabase.auth.signOut();
        toast.error(
          attempt.expectedAccountType === "hospital"
            ? "These credentials belong to a donor account. Use the donor login tab."
            : "These credentials belong to a hospital account. Use the hospital login tab.",
        );
        return;
      }

      toast.success(attempt.successMessage);
      router.replace(
        getRedirectDestination(
          attempt.useRedirectParam
            ? profile.account_type === "hospital"
              ? "/"
              : attempt.redirectFallback
            : attempt.redirectFallback,
          attempt.useRedirectParam,
        ),
      );
      router.refresh();
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const fallbackAccountType =
      user?.user_metadata?.account_type === "hospital" ? "hospital" : "donor";

    if (fallbackAccountType !== attempt.expectedAccountType) {
      await supabase.auth.signOut();
      toast.error(
        attempt.expectedAccountType === "hospital"
          ? "These credentials belong to a donor account. Use the donor login tab."
          : "These credentials belong to a hospital account. Use the hospital login tab.",
      );
      return;
    }

    toast.success(attempt.successMessage);
    router.replace(
      getRedirectDestination(
        attempt.useRedirectParam
          ? fallbackAccountType === "hospital"
            ? "/"
            : attempt.redirectFallback
          : attempt.redirectFallback,
        attempt.useRedirectParam,
      ),
    );
    router.refresh();
  }

  useEffect(() => {
    let isActive = true;

    async function loadDemoStatus() {
      try {
        const response = await fetch("/api/demo-accounts", { cache: "no-store" });
        const payload = (await response.json().catch(() => null)) as { ready?: boolean } | null;

        if (isActive) {
          setDemoStatus(payload?.ready ? "ready" : "missing");
        }
      } catch {
        if (isActive) {
          setDemoStatus("error");
        }
      }
    }

    void loadDemoStatus();

    return () => {
      isActive = false;
    };
  }, []);

  async function loginWithCredentials(
    values: LoginValues,
    expectedAccountType: "donor" | "hospital",
    redirectFallback: string,
    options?: { useRedirectParam?: boolean },
  ) {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      toast.error("Supabase auth is not configured yet.");
      return;
    }

    const attempt: PendingLogin = {
      expectedAccountType,
      redirectFallback,
      useRedirectParam: options?.useRedirectParam ?? true,
      successMessage:
        expectedAccountType === "hospital" ? "Hospital login successful" : "Donor login successful",
    };

    const { data, error } = await supabase.auth.signInWithPassword(values);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (data.session) {
      await syncSupabaseSessionToServer(data.session).catch(() => undefined);
      await finalizeLogin(attempt);
      return;
    }

    await finalizeLogin(attempt);
  }

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      await loginWithCredentials(values, accountType, accountType === "hospital" ? "/" : "/find");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>{accountType === "hospital" ? "Hospital Login" : "Donor Login"}</CardTitle>
        <CardDescription>
          {accountType === "hospital"
            ? "Access your hospital dashboard, patient posts, and donor applicants."
            : "Access your donor profile, request feed, and notification inbox."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="login-email">
              Email
            </label>
            <Input
              id="login-email"
              placeholder="Enter your email address"
              type="email"
              {...form.register("email")}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-medium" htmlFor="login-password">
                Password
              </label>
              <Link className="text-sm text-brand hover:text-brand/80" href="/forgot-password">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="login-password"
                className="pr-14"
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                {...form.register("password")}
              />
              <Button
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-1 top-1 size-11 rounded-full"
                size="icon"
                type="button"
                variant="ghost"
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
            </div>
          </div>
          <Button
            className="w-full"
            disabled={isSubmitting || demoLoading !== null || isSettingUpDemo}
            type="submit"
          >
            {isSubmitting ? "Logging in..." : "Continue"}
          </Button>
        </form>

        <div className="mt-6 rounded-[1.5rem] border border-border bg-muted/30 p-4 text-sm">
          <p className="font-medium text-foreground">Demo Access</p>
          <p className="mt-1 text-muted-foreground">
            Use a pre-seeded account to jump straight into the donor or hospital demo.
          </p>

          {demoStatus === "missing" ? (
            <div className="mt-4">
              <Button
                className="w-full"
                disabled={isSettingUpDemo || isSubmitting || demoLoading !== null}
                type="button"
                onClick={async () => {
                  setIsSettingUpDemo(true);
                  try {
                    const response = await fetch("/api/demo-accounts", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                    });
                    const payload = (await response.json().catch(() => null)) as
                      | { message?: string; error?: string }
                      | null;

                    if (!response.ok) {
                      throw new Error(payload?.error ?? "Unable to create demo accounts.");
                    }

                    setDemoStatus("ready");
                    toast.success(payload?.message ?? "Demo accounts ready. You can now sign in.");
                  } catch (error) {
                    toast.error(
                      error instanceof Error ? error.message : "Unable to create demo accounts.",
                    );
                  } finally {
                    setIsSettingUpDemo(false);
                  }
                }}
              >
                {isSettingUpDemo ? "Creating demo accounts..." : "Set Up Demo Accounts"}
              </Button>
            </div>
          ) : null}

          {demoStatus === "ready" ? (
            <div className="mt-4 grid gap-3">
              {(["donor", "hospital"] as const).map((demoType) => (
                <button
                  key={demoType}
                  className="rounded-[1.25rem] border border-border bg-card/80 px-4 py-3 text-left transition hover:border-brand/30 hover:bg-brand-soft/20 disabled:opacity-60"
                  disabled={isSubmitting || demoLoading !== null || isSettingUpDemo}
                  type="button"
                  onClick={async () => {
                    setDemoLoading(demoType);
                    try {
                      await loginWithCredentials(
                        {
                          email: DEMO_ACCOUNTS[demoType].email,
                          password: DEMO_ACCOUNTS[demoType].password,
                        },
                        demoType,
                        DEMO_ACCOUNTS[demoType].redirectTo,
                        { useRedirectParam: false },
                      );
                    } finally {
                      setDemoLoading(null);
                    }
                  }}
                >
                  <p className="font-medium text-foreground">
                    {demoLoading === demoType ? "Signing you in..." : DEMO_ACCOUNTS[demoType].label}
                  </p>
                  <p className="mt-1 text-muted-foreground">{DEMO_ACCOUNTS[demoType].subtitle}</p>
                </button>
              ))}
            </div>
          ) : null}

          {demoStatus === "loading" ? (
            <p className="mt-4 text-muted-foreground">Checking demo account availability...</p>
          ) : null}

          {demoStatus === "error" ? (
            <p className="mt-4 text-danger">Unable to load demo account status right now.</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
