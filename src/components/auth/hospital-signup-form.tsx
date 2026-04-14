"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { HOSPITAL_TYPES } from "@/lib/account";
import { getCitiesForRegion, INDIAN_REGION_NAMES } from "@/lib/india-locations";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  hospitalSignupProfileSeedSchema,
  hospitalSignupSchema,
} from "@/lib/validations/auth";
import { PhoneInput } from "@/components/shared/phone-input";
import { SearchablePicker } from "@/components/shared/searchable-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

type HospitalSignupValues = z.input<typeof hospitalSignupSchema>;
type HospitalSignupSubmitValues = z.output<typeof hospitalSignupSchema>;
type HospitalFieldName = keyof HospitalSignupSubmitValues;

const STEP_CONFIG: Array<{
  title: string;
  description: string;
  fields: HospitalFieldName[];
}> = [
  {
    title: "Hospital Details",
    description: "Set the identity Donorix will use for your hospital account.",
    fields: ["hospital_name", "hospital_type"],
  },
  {
    title: "Registration & Address",
    description: "Use official registration details and the real hospital location.",
    fields: ["registration_number", "state", "city", "pincode", "address"],
  },
  {
    title: "Primary Contact",
    description: "This contact is used for donor coordination and admin verification.",
    fields: ["contact_person_name", "official_contact_phone", "official_contact_email", "email"],
  },
  {
    title: "Security",
    description: "Create the login credentials for your hospital operations account.",
    fields: ["password", "confirm_password"],
  },
  {
    title: "Consent",
    description: "Review the legal terms and acknowledge Donorix verification checks.",
    fields: ["consent_terms", "consent_privacy", "consent_hospital_verification"],
  },
] as const;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-danger">{message}</p>;
}

function FieldShell({
  htmlFor,
  label,
  children,
  error,
  note,
}: {
  htmlFor: string;
  label: string;
  children: React.ReactNode;
  error?: string;
  note?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {note ? <p className="text-xs text-muted-foreground">{note}</p> : null}
      <FieldError message={error} />
    </div>
  );
}

