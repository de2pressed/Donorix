import { redirect } from "next/navigation";

import { ContactForm } from "@/components/contact/contact-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getCurrentProfile, getUserContactQueries } from "@/lib/data";
import { formatDateTime } from "@/lib/utils/format";

function getStatusVariant(status: "unresolved" | "solved"): "success" | "warning" {
  return status === "solved" ? "success" : "warning";
}

export default async function ContactPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login?redirect=/contact");
  }

  const queries = await getUserContactQueries(profile.id);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Support</p>
        <h1 className="font-display text-3xl font-bold">Contact us</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Send a query to the Donorix admins. Your request is stored in-app, linked to your signed-in account, and
          marked unresolved until a staff reply is added.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Submit a query</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-[1.5rem] border border-border bg-muted/20 p-4">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div className="min-w-0 space-y-1">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Name</p>
                  <p className="break-words text-sm font-medium leading-6">{profile.full_name}</p>
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Email</p>
                  <p className="break-all text-sm font-medium leading-6">{profile.email}</p>
                </div>
                <div className="min-w-0 space-y-1 sm:col-span-2 xl:col-span-1">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Phone</p>
                  <p className="break-words text-sm font-medium leading-6">{profile.phone}</p>
                </div>
              </div>
            </div>
            <ContactForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How this works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>Admin replies stay inside Donorix so you can reopen this page later and read the latest response.</p>
            <Separator />
            <p>New queries are unresolved by default until an admin adds a reply or marks them solved.</p>
            <Separator />
            <p>If your issue is urgent or medical, contact the hospital or emergency services directly.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your queries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {queries.length ? (
            queries.map((query) => (
              <div key={query.id} className="space-y-3 rounded-[1.5rem] border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <p className="break-words font-medium leading-6">{query.subject}</p>
                    <p className="text-sm text-muted-foreground">{formatDateTime(query.created_at)}</p>
                  </div>
                  <Badge variant={getStatusVariant(query.status)}>{query.status}</Badge>
                </div>

                <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground leading-6">{query.query}</p>

                <div className="rounded-[1.25rem] border border-border bg-muted/20 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Latest reply</p>
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-foreground">
                    {query.reply?.trim() ? query.reply : "No reply yet."}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-border p-6 text-sm text-muted-foreground">
              You have not submitted any queries yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
