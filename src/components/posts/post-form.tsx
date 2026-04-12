"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { PhoneInput } from "@/components/shared/phone-input";
import { SearchablePicker } from "@/components/shared/searchable-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { BLOOD_TYPES } from "@/lib/constants";
import { getCitiesForRegion, INDIAN_REGION_NAMES } from "@/lib/india-locations";
import { createPostSchema, type CreatePostInput } from "@/lib/validations/post";

type PostFormValues = z.input<typeof createPostSchema>;

const STEP_CONFIG = [
  {
    title: "Patient Details",
    description: "Capture the core medical need before moving into logistics.",
    fields: ["patient_name", "blood_type_needed", "units_needed"] as const,
  },
  {
    title: "Hospital & Location",
    description: "Use accurate hospital and city data so matching stays reliable.",
    fields: ["hospital_name", "hospital_address", "state", "city"] as const,
  },
  {
    title: "Contact Information",
    description: "These details are used for donor outreach and emergency coordination.",
    fields: ["contact_name", "contact_phone", "contact_email"] as const,
  },
  {
    title: "Medical Details",
    description: "Add medical context and the exact deadline for this request.",
    fields: ["medical_condition", "additional_notes", "required_by"] as const,
  },
  {
    title: "Request Settings",
    description: "Control the radius, emergency mode, and how the request is distributed.",
    fields: ["initial_radius_km", "is_emergency"] as const,
  },
  {
    title: "Confirm & Post",
    description: "Review every detail before sending the request live.",
    fields: [] as const,
  },
] as const;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-danger">{message}</p>;
}

function FieldBlock({
  label,
  htmlFor,
  error,
  children,
  note,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
  note?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {note ? <p className="text-xs text-muted-foreground">{note}</p> : null}
      <FieldError message={error} />
    </div>
  );
}

function getRequestErrorMessage(payload: unknown) {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (payload && typeof payload === "object" && "error" in payload) {
    const error = (payload as { error?: unknown }).error;

    if (typeof error === "string" && error.trim()) {
      return error;
    }

    if (error && typeof error === "object" && "formErrors" in error) {
      const formErrors = (error as { formErrors?: string[] }).formErrors;
      if (Array.isArray(formErrors) && formErrors[0]) {
        return formErrors[0];
      }
    }
  }

  return "Unable to create request";
}

