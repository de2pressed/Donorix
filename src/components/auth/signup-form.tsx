"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { signupSchema } from "@/lib/validations/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type SignupValues = z.input<typeof signupSchema>;
type SignupSubmitValues = z.output<typeof signupSchema>;

export function SignupForm() {
  const router = useRouter();
  const form = useForm<SignupValues, unknown, SignupSubmitValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      gender: "prefer_not_to_say",
      blood_type: "O+",
      weight_kg: 50,
      has_chronic_disease: false,
      is_smoker: false,
      is_on_medication: false,
      consent_notifications: true,
      consent_terms: true,
      consent_privacy: true,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      toast.error("Supabase auth is not configured yet.");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        data: values,
      },
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Account created. Verify your email to continue.");
    router.push("/login");
  });

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Create your donor account</CardTitle>
        <CardDescription>Consent-first signup aligned with Indian blood donation requirements.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          <Input placeholder="Full name" {...form.register("full_name")} />
          <Input placeholder="Username" {...form.register("username")} />
          <Input placeholder="Email" type="email" {...form.register("email")} />
          <Input placeholder="Phone (+91...)" {...form.register("phone")} />
          <Input placeholder="Password" type="password" {...form.register("password")} />
          <Input placeholder="Confirm password" type="password" {...form.register("confirm_password")} />
          <Input placeholder="Date of birth" type="date" {...form.register("date_of_birth")} />
          <Input placeholder="Blood type" {...form.register("blood_type")} />
          <Input placeholder="City" {...form.register("city")} />
          <Input placeholder="State" {...form.register("state")} />
          <Input placeholder="Pincode" {...form.register("pincode")} />
          <Input placeholder="Weight (kg)" type="number" {...form.register("weight_kg", { valueAsNumber: true })} />
          <Input placeholder="Gender" {...form.register("gender")} />
          <div className="md:col-span-2">
            <Button type="submit">Create account</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
