import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBookingRescheduleEmail({
  to,
  clientName,
  serviceName,
  providerName,
  startTime,
  endTime,
  timezone,
}: {
  to: string;
  clientName: string;
  serviceName: string;
  providerName: string;
  startTime: string;
  endTime: string;
  timezone: string;
}) {
  const subject = `Your booking with ${providerName} has been rescheduled`;

  const html = `
    <p>Hi ${clientName},</p>
    <p>Your booking for <strong>${serviceName}</strong> with ${providerName} has been <strong>rescheduled</strong>.</p>
    <p><strong>New Time:</strong> ${startTime} – ${endTime} (${timezone})</p>
    <p>If you didn’t request this, please contact the provider.</p>
  `;

  return await resend.emails.send({
    from: "onboarding@resend.dev",
    to,
    subject,
    html,
  });
}
