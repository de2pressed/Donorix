"use client";

import { Settings2 } from "lucide-react";
import { useEffect, useState } from "react";

import { COOKIE_OPTIONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

const COOKIE_KEY = "donorix_cookie_consent_v1";
const DISCLAIMER_KEY = "donorix_disclaimer_v1_seen";
const DISCLAIMER_EVENT = "donorix:disclaimer-seen";

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
    const evaluateVisibility = () => {
      const disclaimerSeen = window.localStorage.getItem(DISCLAIMER_KEY) === "true";
      const existing = window.localStorage.getItem(COOKIE_KEY);

      setVisible(disclaimerSeen && !existing);
    };

    evaluateVisibility();
    window.addEventListener(DISCLAIMER_EVENT, evaluateVisibility);

    return () => {
      window.removeEventListener(DISCLAIMER_EVENT, evaluateVisibility);
    };
  }, []);

  const persist = (nextPreferences: Preferences) => {
    window.localStorage.setItem(COOKIE_KEY, JSON.stringify(nextPreferences));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-4">
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
                  <DialogDescription className="sr-only">
                    Review optional analytics and experience cookie settings.
                  </DialogDescription>
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
