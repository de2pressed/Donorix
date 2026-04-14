"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authenticatedFetch } from "@/lib/supabase/authenticated-fetch";
import { loginSchema } from "@/lib/validations/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type LoginValues = {
  email: string;
  password: string;
};

const DEMO_ACCOUNTS = {
  donor: {
    email: "demo.donor@donorix.in",
    password: "DemoDonor@2025",
    label: "Demo Donor Account",
    subtitle: "Auto-login into the donor workflow",
    redirectTo: "/find",
  },
  hospital: {
    email: "demo.hospital@donorix.in",
    password: "DemoHospital@2025",
    label: "Demo Hospital Account",
    subtitle: "City Lifeline Hospital demo dashboard",
    redirectTo: "/",
  },
} as const;

export function LoginForm({ accountType = "donor" }: { accountType?: "donor" | "hospital" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [demoLoading, setDemoLoading] = useState<"donor" | "hospital" | null>(null);
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

    const { error } = await supabase.auth.signInWithPassword(values);

    if (error) {
      toast.error(error.message);
      return;
    }

    const profileResponse = await authenticatedFetch("/api/users/me", {
      cache: "no-store",
    });
    const profile = (await profileResponse.json().catch(() => null)) as { account_type?: "donor" | "hospital" } | null;

    if (profile?.account_type && profile.account_type !== expectedAccountType) {
      await supabase.auth.signOut();
      toast.error(
        expectedAccountType === "hospital"
          ? "These credentials belong to a donor account. Use the donor login tab."
          : "These credentials belong to a hospital account. Use the hospital login tab.",
      );
      return;
    }

    toast.success(expectedAccountType === "hospital" ? "Hospital login successful" : "Donor login successful");
    router.replace(getRedirectDestination(redirectFallback, options?.useRedirectParam ?? true));
    router.refresh();
  }

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      await loginWithCredentials(values, accountType, accountType === "hospital" ? "/" : "/");
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
            <Input id="login-email" placeholder="Enter your email address" type="email" {...form.register("email")} />
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
          <Button className="w-full" disabled={isSubmitting || demoLoading !== null} type="submit">
            {isSubmitting ? "Logging in..." : "Continue"}
          </Button>
        </form>

        <div className="mt-6 rounded-[1.5rem] border border-border bg-muted/30 p-4 text-sm">
          <p className="font-medium text-foreground">Demo Access</p>
          <p className="mt-1 text-muted-foreground">
            Use a pre-seeded account to jump straight into the donor or hospital demo.
          </p>
          <div className="mt-4 grid gap-3">
            {(["donor", "hospital"] as const).map((demoType) => (
              <button
                key={demoType}
                className="rounded-[1.25rem] border border-border bg-card/80 px-4 py-3 text-left transition hover:border-brand/30 hover:bg-brand-soft/20 disabled:opacity-60"
                disabled={isSubmitting || demoLoading !== null}
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
                  {demoLoading === demoType ? "Logging in..." : DEMO_ACCOUNTS[demoType].label}
                </p>
                <p className="mt-1 text-muted-foreground">{DEMO_ACCOUNTS[demoType].subtitle}</p>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
