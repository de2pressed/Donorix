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

export function LoginForm({ accountType = "donor" }: { accountType?: "donor" | "hospital" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = form.handleSubmit(async (values) => {
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

    if (profile?.account_type && profile.account_type !== accountType) {
      await supabase.auth.signOut();
      toast.error(
        accountType === "hospital"
          ? "These credentials belong to a donor account. Use the donor login tab."
          : "These credentials belong to a hospital account. Use the hospital login tab.",
      );
      return;
    }

    toast.success(accountType === "hospital" ? "Hospital login successful" : "Donor login successful");
    const redirectTo = searchParams.get("redirect");
    const destination =
      redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : "/";
    router.replace(destination);
    router.refresh();
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
          <Button className="w-full" type="submit">
            Continue
          </Button>
        </form>

        {accountType === "hospital" ? (
          <div className="mt-6 rounded-[1.5rem] border border-border bg-muted/30 p-4 text-sm">
            <p className="font-medium text-foreground">Demo Access</p>
            <p className="mt-1 text-muted-foreground">
              Demo hospital credentials for stakeholder walkthroughs.
            </p>
            <div className="mt-3 space-y-1 text-muted-foreground">
              <p>Email: demo.hospital@donorix.in</p>
              <p>Password: DemoHospital@2025</p>
            </div>
            <Button
              className="mt-4 w-full"
              type="button"
              variant="outline"
              onClick={() => {
                form.setValue("email", "demo.hospital@donorix.in", { shouldDirty: true });
                form.setValue("password", "DemoHospital@2025", { shouldDirty: true });
              }}
            >
              Use Demo Hospital
            </Button>
          </div>
        ) : (
          <div className="mt-6 rounded-[1.5rem] border border-border bg-muted/30 p-4 text-sm">
            <p className="font-medium text-foreground">Demo Access</p>
            <p className="mt-1 text-muted-foreground">
              Demo donor credentials for end-to-end testing of the donor flow.
            </p>
            <div className="mt-3 space-y-1 text-muted-foreground">
              <p>Email: demo.donor@donorix.in</p>
              <p>Password: DemoDonor@2025</p>
            </div>
            <Button
              className="mt-4 w-full"
              type="button"
              variant="outline"
              onClick={() => {
                form.setValue("email", "demo.donor@donorix.in", { shouldDirty: true });
                form.setValue("password", "DemoDonor@2025", { shouldDirty: true });
              }}
            >
              Use Demo Donor
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
