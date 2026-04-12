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
import { loginSchema } from "@/lib/validations/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type LoginValues = {
  email: string;
  password: string;
};

export function LoginForm() {
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

    toast.success("Login successful");
    const redirectTo = searchParams.get("redirect");
    const destination =
      redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : "/";
    router.replace(destination);
    router.refresh();
  });

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Access your donor profile, requests, and notification inbox.</CardDescription>
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
      </CardContent>
    </Card>
  );
}