function ToggleCard({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-4 rounded-[1.5rem] border p-4 transition ${
        checked
          ? "border-brand/40 bg-brand-soft/50"
          : "border-border bg-card/70 hover:border-brand/40 hover:bg-brand-soft/40"
      }`}
      htmlFor={id}
    >
      <input
        checked={checked}
        className="mt-1 size-4 rounded border-border text-brand focus:ring-brand"
        id={id}
        type="checkbox"
        onChange={(event) => onChange(event.target.checked)}
      />
      <div className="space-y-1">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </label>
  );
}

export function HospitalSignupForm() {
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<HospitalSignupValues, unknown, HospitalSignupSubmitValues>({
    resolver: zodResolver(hospitalSignupSchema),
    mode: "onTouched",
    defaultValues: {
      account_type: "hospital",
      preferred_language: "en",
      consent_notifications: true,
      hospital_type: "private_hospital",
      email: "",
      official_contact_email: "",
      phone: "",
    },
  });

  const currentStep = STEP_CONFIG[step];
  const progress = ((step + 1) / STEP_CONFIG.length) * 100;
  const selectedState = form.watch("state");
  const cityOptions = useMemo(() => getCitiesForRegion(selectedState), [selectedState]);

  async function handleNext() {
    const isValid = await form.trigger(currentStep.fields, { shouldFocus: true });
    if (!isValid) return;
    setStep((current) => Math.min(current + 1, STEP_CONFIG.length - 1));
  }

  const onSubmit = form.handleSubmit(async (values) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      toast.error("Supabase auth is not configured yet.");
      return;
    }

    const profileSeed = hospitalSignupProfileSeedSchema.parse(values);

    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        data: profileSeed,
      },
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Hospital account created. Verify your email to continue.");
    window.location.assign("/login?account=hospital");
  });

  const errors = form.formState.errors;

  return (
    <Card className="w-full max-w-2xl overflow-hidden">
      <CardHeader className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
            <span>
              Step {step + 1} of {STEP_CONFIG.length}
            </span>
            <span>{currentStep.title}</span>
          </div>
          <Progress value={progress} />
        </div>
        <div>
          <CardTitle>{currentStep.title}</CardTitle>
          <CardDescription>{currentStep.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={onSubmit}>
          {step === 0 ? (
            <div className="grid gap-4">
              <FieldShell error={errors.hospital_name?.message} htmlFor="hospital_name" label="Hospital Name">
                <Input
                  id="hospital_name"
                  placeholder="Enter the hospital name"
                  {...form.register("hospital_name")}
                />
              </FieldShell>
              <FieldShell error={errors.hospital_type?.message} htmlFor="hospital_type" label="Hospital Type">
                <select
                  className="h-11 w-full rounded-2xl border border-border bg-card/80 px-4 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  id="hospital_type"
                  value={form.watch("hospital_type") ?? "private_hospital"}
                  onChange={(event) =>
                    form.setValue(
                      "hospital_type",
                      event.target.value as HospitalSignupValues["hospital_type"],
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      },
                    )
                  }
                >
                  {HOSPITAL_TYPES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FieldShell>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <FieldShell
                  error={errors.registration_number?.message}
                  htmlFor="registration_number"
                  label="Registration / License Number"
                >
                  <Input
                    id="registration_number"
                    placeholder="Enter the official registration number"
                    {...form.register("registration_number")}
                  />
                </FieldShell>
              </div>
              <div className="md:col-span-2">
                <FieldShell error={errors.state?.message} htmlFor="hospital-state" label="State">
                  <SearchablePicker
                    description="Search all Indian states and union territories."
                    emptyMessage="No state or union territory matches that search."
                    id="hospital-state"
                    options={INDIAN_REGION_NAMES}
                    placeholder="Select State"
                    searchPlaceholder="Search state or union territory"
                    title="Select state"
                    value={selectedState}
                    onChange={(value) => {
                      form.setValue("state", value, { shouldDirty: true, shouldValidate: true });
                      form.setValue("city", "", { shouldDirty: true });
                    }}
                  />
                </FieldShell>
              </div>
              <div className="md:col-span-2">
                <FieldShell error={errors.city?.message} htmlFor="hospital-city" label="City">
                  <SearchablePicker
                    description="Choose the city or district that matches the hospital location."
                    disabled={!selectedState}
                    emptyMessage={
                      selectedState
                        ? "No city matches that search."
                        : "Select a state before choosing a city."
                    }
                    id="hospital-city"
                    options={cityOptions}
                    placeholder={selectedState ? "Select City" : "Select state first"}
                    searchPlaceholder="Search city or district"
                    title="Select city"
                    value={form.watch("city") ?? undefined}
                    onChange={(value) =>
                      form.setValue("city", value, { shouldDirty: true, shouldValidate: true })
                    }
                  />
                </FieldShell>
              </div>
              <FieldShell error={errors.pincode?.message} htmlFor="hospital-pincode" label="Pincode">
                <Input
                  id="hospital-pincode"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit pincode"
                  {...form.register("pincode")}
                />
              </FieldShell>
              <div className="md:col-span-2">
                <FieldShell error={errors.address?.message} htmlFor="address" label="Full Address">
                  <Input id="address" placeholder="Enter the hospital address" {...form.register("address")} />
                </FieldShell>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <FieldShell
                error={errors.contact_person_name?.message}
                htmlFor="contact_person_name"
                label="Primary Contact Person"
              >
                <Input
                  id="contact_person_name"
                  placeholder="Enter the primary contact person's name"
                  {...form.register("contact_person_name")}
                />
              </FieldShell>
              <FieldShell
                error={errors.official_contact_phone?.message}
                htmlFor="official_contact_phone"
                label="Official Phone Number"
              >
                <Controller
                  control={form.control}
                  name="official_contact_phone"
                  render={({ field }) => (
                    <PhoneInput
                      id="official_contact_phone"
                      value={field.value ?? ""}
                      onBlur={field.onBlur}
                      onChange={(nextValue) => {
                        field.onChange(nextValue);
                        form.setValue("phone", nextValue as never, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                    />
                  )}
                />
              </FieldShell>
              <div className="md:col-span-2">
                <FieldShell
                  error={errors.official_contact_email?.message || errors.email?.message}
                  htmlFor="official_contact_email"
                  label="Official Email"
                  note="This email will be used for hospital login and verification."
                >
                  <Input
                    id="official_contact_email"
                    placeholder="Enter the official coordination email"
                    type="email"
                    value={form.watch("official_contact_email") ?? ""}
                    onChange={(event) => {
                      form.setValue("official_contact_email", event.target.value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      form.setValue("email", event.target.value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                  />
                </FieldShell>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="grid gap-4">
              <FieldShell error={errors.password?.message} htmlFor="hospital-password" label="Password">
                <div className="relative">
                  <Input
                    id="hospital-password"
                    className="pr-14"
                    placeholder="Create a strong password"
                    type={showPassword ? "text" : "password"}
                    {...form.register("password")}
                  />
                  <Button
                    className="absolute right-1 top-1 size-11 rounded-full"
                    size="icon"
                    type="button"
                    variant="ghost"
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                </div>
              </FieldShell>
              <FieldShell
                error={errors.confirm_password?.message}
                htmlFor="hospital-confirm-password"
                label="Confirm Password"
              >
                <div className="relative">
                  <Input
                    id="hospital-confirm-password"
                    className="pr-14"
                    placeholder="Re-enter your password"
                    type={showConfirmPassword ? "text" : "password"}
                    {...form.register("confirm_password")}
                  />
                  <Button
                    className="absolute right-1 top-1 size-11 rounded-full"
                    size="icon"
                    type="button"
                    variant="ghost"
                    onClick={() => setShowConfirmPassword((current) => !current)}
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                </div>
              </FieldShell>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-4">
              <ToggleCard
                checked={Boolean(form.watch("consent_terms"))}
                description="I have read and agree to the Terms of Use."
                id="hospital-consent-terms"
                label="Terms of Use"
                onChange={(checked) =>
                  form.setValue("consent_terms", checked, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
              <FieldError message={errors.consent_terms?.message} />
              <ToggleCard
                checked={Boolean(form.watch("consent_privacy"))}
                description="I have read and agree to the Privacy Policy."
                id="hospital-consent-privacy"
                label="Privacy Policy"
                onChange={(checked) =>
                  form.setValue("consent_privacy", checked, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
              <FieldError message={errors.consent_privacy?.message} />
              <ToggleCard
                checked={Boolean(form.watch("consent_hospital_verification"))}
                description="I understand that Donorix admins may verify hospital details before trust badges are shown."
                id="hospital-consent-verification"
                label="Verification Acknowledgement"
                onChange={(checked) =>
                  form.setValue("consent_hospital_verification", checked, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
              <FieldError message={errors.consent_hospital_verification?.message} />
            </div>
          ) : null}

          <input type="hidden" {...form.register("email")} />
          <input type="hidden" {...form.register("phone")} />

          <div className="flex items-center justify-between gap-3 pt-2">
            <Button
              disabled={step === 0}
              type="button"
              variant="outline"
              onClick={() => setStep((current) => Math.max(current - 1, 0))}
            >
              Back
            </Button>
            {step === STEP_CONFIG.length - 1 ? (
              <Button type="submit">Create Hospital Account</Button>
            ) : (
              <Button type="button" onClick={() => void handleNext()}>
                Continue
              </Button>
            )}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link className="font-medium text-brand hover:text-brand/80" href="/login?account=hospital">
              Log in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
