import { BellRing, LockKeyhole, Shield } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const settings = [
  {
    icon: BellRing,
    title: "SMS and app notifications",
    description: "Receive donor matches, approvals, radius expansions, and expiry reminders.",
    enabled: true,
  },
  {
    icon: Shield,
    title: "Profile discoverability",
    description: "Allow your public profile to appear in leaderboards and donor matching.",
    enabled: true,
  },
  {
    icon: LockKeyhole,
    title: "Emergency direct contact",
    description: "Reveal your phone number only when emergency approval is granted.",
    enabled: false,
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Control notification preferences, visibility, and privacy posture.
        </p>
      </div>
      <div className="grid gap-4">
        {settings.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <item.icon className="size-5 text-brand" />
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <Switch checked={item.enabled} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
