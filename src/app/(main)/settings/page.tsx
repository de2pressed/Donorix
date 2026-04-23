"use client";

import {
  BellRing,
  Globe2,
  LockKeyhole,
  MoonStar,
  Shield,
  Smartphone,
  SunMedium,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useLocalePreference } from "@/components/providers/locale-provider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";
import { useUser } from "@/lib/hooks/use-user";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { authenticatedFetch } from "@/lib/supabase/authenticated-fetch";
import { cn } from "@/lib/utils/cn";
import type { Profile } from "@/types/user";

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

const languageOptions = SUPPORTED_LANGUAGES;

function buildSettingsState(user: Profile, locale: string): SettingsState {
  return {
    sms: user.allow_sms_alerts,
    push: user.consent_notifications,
    email: user.allow_email_alerts,
    discoverable: user.is_discoverable,
    directContact: user.allow_emergency_direct_contact,
    privateLeaderboard: user.hide_from_leaderboard,
    radius: user.notification_radius_km,
    language: user.preferred_language === "hi" ? "hi" : locale === "hi" ? "hi" : "en",
  };
}

function arePreferenceSettingsEqual(left: SettingsState, right: SettingsState) {
  return (
    left.sms === right.sms &&
    left.push === right.push &&
    left.email === right.email &&
    left.discoverable === right.discoverable &&
    left.directContact === right.directContact &&
    left.privateLeaderboard === right.privateLeaderboard &&
    left.radius === right.radius
  );
}

