"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { profileSchema, type ProfileInput } from "@/lib/validations/profile";
import type { Profile } from "@/types/user";

export function EditProfileForm({ profile }: { profile: Profile }) {
  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile.full_name,
      username: profile.username,
      blood_type: profile.blood_type as ProfileInput["blood_type"],
      city: profile.city,
      state: profile.state,
      pincode: profile.pincode,
      preferred_language: profile.preferred_language,
      is_available: profile.is_available,
      consent_notifications: profile.consent_notifications,
    },
  });

  const onSubmit = form.handleSubmit(() => {
    toast.info("Profile update endpoint is ready to connect to Supabase.");
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          <Input placeholder="Full name" {...form.register("full_name")} />
          <Input placeholder="Username" {...form.register("username")} />
          <Input placeholder="City" {...form.register("city")} />
          <Input placeholder="State" {...form.register("state")} />
          <Input placeholder="Pincode" {...form.register("pincode")} />
          <Input placeholder="Preferred language" {...form.register("preferred_language")} />
          <div className="md:col-span-2">
            <Button type="submit">Save changes</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
