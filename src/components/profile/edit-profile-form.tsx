"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { PhoneInput } from "@/components/shared/phone-input";
import { SearchablePicker } from "@/components/shared/searchable-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { INDIAN_LANGUAGES } from "@/lib/constants";
import { getCitiesForRegion, INDIAN_REGION_NAMES } from "@/lib/india-locations";
import { profileSchema, type ProfileInput } from "@/lib/validations/profile";
import type { Profile } from "@/types/user";

export function EditProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    mode: "onTouched",
    defaultValues: {
      full_name: profile.full_name,
      username: profile.username,
      phone: profile.phone,
      blood_type: profile.blood_type as ProfileInput["blood_type"],
      city: profile.city,
      state: profile.state,
      pincode: profile.pincode,
      preferred_language: profile.preferred_language,
      is_available: profile.is_available,
      consent_notifications: profile.consent_notifications,
    },
  });

  const selectedState = form.watch("state");
  const cityOptions = useMemo(() => getCitiesForRegion(selectedState), [selectedState]);

  const onSubmit = form.handleSubmit(async (values) => {
    const response = await fetch("/api/users/me", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      toast.error(payload?.error ?? "Unable to update profile");
      return;
    }

    toast.success("Profile updated");
    router.refresh();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="profile-full-name">
              Full Name
            </label>
            <Input id="profile-full-name" placeholder="Enter your full name" {...form.register("full_name")} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="profile-username">
              Username
            </label>
            <Input id="profile-username" placeholder="Choose a username" {...form.register("username")} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium" htmlFor="profile-phone">
              Phone Number
            </label>
            <Controller
              control={form.control}
              name="phone"
              render={({ field }) => (
                <PhoneInput id="profile-phone" value={field.value} onBlur={field.onBlur} onChange={field.onChange} />
              )}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium" htmlFor="profile-state">
              State
            </label>
            <SearchablePicker
              description="Search all Indian states and union territories."
              emptyMessage="No state matches that search."
              id="profile-state"
              options={INDIAN_REGION_NAMES}
              placeholder="Select State"
              searchPlaceholder="Search state"
              title="Select state"
              value={selectedState}
              onChange={(value) => {
                form.setValue("state", value, { shouldDirty: true, shouldValidate: true });
                form.setValue("city", "", { shouldDirty: true });
              }}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium" htmlFor="profile-city">
              City
            </label>
            <SearchablePicker
              description="Choose the city or district closest to you."
              disabled={!selectedState}
              emptyMessage={selectedState ? "No city matches that search." : "Select state first."}
              id="profile-city"
              options={cityOptions}
              placeholder={selectedState ? "Select City" : "Select state first"}
              searchPlaceholder="Search city"
              title="Select city"
              value={form.watch("city")}
              onChange={(value) => form.setValue("city", value, { shouldDirty: true, shouldValidate: true })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="profile-pincode">
              Pincode
            </label>
            <Input id="profile-pincode" inputMode="numeric" maxLength={6} placeholder="Enter 6-digit pincode" {...form.register("pincode")} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="profile-language">
              Preferred language
            </label>
            <select
              className="h-11 w-full rounded-2xl border border-border bg-card/80 px-4 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="profile-language"
              {...form.register("preferred_language")}
            >
              {INDIAN_LANGUAGES.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <Button type="submit">Save changes</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