export function PostForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [requiredDate, setRequiredDate] = useState("");
  const [requiredTime, setRequiredTime] = useState("");

  const form = useForm<PostFormValues, unknown, CreatePostInput>({
    resolver: zodResolver(createPostSchema),
    mode: "onTouched",
    defaultValues: {
      initial_radius_km: 7,
      units_needed: 1,
      is_emergency: false,
      required_by: "",
      medical_condition: "",
      additional_notes: "",
      contact_email: "",
    },
  });

  const currentStep = STEP_CONFIG[step];
  const progress = ((step + 1) / STEP_CONFIG.length) * 100;
  const selectedState = form.watch("state");
  const cityOptions = useMemo(() => getCitiesForRegion(selectedState), [selectedState]);
  const radius = Number(form.watch("initial_radius_km") ?? 7);
  const emergency = Boolean(form.watch("is_emergency"));

  useEffect(() => {
    if (!requiredDate || !requiredTime) {
      form.setValue("required_by", "", { shouldDirty: true });
      return;
    }

    const localDate = `${requiredDate}T${requiredTime}`;
    const isoDate = new Date(localDate).toISOString();
    form.setValue("required_by", isoDate, { shouldDirty: true, shouldValidate: step === 3 });
  }, [form, requiredDate, requiredTime, step]);

  async function handleNext() {
    if (!currentStep.fields.length) return;
    const isValid = await form.trigger([...currentStep.fields], { shouldFocus: true });
    if (!isValid) return;
    setStep((current) => Math.min(current + 1, STEP_CONFIG.length - 1));
  }

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(getRequestErrorMessage(payload));
        return;
      }

      toast.success("Blood request published");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Unable to create request");
    }
  });

  const errors = form.formState.errors;

  return (
    <Card className="w-full max-w-3xl overflow-hidden">
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
            <div className="grid gap-4 md:grid-cols-2">
              <FieldBlock error={errors.patient_name?.message} htmlFor="patient_name" label="Patient Name">
                <Input id="patient_name" placeholder="Enter the patient name" {...form.register("patient_name")} />
              </FieldBlock>
              <FieldBlock error={errors.blood_type_needed?.message} htmlFor="blood_type_needed" label="Blood Type Needed">
                <select
                  className="h-11 w-full rounded-2xl border border-border bg-card/80 px-4 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  id="blood_type_needed"
                  value={form.watch("blood_type_needed") ?? ""}
                  onBlur={() => void form.trigger("blood_type_needed")}
                  onChange={(event) =>
                    form.setValue(
                      "blood_type_needed",
                      event.target.value as PostFormValues["blood_type_needed"],
                      { shouldDirty: true },
                    )
                  }
                >
                  <option value="">Select blood type</option>
                  {BLOOD_TYPES.map((bloodType) => (
                    <option key={bloodType} value={bloodType}>
                      {bloodType}
                    </option>
                  ))}
                </select>
              </FieldBlock>
              <div className="md:col-span-2">
                <FieldBlock
                  error={errors.units_needed?.message}
                  htmlFor="units_needed"
                  label="Units Needed"
                  note="Enter the number of blood units required."
                >
                  <Input
                    id="units_needed"
                    max={10}
                    min={1}
                    placeholder="Enter the number of units required"
                    step="1"
                    type="number"
                    {...form.register("units_needed", { valueAsNumber: true })}
                    onKeyDown={(event) => {
                      if ([".", "-", "+", "e", "E"].includes(event.key)) {
                        event.preventDefault();
                      }
                    }}
                  />
                </FieldBlock>
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <FieldBlock error={errors.hospital_name?.message} htmlFor="hospital_name" label="Hospital Name">
                <Input id="hospital_name" placeholder="Enter the hospital name" {...form.register("hospital_name")} />
              </FieldBlock>
              <FieldBlock error={errors.hospital_address?.message} htmlFor="hospital_address" label="Hospital Address">
                <Input
                  id="hospital_address"
                  placeholder="Enter the hospital address"
                  {...form.register("hospital_address")}
                />
              </FieldBlock>
              <div className="md:col-span-2">
                <FieldBlock error={errors.state?.message} htmlFor="request-state" label="State">
                  <SearchablePicker
                    description="Search all Indian states and union territories."
                    emptyMessage="No state or union territory matches that search."
                    id="request-state"
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
                </FieldBlock>
              </div>
              <div className="md:col-span-2">
                <FieldBlock error={errors.city?.message} htmlFor="request-city" label="City">
                  <SearchablePicker
                    description="Choose the city or district nearest to the hospital."
                    disabled={!selectedState}
                    emptyMessage={selectedState ? "No city matches that search." : "Select state first."}
                    id="request-city"
                    options={cityOptions}
                    placeholder={selectedState ? "Select City" : "Select state first"}
                    searchPlaceholder="Search city or district"
                    title="Select city"
                    value={form.watch("city") ?? undefined}
                    onChange={(value) =>
                      form.setValue("city", value, { shouldDirty: true, shouldValidate: true })
                    }
                  />
                </FieldBlock>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <FieldBlock error={errors.contact_name?.message} htmlFor="contact_name" label="Contact Person Name">
                <Input id="contact_name" placeholder="Enter the contact person's name" {...form.register("contact_name")} />
              </FieldBlock>
              <FieldBlock error={errors.contact_phone?.message} htmlFor="contact_phone" label="Contact Phone Number">
                <Controller
                  control={form.control}
                  name="contact_phone"
                  render={({ field }) => (
                    <PhoneInput
                      id="contact_phone"
                      value={field.value ?? ""}
                      onBlur={field.onBlur}
                      onChange={field.onChange}
                    />
                  )}
                />
              </FieldBlock>
              <div className="md:col-span-2">
                <FieldBlock error={errors.contact_email?.message} htmlFor="contact_email" label="Contact Email (optional)">
                  <Input
                    id="contact_email"
                    placeholder="Enter an email address if available"
                    type="email"
                    {...form.register("contact_email")}
                  />
                </FieldBlock>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="grid gap-4">
              <FieldBlock error={errors.medical_condition?.message} htmlFor="medical_condition" label="Medical Condition / Disease (optional)">
                <Textarea
                  id="medical_condition"
                  placeholder="Describe the diagnosis or reason for transfusion"
                  {...form.register("medical_condition")}
                />
              </FieldBlock>
              <FieldBlock error={errors.additional_notes?.message} htmlFor="additional_notes" label="Additional Notes (optional)">
                <Textarea
                  id="additional_notes"
                  placeholder="Add any instructions, ward details, or coordination notes"
                  {...form.register("additional_notes")}
                />
              </FieldBlock>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="required_date">
                  Required By
                </label>
                <div className="grid gap-3 sm:grid-cols-[1fr_170px]">
                  <Input
                    id="required_date"
                    type="date"
                    value={requiredDate}
                    onChange={(event) => setRequiredDate(event.target.value)}
                  />
                  <Input
                    id="required_time"
                    placeholder="Select time"
                    type="time"
                    value={requiredTime}
                    onChange={(event) => setRequiredTime(event.target.value)}
                  />
                </div>
                <FieldError message={errors.required_by?.message} />
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-5">
              <div className="rounded-[1.5rem] border border-border p-4">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium">Notification Radius</p>
                    <p className="text-muted-foreground">
                      Expand the initial donor search radius between 1 km and 35 km.
                    </p>
                  </div>
                  <span className="min-w-[4.25rem] text-right font-semibold tabular-nums">{radius} km</span>
                </div>
                <Slider
                  className="mt-4"
                  max={35}
                  min={1}
                  step={1}
                  value={[radius]}
                  onValueChange={(value) =>
                    form.setValue("initial_radius_km", value[0] ?? 7, { shouldDirty: true })
                  }
                />
              </div>

              <div className="rounded-[1.5rem] border border-danger/40 bg-danger/5 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="flex items-center gap-2 font-medium text-danger">
                      <AlertTriangle className="size-4" />
                      Emergency Mode
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Emergency mode boosts ranking and widens coordination urgency. Misuse can lead to account suspension and admin review.
                    </p>
                  </div>
                  <Switch
                    checked={emergency}
                    onCheckedChange={(checked) =>
                      form.setValue("is_emergency", checked, { shouldDirty: true })
                    }
                  />
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-border bg-muted/30 p-4">
                <p className="font-medium">Quick Review</p>
                <div className="mt-3 grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
                  <p>
                    <span className="font-medium text-foreground">Patient:</span> {form.watch("patient_name") || "Not set"}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Blood Type:</span> {form.watch("blood_type_needed") || "Not set"}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Hospital:</span> {form.watch("hospital_name") || "Not set"}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Location:</span> {form.watch("city") || "Not set"}
                    {form.watch("state") ? `, ${form.watch("state")}` : ""}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {step === 5 ? (
            <div className="space-y-4 rounded-[1.5rem] border border-border bg-muted/30 p-5">
              <div>
                <h3 className="text-lg font-semibold">Review request summary</h3>
                <p className="text-sm text-muted-foreground">
                  Confirm the details below before sending this request live.
                </p>
              </div>
              <div className="grid gap-3 text-sm md:grid-cols-2">
                <p><span className="font-medium text-foreground">Patient Name:</span> {form.watch("patient_name")}</p>
                <p><span className="font-medium text-foreground">Blood Type:</span> {form.watch("blood_type_needed")}</p>
                <p>
                  <span className="font-medium text-foreground">Units Needed:</span>{" "}
                  {Number(form.watch("units_needed") ?? 0)} units
                </p>
                <p><span className="font-medium text-foreground">Hospital:</span> {form.watch("hospital_name")}</p>
                <p><span className="font-medium text-foreground">Hospital Address:</span> {form.watch("hospital_address")}</p>
                <p><span className="font-medium text-foreground">Location:</span> {form.watch("city")}, {form.watch("state")}</p>
                <p><span className="font-medium text-foreground">Contact Person:</span> {form.watch("contact_name")}</p>
                <p><span className="font-medium text-foreground">Contact Phone:</span> {form.watch("contact_phone")}</p>
                <p><span className="font-medium text-foreground">Contact Email:</span> {form.watch("contact_email") || "Not provided"}</p>
                <p><span className="font-medium text-foreground">Required By:</span> {form.watch("required_by") || "Not set"}</p>
                <p><span className="font-medium text-foreground">Radius:</span> {radius} km</p>
                <p><span className="font-medium text-foreground">Emergency:</span> {emergency ? "Yes" : "No"}</p>
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3">
            <Button
              disabled={step === 0}
              type="button"
              variant="outline"
              onClick={() => setStep((current) => Math.max(current - 1, 0))}
            >
              Back
            </Button>

            {step === STEP_CONFIG.length - 1 ? (
              <Button type="submit">Post Request</Button>
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
