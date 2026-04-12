"use client";

import { BellRing, Globe2, LockKeyhole, MoonStar, Shield, Smartphone, SunMedium } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useLocalePreference } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { INDIAN_LANGUAGES } from "@/lib/constants";
import { useUser } from "@/lib/hooks/use-user";
import { cn } from "@/lib/utils/cn";

type SettingsState = {
  sms: boolean;
  push: boolean;
  email: boolean;
  discoverable: boolean;
  directContact: boolean;
  privateLeaderboard: boolean;
  radius: number;
  language: string;
};

const defaultSettings: SettingsState = {
  sms: false,
  push: true,
  email: true,
  discoverable: true,
  directContact: false,
  privateLeaderboard: false,
  radius: 25,
  language: "en",
};

export default function SettingsPage() {
  const router = useRouter();
  const t = useTranslations("settings");
  const { locale, setLocalePreference } = useLocalePreference();
  const { resolvedTheme, setTheme } = useTheme();
  const { data: user } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);

  useEffect(() => {
    if (!user) return;

    setSettings((current) => ({
      ...current,
      push: user.consent_notifications,
      language: user.preferred_language || locale,
    }));
  }, [locale, user]);

  async function handleSave() {
    setIsSaving(true);

    try {
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          consent_notifications: settings.push,
          preferred_language: settings.language,
        }),
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        toast.error(payload?.error ?? t("error"));
        return;
      }

      await setLocalePreference(settings.language === "hi" ? "hi" : "en");
      router.refresh();
      toast.success(t("saved"));
    } catch {
      toast.error(t("error"));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button disabled={isSaving} type="button" onClick={() => void handleSave()}>
          {isSaving ? t("saving") : t("save")}
        </Button>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              {resolvedTheme === "dark" ? (
                <MoonStar className="size-5 text-brand" />
              ) : (
                <SunMedium className="size-5 text-brand" />
              )}
              {t("themeTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{t("themeDescription")}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                className={cn(
                  "rounded-[1.5rem] border border-border p-4 text-left transition hover:border-brand/40 hover:bg-brand-soft/30",
                  resolvedTheme !== "dark" && "border-brand/40 bg-brand-soft/40",
                )}
                type="button"
                onClick={() => setTheme("light")}
              >
                <div className="flex items-center gap-3">
                  <SunMedium className="size-5 text-brand" />
                  <span className="font-medium">{t("themeLight")}</span>
                </div>
              </button>
              <button
                className={cn(
                  "rounded-[1.5rem] border border-border p-4 text-left transition hover:border-brand/40 hover:bg-brand-soft/30",
                  resolvedTheme === "dark" && "border-brand/40 bg-brand-soft/40",
                )}
                type="button"
                onClick={() => setTheme("dark")}
              >
                <div className="flex items-center gap-3">
                  <MoonStar className="size-5 text-brand" />
                  <span className="font-medium">{t("themeDark")}</span>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <BellRing className="size-5 text-brand" />
              {t("notificationsTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                key: "sms" as const,
                icon: Smartphone,
                title: t("notificationSmsTitle"),
                description: t("notificationSmsBody"),
              },
              {
                key: "push" as const,
                icon: BellRing,
                title: t("notificationPushTitle"),
                description: t("notificationPushBody"),
              },
              {
                key: "email" as const,
                icon: Globe2,
                title: t("notificationEmailTitle"),
                description: t("notificationEmailBody"),
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
              {t("languageTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="preferred-language">
                {t("languageLabel")}
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
              <p className="text-xs text-muted-foreground">{t("languageHint")}</p>
            </div>

            <div className="space-y-3 rounded-[1.5rem] border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{t("radiusTitle")}</p>
                  <p className="text-sm text-muted-foreground">{t("radiusBody")}</p>
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
              {t("privacyTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                key: "discoverable" as const,
                title: t("privacyDiscoverableTitle"),
                description: t("privacyDiscoverableBody"),
              },
              {
                key: "directContact" as const,
                title: t("privacyDirectContactTitle"),
                description: t("privacyDirectContactBody"),
              },
              {
                key: "privateLeaderboard" as const,
                title: t("privacyLeaderboardTitle"),
                description: t("privacyLeaderboardBody"),
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
              {t("accountTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="change-password">
                  {t("passwordLabel")}
                </label>
                <Input id="change-password" placeholder={t("passwordPlaceholder")} type="password" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="confirm-password">
                  {t("confirmPasswordLabel")}
                </label>
                <Input
                  id="confirm-password"
                  placeholder={t("confirmPasswordPlaceholder")}
                  type="password"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button">{t("updatePassword")}</Button>
              <Button type="button" variant="outline">
                {t("downloadData")}
              </Button>
              <Button type="button" variant="danger">
                {t("deleteAccount")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
