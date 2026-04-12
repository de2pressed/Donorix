"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Ref } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { PhoneInput } from "@/components/shared/phone-input";
import { SearchablePicker } from "@/components/shared/searchable-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { BLOOD_TYPES } from "@/lib/constants";
import { getCitiesForRegion, INDIAN_REGION_NAMES } from "@/lib/india-locations";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { signupProfileSeedSchema, signupSchema } from "@/lib/validations/auth";
import { cn } from "@/lib/utils/cn";

type SignupValues = z.input<typeof signupSchema>;
type SignupSubmitValues = z.output<typeof signupSchema>;
type SignupFieldName = keyof SignupSubmitValues;

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non_binary", label: "Non-binary" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
] as const;

const STEP_CONFIG: Array<{
  title: string;
  description: string;
  fields: SignupFieldName[];
}> = [
  {
    title: "Account Basics",
    description: "Set the identity details you will use across Donorix.",
    fields: ["full_name", "username", "email"],
  },
  {
    title: "Security",
    description: "Create a strong password you can safely remember.",
    fields: ["password", "confirm_password"],
  },
  {
    title: "Contact & Identity",
    description: "We use this to validate donor eligibility and contact readiness.",
    fields: ["phone", "date_of_birth", "gender"],
  },
  {
    title: "Health Profile",
    description: "These details determine the basic eligibility baseline.",
    fields: ["blood_type", "weight_kg"],
  },
  {
    title: "Location",
    description: "Accurate city and state selection keeps matching reliable.",
    fields: ["state", "city", "pincode"],
  },
  {
    title: "Health Declarations",
    description: "Declare any medical conditions that could affect donation screening.",
    fields: ["has_chronic_disease", "is_smoker", "is_on_medication"],
  },
  {
    title: "Consent",
    description: "Review the mandatory legal consents before creating your account.",
    fields: ["consent_terms", "consent_privacy", "consent_notifications"],
  },
];

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
  inputRef,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  inputRef?: Ref<HTMLInputElement>;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-4 rounded-[1.5rem] border border-border bg-card/70 p-4 transition hover:border-brand/40 hover:bg-brand-soft/40",
        checked && "border-brand/40 bg-brand-soft/50",
      )}
      htmlFor={id}
    >
      <input
        checked={checked}
        className="mt-1 size-4 rounded border-border text-brand focus:ring-brand"
        id={id}
        ref={inputRef}
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

