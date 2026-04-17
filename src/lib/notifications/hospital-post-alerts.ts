import { env } from "@/lib/env";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type NewPostAlertInput = {
  postId: string;
  patientName: string;
  bloodTypeNeeded: string;
  hospitalName: string;
  city: string;
  state: string;
  requiredBy: string;
};

async function sendEmailNotification(to: string, subject: string, html: string) {
  if (!env.RESEND_API_KEY || !env.NOTIFICATION_FROM_EMAIL) {
    return;
  }

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.NOTIFICATION_FROM_EMAIL,
      to: [to],
      subject,
      html,
    }),
  });
}

export async function notifyEligibleDonorsForNewHospitalPost(input: NewPostAlertInput) {
  const admin = getSupabaseAdminClient();
  if (!admin) {
    return { recipients: 0, emailed: 0 };
  }

  const { data: recipients, error: recipientsError } = await admin
    .from("profiles")
    .select("id, email, full_name, allow_email_alerts")
    .eq("account_type", "donor")
    .eq("status", "active")
    .eq("is_available", true)
    .eq("consent_notifications", true)
    .is("deleted_at", null)
    .limit(500);

  if (recipientsError || !recipients?.length) {
    return { recipients: 0, emailed: 0 };
  }

  const title = `New ${input.bloodTypeNeeded} request from ${input.hospitalName}`;
  const body = `${input.patientName} needs ${input.bloodTypeNeeded} in ${input.city}, ${input.state}.`;

  const { error: notificationError } = await admin.from("notifications").insert(
    recipients.map((recipient) => ({
      user_id: recipient.id,
      type: "new_hospital_post",
      title,
      body,
      post_id: input.postId,
      data: {
        patient_name: input.patientName,
        blood_type_needed: input.bloodTypeNeeded,
        hospital_name: input.hospitalName,
        city: input.city,
        state: input.state,
        required_by: input.requiredBy,
      },
    })),
  );

  if (notificationError) {
    return { recipients: 0, emailed: 0 };
  }

  const emailRecipients = recipients.filter((recipient) => recipient.allow_email_alerts && recipient.email);
  let emailed = 0;

  await Promise.all(
    emailRecipients.map(async (recipient) => {
      try {
        await sendEmailNotification(
          recipient.email,
          title,
          `<p>Hello ${recipient.full_name || "donor"},</p>
           <p>A new hospital request has been posted.</p>
           <p><strong>Patient:</strong> ${input.patientName}<br/>
           <strong>Blood Type:</strong> ${input.bloodTypeNeeded}<br/>
           <strong>Hospital:</strong> ${input.hospitalName}<br/>
           <strong>Location:</strong> ${input.city}, ${input.state}</p>
           <p>Open Donorix to review and respond quickly.</p>`,
        );
        emailed += 1;
      } catch (error) {
        console.error("[notifications] Failed to send email", error);
      }
    }),
  );

  return { recipients: recipients.length, emailed };
}
