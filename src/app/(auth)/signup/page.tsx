import Link from "next/link";
import { Building2, HeartHandshake } from "lucide-react";

import { HospitalSignupForm } from "@/components/auth/hospital-signup-form";
import { SignupForm } from "@/components/auth/signup-form";
import { cn } from "@/lib/utils/cn";

export default async function SignupPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const account = resolvedSearchParams.account === "hospital" ? "hospital" : "donor";

  return (
    <div className="w-full space-y-6">
      <div className="mx-auto grid max-w-4xl gap-3 md:grid-cols-2">
        <Link
          className={cn(
            "rounded-[1.75rem] border p-5 text-left transition",
            account === "donor"
              ? "border-brand bg-brand-soft/40 shadow-soft"
              : "border-border bg-card/70 hover:border-brand/30 hover:bg-brand-soft/20",
          )}
          href="/signup?account=donor"
        >
          <div className="flex items-start gap-4">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <HeartHandshake className="size-5" />
            </div>
            <div>
              <p className="font-semibold">Sign up as a Donor</p>
              <p className="mt-1 text-sm text-muted-foreground">Register to donate blood and save lives</p>
            </div>
          </div>
        </Link>
        <Link
          className={cn(
            "rounded-[1.75rem] border p-5 text-left transition",
            account === "hospital"
              ? "border-brand bg-brand-soft/40 shadow-soft"
              : "border-border bg-card/70 hover:border-brand/30 hover:bg-brand-soft/20",
          )}
          href="/signup?account=hospital"
        >
          <div className="flex items-start gap-4">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <Building2 className="size-5" />
            </div>
            <div>
              <p className="font-semibold">Sign up as a Hospital</p>
              <p className="mt-1 text-sm text-muted-foreground">Post blood requests for your patients</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="flex justify-center">{account === "hospital" ? <HospitalSignupForm /> : <SignupForm />}</div>
    </div>
  );
}
