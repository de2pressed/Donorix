import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { POLICY_NAV } from "@/lib/constants";

export default function PoliciesIndexPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Policy section</CardTitle>
          <p className="text-sm text-muted-foreground">
            Browse the key platform policies from one place, or jump straight to a specific document.
          </p>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {POLICY_NAV.map((item) => (
            <Link
              key={item.href}
              className="rounded-2xl border border-border bg-card/80 px-4 py-3 text-sm text-muted-foreground transition hover:border-brand/30 hover:bg-brand-soft hover:text-brand"
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
