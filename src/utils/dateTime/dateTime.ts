// utils/date.ts

function parseDateString(dateString: string | undefined | null): Date {
  if (!dateString || typeof dateString !== "string") {
    return new Date(""); // Invalid date
  }
  const normalized = dateString.includes("T")
    ? dateString
    : dateString.replace(" ", "T").replace(/\+(\d{2})$/, "+$1:00");
  return new Date(normalized);
}

export function formatToReadableDate(dateString: string): string {
  const date = parseDateString(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }); // e.g. Aug 8, 2025
}

export function formatToYMD(dateString: string): string {
  const date = parseDateString(dateString);
  return date.toISOString().split("T")[0]; // e.g. 2025-08-20
}

export function formatToLocalTime(dateString: string, timeZone?: string): string {
  const date = parseDateString(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
  }); // e.g. 06:30 PM
}

export function isToday(dateString: string): boolean {
  const today = new Date();
  const date = parseDateString(dateString);
  return today.toDateString() === date.toDateString();
}

export function getRelativeTime(dateString: string): string {
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const now = new Date();
  const date = parseDateString(dateString);
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (Math.abs(seconds) < 60) return rtf.format(-seconds, "seconds");
  if (Math.abs(minutes) < 60) return rtf.format(-minutes, "minutes");
  if (Math.abs(hours) < 24) return rtf.format(-hours, "hours");
  return rtf.format(-days, "days");
}
