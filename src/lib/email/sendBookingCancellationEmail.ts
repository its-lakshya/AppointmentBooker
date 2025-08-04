import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBookingCancellationEmail({
  to,
  clientName,
  serviceName,
  providerName,
}: {
  to: string;
  clientName: string;
  serviceName: string;
  providerName: string;
}) {
  const subject = `Your booking with ${providerName} has been cancelled`;

  const html = `
    <p>Hi ${clientName},</p>
    <p>Your booking for <strong>${serviceName}</strong> with ${providerName} has been <strong>cancelled</strong>.</p>
    <p>If this was a mistake or you have any questions, please contact ${providerName}.</p>
  `;

  return await resend.emails.send({
    from: "onboarding@resend.dev",
    to,
    subject,
    html,
  });
}