export function SignupForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const firstFieldRef = useRef<HTMLElement | null>(null);

  const form = useForm<SignupValues, unknown, SignupSubmitValues>({
    resolver: zodResolver(signupSchema),
    mode: "onTouched",
    defaultValues: {
      has_chronic_disease: false,
      is_smoker: false,
      is_on_medication: false,
      consent_notifications: true,
    },
  });

  const currentStep = STEP_CONFIG[step];
  const progress = ((step + 1) / STEP_CONFIG.length) * 100;
  const selectedState = form.watch("state");
  const cityOptions = useMemo(() => getCitiesForRegion(selectedState), [selectedState]);
  const maxAdultDate = useMemo(() => {
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 18);
    const year = cutoff.getFullYear();
    const month = String(cutoff.getMonth() + 1).padStart(2, "0");
    const day = String(cutoff.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);
  const hasChronicDisease = Boolean(form.watch("has_chronic_disease"));
  const isSmoker = Boolean(form.watch("is_smoker"));
  const isOnMedication = Boolean(form.watch("is_on_medication"));
  const noneOfTheAbove = !hasChronicDisease && !isSmoker && !isOnMedication;

  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      firstFieldRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(rafId);
  }, [step]);

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

    const password = values.password;
    const profileSeed = signupProfileSeedSchema.parse(values);

    const { error } = await supabase.auth.signUp({
      email: values.email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        data: profileSeed,
      },
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Account created. Verify your email to continue.");
    router.push("/login");
  });

  const errors = form.formState.errors;
  const fullNameField = form.register("full_name");
  const dateOfBirthField = form.register("date_of_birth");
  const passwordField = form.register("password");
  const weightField = form.register("weight_kg", { valueAsNumber: true });

  function assignFirstFieldRef<T extends HTMLElement>(registerRef?: (instance: T | null) => void) {
    return (instance: T | null) => {
      firstFieldRef.current = instance;
      registerRef?.(instance);
    };
  }

  function setFirstFieldElement(instance: HTMLElement | null) {
    firstFieldRef.current = instance;
  }

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
          <Progress aria-label={`Signup progress: step ${step + 1} of ${STEP_CONFIG.length}`} value={progress} />
        </div>
        <div>
          <CardTitle>{currentStep.title}</CardTitle>
          <CardDescription>{currentStep.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={onSubmit}>
          {step === 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <FieldShell
                error={errors.full_name?.message}
                htmlFor="full_name"
                label="Full Name"
              >
                <Input
                  id="full_name"
                  placeholder="Enter your full name"
                  {...fullNameField}
                  ref={assignFirstFieldRef<HTMLInputElement>(fullNameField.ref)}
                />
              </FieldShell>
              <FieldShell
                error={errors.username?.message}
                htmlFor="username"
                label="Username"
              >
                <Input
                  id="username"
                  placeholder="Choose a unique username"
                  {...form.register("username")}
                />
              </FieldShell>
              <div className="md:col-span-2">
                <FieldShell error={errors.email?.message} htmlFor="email" label="Email">
                  <Input
                    id="email"
                    placeholder="Enter your email address"
                    type="email"
                    {...form.register("email")}
                  />
                </FieldShell>
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="grid gap-4">
              <FieldShell
                error={errors.password?.message}
                htmlFor="password"
                label="Password"
              >
                <div className="relative">
                  <Input
                    id="password"
                    className="pr-14"
                    placeholder="Create a strong password"
                    type={showPassword ? "text" : "password"}
                    {...passwordField}
                    ref={assignFirstFieldRef<HTMLInputElement>(passwordField.ref)}
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
              </FieldShell>
              <FieldShell
                error={errors.confirm_password?.message}
                htmlFor="confirm_password"
                label="Confirm Password"
              >
                <div className="relative">
                  <Input
                    id="confirm_password"
                    className="pr-14"
                    placeholder="Re-enter your password"
                    type={showConfirmPassword ? "text" : "password"}
                    {...form.register("confirm_password")}
                  />
                  <Button
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
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

          {step === 2 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <FieldShell error={errors.phone?.message} htmlFor="phone" label="Phone Number">
                  <Controller
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <PhoneInput
                        id="phone"
                        inputRef={assignFirstFieldRef<HTMLInputElement>()}
                        value={field.value ?? ""}
                        onBlur={field.onBlur}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </FieldShell>
              </div>

              <div className="md:col-span-2">
                <FieldShell
                  error={errors.date_of_birth?.message}
                  htmlFor="date_of_birth"
                  label="Date of Birth"
                  note="Use the native date picker. You must be at least 18 years old to register."
                >
                  <Input
                    id="date_of_birth"
                    max={maxAdultDate}
                    type="date"
                    {...dateOfBirthField}
                    ref={assignFirstFieldRef<HTMLInputElement>(dateOfBirthField.ref)}
                  />
                </FieldShell>
              </div>

              <div className="md:col-span-2">
                <FieldShell error={errors.gender?.message} htmlFor="gender" label="Gender">
                  <select
                    className="h-11 w-full rounded-2xl border border-border bg-card/80 px-4 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    id="gender"
                    value={form.watch("gender") ?? ""}
                    onChange={(event) =>
                      form.setValue("gender", event.target.value as SignupValues["gender"], {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  >
                    <option value="">Select Gender</option>
                    {GENDER_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FieldShell>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <FieldShell error={errors.blood_type?.message} htmlFor="blood_type" label="Blood Type">
                <select
                  className="h-11 w-full rounded-2xl border border-border bg-card/80 px-4 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  id="blood_type"
                  ref={(instance) => setFirstFieldElement(instance)}
                  value={form.watch("blood_type") ?? ""}
                  onChange={(event) =>
                    form.setValue("blood_type", event.target.value as SignupValues["blood_type"], {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                >
                  <option value="">Select Blood Type</option>
                  {BLOOD_TYPES.map((bloodType) => (
                    <option key={bloodType} value={bloodType}>
                      {bloodType}
                    </option>
                  ))}
                </select>
              </FieldShell>
              <FieldShell
                error={errors.weight_kg?.message}
                htmlFor="weight_kg"
                label="Weight (kg)"
                note="Donors must weigh at least 50 kg as per Indian medical guidelines"
              >
                <Input
                  id="weight_kg"
                  max={200}
                  min={50}
                  placeholder="Enter your weight in kg"
                  type="number"
                  {...weightField}
                  ref={assignFirstFieldRef<HTMLInputElement>(weightField.ref)}
                  onKeyDown={(event) => {
                    if (["-", "+", "e", "E"].includes(event.key)) {
                      event.preventDefault();
                    }
                  }}
                />
              </FieldShell>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <FieldShell error={errors.state?.message} htmlFor="state-picker" label="State">
                  <SearchablePicker
                    description="Search all Indian states and union territories."
                    emptyMessage="No state or union territory matches that search."
                    id="state-picker"
                    options={INDIAN_REGION_NAMES}
                    placeholder="Select State"
                    searchPlaceholder="Search state or union territory"
                    title="Select state"
                    triggerRef={(instance) => setFirstFieldElement(instance)}
                    value={selectedState}
                    onChange={(value) => {
                      form.setValue("state", value, { shouldDirty: true, shouldValidate: true });
                      form.setValue("city", "", { shouldDirty: true });
                    }}
                  />
                </FieldShell>
              </div>
              <div className="md:col-span-2">
                <FieldShell error={errors.city?.message} htmlFor="city-picker" label="City">
                  <SearchablePicker
                    description="Choose the city or district that best matches your current location."
                    disabled={!selectedState}
                    emptyMessage={
                      selectedState
                        ? "No city matches that search."
                        : "Select a state before choosing a city."
                    }
                    id="city-picker"
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
              <div className="md:col-span-2">
                <FieldShell error={errors.pincode?.message} htmlFor="pincode" label="Pincode">
                  <Input
                    id="pincode"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit pincode"
                    {...form.register("pincode")}
                  />
                </FieldShell>
              </div>
            </div>
          ) : null}

          {step === 5 ? (
            <div className="space-y-4">
              <div className="grid gap-4">
                <ToggleCard
                  checked={noneOfTheAbove}
                  description="Select this if none of the listed health declarations apply to you right now."
                  id="health_none"
                  inputRef={(instance) => setFirstFieldElement(instance)}
                  label="None of the above"
                  onChange={(checked) => {
                    if (!checked) return;
                    form.setValue("has_chronic_disease", false, { shouldDirty: true });
                    form.setValue("is_smoker", false, { shouldDirty: true });
                    form.setValue("is_on_medication", false, { shouldDirty: true });
                  }}
                />
                <ToggleCard
                  checked={hasChronicDisease}
                  description="Tell us if you currently live with any chronic disease that could affect donor eligibility."
                  id="has_chronic_disease"
                  label="Chronic Disease"
                  onChange={(checked) =>
                    form.setValue("has_chronic_disease", checked, { shouldDirty: true })
                  }
                />
                <ToggleCard
                  checked={isSmoker}
                  description="Smoking status helps clinical staff review your donor suitability safely."
                  id="is_smoker"
                  label="Smoker"
                  onChange={(checked) => form.setValue("is_smoker", checked, { shouldDirty: true })}
                />
                <ToggleCard
                  checked={isOnMedication}
                  description="Ongoing medication may affect donation timing or require medical review."
                  id="is_on_medication"
                  label="On Medication"
                  onChange={(checked) =>
                    form.setValue("is_on_medication", checked, { shouldDirty: true })
                  }
                />
              </div>
            </div>
          ) : null}

          {step === 6 ? (
            <div className="space-y-4">
              <ToggleCard
                checked={Boolean(form.watch("consent_terms"))}
                description="I have read and agree to the Terms of Use."
                id="consent_terms"
                inputRef={(instance) => setFirstFieldElement(instance)}
                label="Terms of Use"
                onChange={(checked) =>
                  form.setValue("consent_terms", checked, { shouldDirty: true, shouldValidate: true })
                }
              />
              <FieldError message={errors.consent_terms?.message} />

              <ToggleCard
                checked={Boolean(form.watch("consent_privacy"))}
                description="I have read and agree to the Privacy Policy."
                id="consent_privacy"
                label="Privacy Policy"
                onChange={(checked) =>
                  form.setValue("consent_privacy", checked, { shouldDirty: true, shouldValidate: true })
                }
              />
              <FieldError message={errors.consent_privacy?.message} />

              <ToggleCard
                checked={Boolean(form.watch("consent_notifications"))}
                description="Allow Donorix to send request alerts, approvals, and safety notifications."
                id="consent_notifications"
                label="Notification Consent"
                onChange={(checked) =>
                  form.setValue("consent_notifications", checked, { shouldDirty: true, shouldValidate: true })
                }
              />
            </div>
          ) : null}

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
              <Button type="submit">Create Account</Button>
            ) : (
              <Button type="button" onClick={() => void handleNext()}>
                Continue
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
