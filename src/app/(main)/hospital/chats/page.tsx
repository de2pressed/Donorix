import Link from "next/link";
import { redirect } from "next/navigation";
import { MessagesSquare } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentProfile, getHospitalChats } from "@/lib/data";
import { formatRelativeTime } from "@/lib/utils/format";

export default async function HospitalChatsPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login?redirect=/hospital/chats");
  }

  if (profile.account_type !== "hospital") {
    redirect("/");
  }

  const chats = await getHospitalChats(profile.id);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Chats</h1>
          <p className="text-sm text-muted-foreground">
            Approved donor conversations and hospital contact details in one place.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/hospital/donors">Review donors</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessagesSquare className="size-5 text-brand" />
            Approved donor conversations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {chats.length ? (
            chats.map((chat) => (
              <Link
                key={chat.post.id}
                className="block rounded-[1.5rem] border border-border bg-card/70 p-4 transition hover:border-brand/30 hover:bg-brand-soft/40"
                href={`/chat/${chat.post.id}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">{chat.post.patient_name}</p>
                      <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        {chat.post.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {chat.post.patient_id ?? "No case reference"} - {chat.post.blood_type_needed}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {chat.donor?.full_name ?? "Approved donor"}{" "}
                      {chat.donor?.username ? `@${chat.donor.username}` : ""} - {chat.donor?.phone ?? "No phone"} -{" "}
                      {chat.donor?.email ?? "No email"} - {chat.messageCount} messages
                    </p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{chat.lastMessage ? formatRelativeTime(chat.lastMessage.created_at) : "No messages yet"}</p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-border p-6 text-sm text-muted-foreground">
              Approved chats will appear here after you accept a donor on a patient post.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
