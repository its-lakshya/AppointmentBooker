
import BookingConfirmation, { formatToTimeZone } from "@/emails/BookingConfirmation";
import { Resend } from "resend";
import nodemailer from "nodemailer";

// const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBookingConfirmationEmail({
  to,
  clientName,
  bookingLinkName,
  providerName,
  link,
  startTime,
  endTime,
  timezone,
}: {
  to: string;
  clientName: string;
  bookingLinkName: string;
  providerName: string;
  link: string;
  startTime: string;
  endTime: string;
  timezone: string;
}) {
  const subject = `Your booking with ${providerName} is confirmed`;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use TLS
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

(async () => {
  const info = await transporter.sendMail({
    from: '"Bookly" <kumarlakshya101@gmail.com>',
    to,
    subject,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Booking Confirmation</title>
        </head>
        <body style="font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f9fafb;">
          <div style="max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Your booking is confirmed 🎉</h2>
            <p>Hi ${clientName},</p>
            <p>Your booking for <strong>${bookingLinkName}</strong> with <strong>${providerName}</strong> has been confirmed.</p>

            <div style="padding: 16px; background-color: #f9f9f9; border: 1px solid #ddd; margin: 20px 0;">
              <p><strong>When:</strong> ${formatToTimeZone(startTime, timezone)} – ${formatToTimeZone(endTime, timezone)} (${timezone})</p>
              <p><strong>Where:</strong> <a href="${link}" style="color: #1a73e8;">${link}</a></p>
            </div>

            <p>Thanks for booking with us!</p>
          </div>
        </body>
      </html>
    `,
  });

  console.log("Message sent: %s", info.messageId);
})();

  // await resend.emails.send({
  //   from: "onboarding@resend.dev",
  //   to,
  //   subject,
  //   react: BookingConfirmation({
  //     clientName,
  //     bookingLinkName,
  //     providerName,
  //     startTime,
  //     endTime,
  //     timezone,
  //     link,
  //   }),
  // });
}


// Gmail user and pass in env
// uninstall nodemailer if not using
// uncomment resend
