import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Link,
} from "@react-email/components";
import * as React from "react";

interface BookingConfirmationProps {
  clientName: string;
  bookingLinkName: string;
  providerName: string;
  startTime: string; // UTC ISO string
  endTime: string;   // UTC ISO string
  timezone: string;  // e.g. "America/New_York"
  link: string;
}

// ✅ Utility function to format date to specific time zone
export function formatToTimeZone(dateStr: string, timeZone: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export const BookingConfirmation = ({
  clientName,
  bookingLinkName,
  providerName,
  startTime,
  endTime,
  timezone,
  link,
}: BookingConfirmationProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your booking with {providerName} is confirmed</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>Your booking is confirmed 🎉</Text>
          <Text>Hi {clientName},</Text>

          <Text>
            Your booking for <strong>{bookingLinkName}</strong> with{" "}
            <strong>{providerName}</strong> has been confirmed.
          </Text>

          <Section style={infoBox}>
            <Text>
              <strong>When:</strong>{" "}
              {formatToTimeZone(startTime, timezone)} –{" "}
              {formatToTimeZone(endTime, timezone)} ({timezone})
            </Text>
            <Text>
              <strong>Where:</strong>{" "}
              <Link href={link} style={linkStyle}>
                {link}
              </Link>
            </Text>
          </Section>

          <Text>Thanks for booking with us!</Text>
        </Container>
      </Body>
    </Html>
  );
};

export default BookingConfirmation;

// === Styles (shadcn-inspired, clean) ===

const main = {
  backgroundColor: "#f9fafb",
  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "24px",
  maxWidth: "520px",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
};

const heading = {
  fontSize: "20px",
  fontWeight: "600",
  marginBottom: "12px",
  color: "#111827",
};

const infoBox = {
  backgroundColor: "#f3f4f6",
  padding: "16px",
  borderRadius: "6px",
  margin: "16px 0",
};

const linkStyle = {
  color: "#3b82f6",
  textDecoration: "underline",
};
