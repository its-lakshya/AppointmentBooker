import Welcome from "@/emails/Welcome"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
export async function sendBookingConfirmationEmail({
  to,
  clientName,
  serviceName,
  providerName,
  startTime,
  endTime,
  timezone,
}: {
  to: string
  clientName: string
  serviceName: string
  providerName: string
  startTime: string
  endTime: string
  timezone: string
}) {
  const subject = `Your booking with ${providerName} is confirmed`

  const html = `
    <p>Hi ${clientName},</p>
    <p>Your booking for <strong>${serviceName}</strong> with ${providerName} has been confirmed.</p>
    <p><strong>When:</strong> ${startTime} - ${endTime} (${timezone})</p>
    <p>Thanks for booking with us!</p>
  `

    return await resend.emails.send({
      from: 'onboarding@resend.dev',
      to,
      subject,
      react: Welcome(),
    })
}
