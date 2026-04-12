import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminDashboard } from "@/lib/data";

export default async function AdminPage() {
  const dashboard = await getAdminDashboard();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Admin dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Monitor platform health, moderation activity, and donation flow.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total users", value: dashboard.stats.totalUsers },
          { label: "Active posts", value: dashboard.stats.activePosts },
          { label: "Donations today", value: dashboard.stats.donationsToday },
          { label: "SMS sent today", value: dashboard.stats.smsSentToday },
        ].map((item) => (
          <Card key={item.label}>
            <CardHeader>
              <CardTitle className="text-base">{item.label}</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">{item.value}</CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent admin actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.actions.length ? (
              dashboard.actions.map((action) => (
                <div key={action.id} className="rounded-[1.5rem] border border-border p-4">
                  <p className="font-medium">{action.action}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{action.reason}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No admin actions logged yet.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>System health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.health.map((item) => (
              <div key={item.label} className="rounded-[1.5rem] border border-border p-4">
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.status}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
