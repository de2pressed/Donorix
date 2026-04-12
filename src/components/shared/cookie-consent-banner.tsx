"use client";

import { Settings2 } from "lucide-react";
import { useEffect, useState } from "react";

import { COOKIE_OPTIONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

const COOKIE_KEY = "donorix_cookie_consent";

type Preferences = Record<string, boolean>;

const defaultPreferences: Preferences = {
  required: true,
  analytics: false,
  experience: true,
};

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [preferences, setPreferences] = useState(defaultPreferences);

  useEffect(() => {
    const existing = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith(`${COOKIE_KEY}=`));

    if (!existing) {
      setVisible(true);
    }
  }, []);

  const persist = (nextPreferences: Preferences) => {
    document.cookie = `${COOKIE_KEY}=${encodeURIComponent(JSON.stringify(nextPreferences))}; Path=/; Max-Age=31536000; SameSite=Lax`;
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-[70] px-4">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 rounded-[1.75rem] border border-border bg-card/95 p-5 shadow-soft backdrop-blur">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Cookie preferences</p>
            <p className="text-sm text-muted-foreground">
              Required cookies keep the platform secure. Analytics and experience cookies are optional.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => persist({ ...defaultPreferences, analytics: true })}>
              Accept All
            </Button>
            <Button variant="outline" onClick={() => persist(defaultPreferences)}>
              Accept Required Only
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost">
                  <Settings2 className="size-4" />
                  Manage Preferences
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Manage cookie preferences</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {COOKIE_OPTIONS.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-start justify-between gap-4 rounded-2xl border border-border p-4"
                    >
                      <div>
                        <p className="font-medium text-foreground">{option.label}</p>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      <Switch
                        checked={preferences[option.id]}
                        disabled={option.id === "required"}
                        onCheckedChange={(checked) =>
                          setPreferences((current) => ({ ...current, [option.id]: checked }))
                        }
                      />
                    </label>
                  ))}
                </div>
                <DialogFooter>
                  <Button onClick={() => persist(preferences)}>Save Preferences</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
