"use client";

import { BellRing, Globe2, LockKeyhole, Shield, Smartphone } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { INDIAN_LANGUAGES } from "@/lib/constants";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    sms: false,
    push: true,
    email: true,
    discoverable: true,
    directContact: false,
    privateLeaderboard: false,
    radius: 25,
    language: "en",
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage notifications, language, privacy, and account controls from one place.
        </p>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <BellRing className="size-5 text-brand" />
              Notification preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                key: "sms" as const,
                icon: Smartphone,
                title: "SMS alerts",
                description: "Receive urgent donor and request alerts via SMS when that integration is enabled.",
              },
              {
                key: "push" as const,
                icon: BellRing,
                title: "Push notifications",
                description: "Get in-app notifications for approvals, matches, and request status changes.",
              },
              {
                key: "email" as const,
                icon: Globe2,
                title: "Email updates",
                description: "Receive account and safety updates by email.",
              },
            ].map((item) => (
              <div key={item.key} className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-border p-4">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-medium">
                    <item.icon className="size-4 text-brand" />
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                </div>
                <Switch
                  checked={settings[item.key]}
                  onCheckedChange={(checked) =>
                    setSettings((current) => ({ ...current, [item.key]: checked }))
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <Globe2 className="size-5 text-brand" />
              Language and radius
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="preferred-language">
                Preferred language
              </label>
              <select
                className="h-11 w-full rounded-2xl border border-border bg-card/80 px-4 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                id="preferred-language"
                value={settings.language}
                onChange={(event) =>
                  setSettings((current) => ({ ...current, language: event.target.value }))
                }
              >
                {INDIAN_LANGUAGES.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3 rounded-[1.5rem] border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">Notification radius</p>
                  <p className="text-sm text-muted-foreground">
                    Control how far Donorix should look for matches before automatic expansion.
                  </p>
                </div>
                <span className="text-sm font-semibold">{settings.radius} km</span>
              </div>
              <Slider
                max={50}
                min={5}
                step={1}
                value={[settings.radius]}
                onValueChange={(value) =>
                  setSettings((current) => ({ ...current, radius: value[0] ?? current.radius }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <Shield className="size-5 text-brand" />
              Privacy settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                key: "discoverable" as const,
                title: "Profile discoverability",
                description: "Allow your public profile to appear in donor matching and public rankings.",
              },
              {
                key: "directContact" as const,
                title: "Emergency direct contact",
                description: "Reveal your direct contact details only when an emergency approval is granted.",
              },
              {
                key: "privateLeaderboard" as const,
                title: "Hide from leaderboard",
                description: "Opt out of the public donor leaderboard while keeping emergency matching enabled.",
              },
            ].map((item) => (
              <div key={item.key} className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-border p-4">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                </div>
                <Switch
                  checked={settings[item.key]}
                  onCheckedChange={(checked) =>
                    setSettings((current) => ({ ...current, [item.key]: checked }))
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <LockKeyhole className="size-5 text-brand" />
              Account management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="change-password">
                  Change password
                </label>
                <Input id="change-password" placeholder="Enter a new password" type="password" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="confirm-password">
                  Confirm new password
                </label>
                <Input id="confirm-password" placeholder="Confirm the new password" type="password" />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button">Update password</Button>
              <Button type="button" variant="outline">
                Download account data
              </Button>
              <Button type="button" variant="danger">
                Delete account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