function buildProfilePreferencePayload(settings: SettingsState) {
  return {
    allow_sms_alerts: settings.sms,
    allow_email_alerts: settings.email,
    allow_emergency_direct_contact: settings.directContact,
    consent_notifications: settings.push,
    hide_from_leaderboard: settings.privateLeaderboard,
    is_discoverable: settings.discoverable,
    notification_radius_km: settings.radius,
    preferred_language: settings.language,
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const t = useTranslations("settings");
  const { locale, setLocalePreference } = useLocalePreference();
  const { resolvedTheme, setTheme } = useTheme();
  const { data: user } = useUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingLanguage, setIsUpdatingLanguage] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [savedSettings, setSavedSettings] = useState<SettingsState | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const hydratedProfileKey = useRef<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const nextProfileKey = `${user.id}:${user.updated_at}`;
    if (hydratedProfileKey.current === nextProfileKey) {
      return;
    }

    hydratedProfileKey.current = nextProfileKey;
    const nextSettings = buildSettingsState(user, locale);
    setSettings(nextSettings);
    setSavedSettings(nextSettings);
  }, [locale, user]);

  const hasPreferenceChanges = savedSettings
    ? !arePreferenceSettingsEqual(settings, savedSettings)
    : false;

  async function patchProfile(payload: Record<string, unknown>) {
    const response = await authenticatedFetch("/api/users/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    const parsed = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;

    if (!response.ok) {
      throw new Error(parsed?.error ?? t("error"));
    }

    return parsed;
  }

  async function handleLanguageChange(nextLanguage: string) {
    if (!user || nextLanguage === settings.language) {
      return;
    }

    const previousLanguage = settings.language;

    setSettings((current) => ({ ...current, language: nextLanguage }));
    setIsUpdatingLanguage(true);

    try {
      await setLocalePreference(nextLanguage === "hi" ? "hi" : "en");
      await patchProfile({ preferred_language: nextLanguage });
      setSavedSettings((current) =>
        current ? { ...current, language: nextLanguage } : current,
      );
      await new Promise((resolve) => window.setTimeout(resolve, 50));
      router.refresh();
    } catch (error) {
      setSettings((current) => ({ ...current, language: previousLanguage }));
      await setLocalePreference(previousLanguage === "hi" ? "hi" : "en");
      toast.error(
        error instanceof Error ? error.message : "Unable to update language.",
      );
    } finally {
      setIsUpdatingLanguage(false);
    }
  }

  async function handleSave() {
    if (!user || !hasPreferenceChanges) {
      return;
    }

    setIsSaving(true);

    try {
      await patchProfile(buildProfilePreferencePayload(settings));
      setSavedSettings((current) =>
        current
          ? {
              ...current,
              sms: settings.sms,
              push: settings.push,
              email: settings.email,
              discoverable: settings.discoverable,
              directContact: settings.directContact,
              privateLeaderboard: settings.privateLeaderboard,
              radius: settings.radius,
            }
          : settings,
      );
      router.refresh();
      toast.success(t("saved"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("error"));
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePasswordUpdate() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Fill all password fields to continue.");
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const response = await authenticatedFetch("/api/account/password", {
        method: "POST",
        body: JSON.stringify({
          current_password: currentPassword,
          password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to update password.");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update password.",
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  }

  async function handleDeleteAccount() {
    setIsDeleting(true);

    try {
      const response = await authenticatedFetch("/api/account/delete", {
        method: "POST",
        body: JSON.stringify({ confirmation: deleteConfirmation }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; message?: string }
        | null;

      if (!response.ok) {
        throw new Error(
          payload?.error ?? "Unable to schedule account deletion.",
        );
      }

      const supabase = getSupabaseBrowserClient();
      await supabase?.auth.signOut();

      setDeleteDialogOpen(false);
      setDeleteConfirmation("");
      toast.success(
        payload?.message ??
          "Your account has been scheduled for deletion. Your data will be permanently removed within 30 days.",
      );
      window.location.replace("/");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to schedule account deletion.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      toast.error("Supabase auth is not configured yet.");
      return;
    }

    setIsLoggingOut(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      toast.success("Logged out");
      window.location.replace("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to log out.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        {hasPreferenceChanges ? (
          <Button
            disabled={isSaving || isUpdatingLanguage}
            type="button"
            onClick={() => void handleSave()}
          >
            {isSaving ? t("saving") : t("save")}
          </Button>
        ) : null}
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
            <p className="text-sm text-muted-foreground">
              {t("themeDescription")}
            </p>
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
              <div
                key={item.key}
                className="flex flex-col items-start gap-4 rounded-[1.5rem] border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-medium">
                    <item.icon className="size-4 text-brand" />
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <Switch
                  checked={settings[item.key]}
                  onCheckedChange={(checked) =>
                    setSettings((current) => ({
                      ...current,
                      [item.key]: checked,
                    }))
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
              <label
                className="text-sm font-medium"
                htmlFor="preferred-language"
              >
                {t("languageLabel")}
              </label>
              <select
                className="h-11 w-full rounded-2xl border border-border bg-card/80 px-4 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                disabled={isUpdatingLanguage}
                id="preferred-language"
                value={settings.language}
                onChange={(event) => {
                  void handleLanguageChange(event.target.value);
                }}
              >
                {languageOptions.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                {t("languageHint")}
              </p>
            </div>

            <div className="space-y-3 rounded-[1.5rem] border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{t("radiusTitle")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("radiusBody")}
                  </p>
                </div>
                <span className="min-w-[4.5rem] text-right text-sm font-semibold tabular-nums">
                  {settings.radius} km
                </span>
              </div>
              <Slider
                max={50}
                min={5}
                step={1}
                value={[settings.radius]}
                onValueChange={(value) =>
                  setSettings((current) => ({
                    ...current,
                    radius: value[0] ?? current.radius,
                  }))
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
              <div
                key={item.key}
                className="flex flex-col items-start gap-4 rounded-[1.5rem] border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <Switch
                  checked={settings[item.key]}
                  onCheckedChange={(checked) =>
                    setSettings((current) => ({
                      ...current,
                      [item.key]: checked,
                    }))
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
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  htmlFor="current-password"
                >
                  Current password
                </label>
                <Input
                  id="current-password"
                  placeholder="Enter your current password"
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="change-password">
                  {t("passwordLabel")}
                </label>
                <Input
                  id="change-password"
                  placeholder={t("passwordPlaceholder")}
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  htmlFor="confirm-password"
                >
                  {t("confirmPasswordLabel")}
                </label>
                <Input
                  id="confirm-password"
                  placeholder={t("confirmPasswordPlaceholder")}
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                disabled={isLoggingOut}
                type="button"
                variant="outline"
                onClick={() => void handleLogout()}
              >
                {isLoggingOut ? "Logging out..." : "Log out"}
              </Button>
              <Button
                disabled={isUpdatingPassword}
                type="button"
                onClick={() => void handlePasswordUpdate()}
              >
                {isUpdatingPassword ? "Updating..." : t("updatePassword")}
              </Button>

              <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={(nextOpen) => {
                  setDeleteDialogOpen(nextOpen);
                  if (!nextOpen) {
                    setDeleteConfirmation("");
                  }
                }}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    disabled={Boolean(user?.is_demo)}
                    type="button"
                    variant="danger"
                  >
                    {t("deleteAccount")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete account</AlertDialogTitle>
                    <AlertDialogDescription>
                      Type DELETE to confirm. Your account will be soft-deleted,
                      signed out immediately, and scheduled for permanent removal
                      within 30 days.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium"
                      htmlFor="delete-confirmation"
                    >
                      Confirmation
                    </label>
                    <Input
                      id="delete-confirmation"
                      placeholder="Type DELETE"
                      value={deleteConfirmation}
                      onChange={(event) =>
                        setDeleteConfirmation(event.target.value)
                      }
                    />
                    {user?.is_demo ? (
                      <p className="text-sm text-muted-foreground">
                        Demo accounts are protected from deletion.
                      </p>
                    ) : null}
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      onClick={() => setDeleteConfirmation("")}
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      disabled={
                        deleteConfirmation !== "DELETE" ||
                        isDeleting ||
                        Boolean(user?.is_demo)
                      }
                      onClick={(event) => {
                        event.preventDefault();
                        void handleDeleteAccount();
                      }}
                    >
                      {isDeleting ? "Deleting..." : "Delete account"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
