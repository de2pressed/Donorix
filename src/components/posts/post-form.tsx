"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { BloodTypeBadge } from "@/components/ui/blood-type-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { BLOOD_TYPES } from "@/lib/constants";
import { createPostSchema, type CreatePostInput } from "@/lib/validations/post";

type PostFormValues = z.input<typeof createPostSchema>;

export function PostForm() {
  const router = useRouter();
  const form = useForm<PostFormValues, unknown, CreatePostInput>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      initial_radius_km: 7,
      units_needed: 1,
      is_emergency: false,
      required_by: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const response = await fetch("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...values,
        required_by: new Date(values.required_by).toISOString(),
      }),
    });

    if (!response.ok) {
      toast.error("Unable to create request");
      return;
    }

    toast.success("Blood request published");
    router.push("/");
  });

  const radius = Number(form.watch("initial_radius_km") ?? 7);
  const emergency = Boolean(form.watch("is_emergency"));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create blood request</CardTitle>
        <CardDescription>
          Validate the need, set an initial donor radius, and publish with emergency-first visibility.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input placeholder="Patient name" {...form.register("patient_name")} />
            <Input placeholder="Hospital name" {...form.register("hospital_name")} />
            <Input placeholder="Hospital address" {...form.register("hospital_address")} />
            <Input placeholder="City" {...form.register("city")} />
            <Input placeholder="State" {...form.register("state")} />
            <Input placeholder="Contact name" {...form.register("contact_name")} />
            <Input placeholder="Contact phone (+91...)" {...form.register("contact_phone")} />
            <Input placeholder="Contact email (optional)" {...form.register("contact_email")} />
            <Input
              placeholder="Units needed"
              type="number"
              step="0.1"
              {...form.register("units_needed", { valueAsNumber: true })}
            />
            <Input placeholder="Required by (ISO date-time)" type="datetime-local" {...form.register("required_by")} />
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Blood type needed</p>
            <div className="flex flex-wrap gap-2">
              {BLOOD_TYPES.map((bloodType) => (
                <button
                  key={bloodType}
                  className={`rounded-full border px-4 py-2 text-sm ${
                    form.watch("blood_type_needed") === bloodType
                      ? "border-brand bg-brand-soft text-brand"
                      : "border-border"
                  }`}
                  type="button"
                  onClick={() => form.setValue("blood_type_needed", bloodType)}
                >
                  <BloodTypeBadge bloodType={bloodType} urgent={emergency} />
                </button>
              ))}
            </div>
          </div>

          <Textarea placeholder="Medical condition" {...form.register("medical_condition")} />
          <Textarea placeholder="Additional notes" {...form.register("additional_notes")} />

          <div className="rounded-[1.5rem] border border-border p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">Emergency request</p>
                <p className="text-sm text-muted-foreground">
                  Unlocks direct contact visibility and top-of-feed scoring.
                </p>
              </div>
              <Switch
                checked={emergency}
                onCheckedChange={(checked) => form.setValue("is_emergency", checked)}
              />
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-border p-4">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span>Initial donor radius</span>
              <span className="font-semibold">{radius} km</span>
            </div>
            <Slider
              className="mt-4"
              max={35}
              min={1}
              step={1}
              value={[radius]}
              onValueChange={(value) => form.setValue("initial_radius_km", value[0])}
            />
          </div>

          <Button type="submit">Publish request</Button>
        </form>
      </CardContent>
    </Card>
  );
}
