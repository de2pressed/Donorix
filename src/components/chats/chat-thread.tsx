"use client";

import { SendHorizonal, Shield, User2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { authenticatedFetch } from "@/lib/supabase/authenticated-fetch";
import { cn } from "@/lib/utils/cn";
import { formatDateTime, formatRelativeTime } from "@/lib/utils/format";
import type { HospitalChatThread } from "@/lib/data";
import type { Profile } from "@/types/user";

type ChatMessage = HospitalChatThread["messages"][number];

export function ChatThread({
  thread,
  viewer,
}: {
  thread: HospitalChatThread;
  viewer: Profile;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(thread.messages);
  const [value, setValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const isHospitalView = viewer.id === thread.post.created_by;
  const recipientId = isHospitalView ? thread.post.approved_donor_id : thread.post.created_by;

  useEffect(() => {
    setMessages(thread.messages);
  }, [thread.messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const hospitalContact = thread.hospitalAccount;
  const donor = thread.donor;

  async function handleSendMessage() {
    const message = value.trim();
    if (!message || !recipientId || isSending) {
      return;
    }

    setIsSending(true);
    try {
      const response = await authenticatedFetch(`/api/posts/${thread.post.id}/chat`, {
        method: "POST",
        body: JSON.stringify({ message }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        toast.error(payload?.error ?? "Unable to send message");
        return;
      }

      const optimisticMessage: ChatMessage = {
        id: crypto.randomUUID(),
        post_id: thread.post.id,
        sender_id: viewer.id,
        recipient_id: recipientId,
        message,
        created_at: new Date().toISOString(),
        sender: {
          id: viewer.id,
          full_name: viewer.full_name,
          username: viewer.username,
          phone: viewer.phone,
          email: viewer.email,
          blood_type: viewer.blood_type,
          city: viewer.city,
          state: viewer.state,
          avatar_url: viewer.avatar_url,
        },
        recipient:
          recipientId === thread.post.created_by && hospitalContact
            ? {
                id: thread.post.created_by,
                full_name: hospitalContact.contact_person_name,
                username: hospitalContact.hospital_name,
                phone: hospitalContact.official_contact_phone,
                email: hospitalContact.official_contact_email,
                blood_type: null,
                city: hospitalContact.city,
                state: hospitalContact.state,
                avatar_url: null,
              }
            : donor,
      };

      setMessages((current) => [...current, optimisticMessage]);
      setValue("");
      toast.success("Message sent");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">Approved donor chat</p>
            <div>
              <CardTitle className="text-2xl">{thread.post.patient_name}</CardTitle>
              <CardDescription className="mt-1">
                {thread.post.patient_id ?? "Case reference unavailable"} - {thread.post.blood_type_needed} -{" "}
                Required by {formatDateTime(thread.post.required_by)}
              </CardDescription>
            </div>
          </div>
          <div className="rounded-full border border-border px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {thread.post.status}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Messages stay between the hospital workspace contact and the approved donor for this request.
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[1.5rem] border border-border bg-muted/20 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Shield className="size-4 text-brand" />
              Hospital contact
            </div>
            <div className="mt-3 space-y-1 text-sm">
              <p className="font-semibold text-foreground">
                {hospitalContact?.contact_person_name ?? thread.post.contact_name}
              </p>
              <p className="text-muted-foreground">
                {hospitalContact?.hospital_name ?? thread.post.hospital_name}
              </p>
              <p className="text-muted-foreground">
                {hospitalContact?.official_contact_phone ?? thread.post.contact_phone}
              </p>
              <p className="text-muted-foreground">
                {hospitalContact?.official_contact_email ?? thread.post.contact_email ?? "No email shared"}
              </p>
              <p className="text-muted-foreground">
                {hospitalContact
                  ? `${hospitalContact.address}, ${hospitalContact.city}, ${hospitalContact.state}`
                  : `${thread.post.hospital_address}, ${thread.post.city}, ${thread.post.state}`}
              </p>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-border bg-muted/20 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <User2 className="size-4 text-brand" />
              Approved donor
            </div>
            <div className="mt-3 space-y-1 text-sm">
              <p className="font-semibold text-foreground">{donor?.full_name ?? "Approved donor"}</p>
              <p className="text-muted-foreground">@{donor?.username ?? "unknown"}</p>
              <p className="text-muted-foreground">{donor?.phone ?? "No phone shared"}</p>
              <p className="text-muted-foreground">{donor?.email ?? "No email shared"}</p>
              <p className="text-muted-foreground">
                {donor?.blood_type ? `${donor.blood_type} - ` : ""}
                {donor?.city ?? "City unavailable"}
                {donor?.state ? `, ${donor.state}` : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="chat-scroll flex max-h-[55vh] min-h-[22rem] flex-col gap-3 overflow-y-auto rounded-[1.5rem] border border-border bg-surface-2/50 p-4">
            {messages.length ? (
              messages.map((message) => {
                const isMine = message.sender_id === viewer.id;
                const senderLabel =
                  message.sender?.full_name ?? message.sender?.username ?? (isMine ? "You" : "Participant");

                return (
                  <div key={message.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[82%] rounded-[1.35rem] px-4 py-3 text-sm shadow-sm",
                        isMine
                          ? "bg-brand text-brand-foreground"
                          : "border border-border bg-card text-foreground",
                      )}
                    >
                      <div className="mb-2 flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] opacity-75">
                        <span>{isMine ? "You" : senderLabel}</span>
                        <span>{formatRelativeTime(message.created_at)}</span>
                      </div>
                      <p className="whitespace-pre-wrap leading-6">{message.message}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex h-full items-center justify-center rounded-[1.35rem] border border-dashed border-border bg-card/50 p-6 text-center text-sm text-muted-foreground">
                No messages yet. Send the first update to start coordination.
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            className="space-y-3 rounded-[1.5rem] border border-border bg-muted/20 p-4"
            onSubmit={(event) => {
              event.preventDefault();
              void handleSendMessage();
            }}
          >
            <Textarea
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={isHospitalView ? "Send an update to the approved donor" : "Reply to the hospital contact"}
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Keep this thread focused on coordination details, timing, and contact follow-up.
              </p>
              <Button disabled={!value.trim() || isSending} type="submit">
                <SendHorizonal className="size-4" />
                {isSending ? "Sending..." : "Send message"}
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
