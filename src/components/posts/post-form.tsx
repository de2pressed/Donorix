"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Building2, IdCard, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { PhoneInput } from "@/components/shared/phone-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { BLOOD_TYPES } from "@/lib/constants";
import { authenticatedFetch } from "@/lib/supabase/authenticated-fetch";
import { createPostSchema, type CreatePostInput } from "@/lib/validations/post";
import type { HospitalAccount } from "@/types/user";

type PostFormValues = z.input<typeof createPostSchema>;

const STEP_CONFIG = [
  {
    title: "Patient Details",
    description: "Capture the patient identity and the exact blood requirement.",
    fields: ["patient_name", "patient_id", "blood_type_needed", "units_needed"] as const,
  },
  {
    title: "Contact Information",
    description: "This contact is used for donor coordination and hospital follow-up.",
    fields: ["contact_name", "contact_phone", "contact_email"] as const,
  },
  {
    title: "Medical Details",
    description: "Add the medical reason and the exact time by which blood is needed.",
    fields: ["medical_condition", "additional_notes", "required_by"] as const,
  },
  {
    title: "Request Settings",
    description: "Control urgency and the donor notification radius for this patient.",
    fields: ["initial_radius_km", "is_emergency"] as const,
  },
  {
    title: "Confirm & Post",
    description: "Review the request before publishing it to matched donors.",
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

export function PostForm({ hospital }: { hospital: HospitalAccount }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [requiredDate, setRequiredDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const [requiredTime, setRequiredTime] = useState(() => {
    const now = new Date();
    now.setHours(now.getHours() + 2, 0, 0, 0);
    return now.toTimeString().slice(0, 5);
  });

  const form = useForm<PostFormValues, unknown, CreatePostInput>({
    resolver: zodResolver(createPostSchema),
    mode: "onTouched",
    defaultValues: {
      patient_name: "",
      patient_id: "",
      initial_radius_km: 25,
      units_needed: 1,
      is_emergency: false,
      required_by: "",
      medical_condition: "",
      additional_notes: "",
      contact_email: hospital.official_contact_email,
      contact_phone: hospital.official_contact_phone,
      contact_name: hospital.contact_person_name,
    },
  });

  const currentStep = STEP_CONFIG[step];
  const progress = ((step + 1) / STEP_CONFIG.length) * 100;
  const radius = Number(form.watch("initial_radius_km") ?? 25);
  const emergency = Boolean(form.watch("is_emergency"));

  useEffect(() => {
    if (!requiredDate || !requiredTime) {
      form.setValue("required_by", "", { shouldDirty: false, shouldValidate: false });
      return;
    }

    const isoDate = new Date(`${requiredDate}T${requiredTime}`).toISOString();
    form.setValue("required_by", isoDate, {
      shouldDirty: true,
      shouldValidate: step === 2 && Boolean(requiredDate) && Boolean(requiredTime),
    });
  }, [form, requiredDate, requiredTime, step]);

  async function handleNext() {
    if (!currentStep.fields.length) return;
    const isValid = await form.trigger([...currentStep.fields], { shouldFocus: true });
    if (!isValid) return;
    setStep((current) => Math.min(current + 1, STEP_CONFIG.length - 1));
  }

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const response = await authenticatedFetch("/api/posts", {
        method: "POST",
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
  const requiredBy = form.watch("required_by");

  return (
    <Card className="w-full max-w-4xl overflow-hidden">
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
          <div className="grid gap-4 rounded-[1.5rem] border border-border bg-muted/30 p-4 md:grid-cols-2">
            <div className="rounded-[1.25rem] border border-border bg-card px-4 py-3">
              <p className="flex items-center gap-2 text-sm font-medium">
                <Building2 className="size-4 text-brand" />
                Hospital
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{hospital.hospital_name}</p>
            </div>
            <div className="rounded-[1.25rem] border border-border bg-card px-4 py-3">
              <p className="flex items-center gap-2 text-sm font-medium">
                <MapPin className="size-4 text-brand" />
                Location
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {hospital.address}, {hospital.city}, {hospital.state}
              </p>
            </div>
          </div>

          {step === 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <FieldBlock error={errors.patient_name?.message} htmlFor="patient_name" label="Patient Name">
                <Input id="patient_name" placeholder="Enter the patient name" {...form.register("patient_name")} />
              </FieldBlock>
              <FieldBlock
                error={errors.patient_id?.message}
                htmlFor="patient_id"
                label="Patient ID / Internal Reference"
                note="Use the hospital's internal patient or case reference."
              >
                <div className="relative">
                  <IdCard className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="patient_id"
                    className="pl-11"
                    placeholder="Enter the patient ID"
                    {...form.register("patient_id")}
                  />
                </div>
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
          ) : null}

          {step === 1 ? (
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
                <FieldBlock error={errors.contact_email?.message} htmlFor="contact_email" label="Contact Email">
                  <Input
                    id="contact_email"
                    placeholder="Enter the official coordination email"
                    type="email"
                    {...form.register("contact_email")}
                  />
                </FieldBlock>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-4">
              <FieldBlock
                error={errors.medical_condition?.message}
                htmlFor="medical_condition"
                label="Medical Condition / Disease"
                note="E.g. surgery, accident, anaemia, thalassemia, dengue. Be as specific as possible to help match the right donors."
              >
                <Textarea
                  id="medical_condition"
                  placeholder="Describe the reason blood is required"
                  {...form.register("medical_condition")}
                />
              </FieldBlock>
              <FieldBlock error={errors.additional_notes?.message} htmlFor="additional_notes" label="Additional Notes">
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
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground" htmlFor="required_date">
                      Date
                    </label>
                    <Input
                      id="required_date"
                      type="date"
                      value={requiredDate}
                      onChange={(event) => setRequiredDate(event.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground" htmlFor="required_time">
                      Time
                    </label>
                    <Input
                      id="required_time"
                      placeholder="Select time"
                      type="time"
                      value={requiredTime}
                      onChange={(event) => setRequiredTime(event.target.value)}
                    />
                  </div>
                </div>
                <FieldError message={errors.required_by?.message} />
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-5">
              <div className="rounded-[1.5rem] border border-border p-4">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium">Notification Radius</p>
                    <p className="text-muted-foreground">
                      Expand the initial donor search radius between 5 km and 35 km.
                    </p>
                  </div>
                  <span className="min-w-[4.5rem] text-right font-semibold tabular-nums">{radius} km</span>
                </div>
                <Slider
                  className="mt-4"
                  max={35}
                  min={5}
                  step={1}
                  value={[radius]}
                  onValueChange={(value) =>
                    form.setValue("initial_radius_km", value[0] ?? 25, { shouldDirty: true })
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
                      Emergency mode boosts ranking, pulses the request card, and prioritizes high-value donor outreach.
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
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-4 rounded-[1.5rem] border border-border bg-muted/30 p-5">
              <div>
                <h3 className="text-lg font-semibold">Review request summary</h3>
                <p className="text-sm text-muted-foreground">
                  Confirm the details below before sending this request live.
                </p>
              </div>
              <div className="grid gap-3 text-sm md:grid-cols-2">
                <p><span className="font-medium text-foreground">Patient Name:</span> {form.watch("patient_name")}</p>
                <p><span className="font-medium text-foreground">Patient ID:</span> {form.watch("patient_id")}</p>
                <p><span className="font-medium text-foreground">Blood Type:</span> {form.watch("blood_type_needed")}</p>
                <p>
                  <span className="font-medium text-foreground">Units Needed:</span>{" "}
                  {Number(form.watch("units_needed") ?? 0)} units
                </p>
                <p><span className="font-medium text-foreground">Hospital:</span> {hospital.hospital_name}</p>
                <p><span className="font-medium text-foreground">Hospital Address:</span> {hospital.address}</p>
                <p><span className="font-medium text-foreground">Location:</span> {hospital.city}, {hospital.state}</p>
                <p><span className="font-medium text-foreground">Contact Person:</span> {form.watch("contact_name")}</p>
                <p><span className="font-medium text-foreground">Contact Phone:</span> {form.watch("contact_phone")}</p>
                <p><span className="font-medium text-foreground">Medical Condition:</span> {form.watch("medical_condition")}</p>
                <p>
                  <span className="font-medium text-foreground">Required By:</span>{" "}
                  {requiredBy
                    ? new Date(requiredBy).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "Not set"}
                </p>
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
