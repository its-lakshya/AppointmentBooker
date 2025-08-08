import { insertAvailabilityCache } from "@/lib/db/availability_cache";
import { AvailabilityConfig } from "@/types/db";

function addDaysNative(date: Date, numDays: number): Date {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + numDays);
  return newDate;
}

function formatDateToYMD(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function extractTimePartFromUTC(datetime: string): string {
  return new Date(datetime).toISOString().substring(11, 19); // "HH:mm:ss"
}

function combineDateAndTimeAsUTC(date: Date, timePart: string): Date {
  const [hours, minutes, seconds] = timePart.split(":").map(Number);
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, seconds));
}

export async function generateAvailabilityCacheForBookingLink({
  providerId,
  bookingLinkId,
  availabilityConfig,
}: {
  providerId: string;
  bookingLinkId: string;
  availabilityConfig: AvailabilityConfig;
}) {
  const timezone = availabilityConfig.timezone;
  const maxDays = availabilityConfig.maxBookingDaysInFuture;

  const slotInterval = availabilityConfig.slotIntervalMinutes! || 30;
  const slotGap = availabilityConfig.slotGapMinutes || 0;

  const slotDurationMs = slotInterval * 60 * 1000;
  const gapDurationMs = slotGap * 60 * 1000;

  const startDate = new Date(availabilityConfig.startDate);
  const endDate = addDaysNative(startDate, maxDays);

  for (
    let date = new Date(startDate);
    date < endDate;
    date = addDaysNative(date, 1)
  ) {
    const dayOfWeek = date.toLocaleDateString("en-US", {
      weekday: "long",
      timeZone: timezone,
    });

    const dayConfig = availabilityConfig.workingHours[dayOfWeek];
    if (!dayConfig?.enabled || !dayConfig.slots?.length) continue;

    const slots: { start: string; end: string }[] = [];

    for (const slot of dayConfig.slots) {
      const slotStartTime = extractTimePartFromUTC(slot.start);
      const slotEndTime = extractTimePartFromUTC(slot.end);

      const slotStart = combineDateAndTimeAsUTC(date, slotStartTime);
      const slotEnd = combineDateAndTimeAsUTC(date, slotEndTime);

      let current = new Date(slotStart);

      while (current.getTime() + slotDurationMs <= slotEnd.getTime()) {
        const actualStart = new Date(current);
        const actualEnd = new Date(current.getTime() + slotDurationMs);

        slots.push({
          start: actualStart.toISOString(),
          end: actualEnd.toISOString(),
        });

        current = new Date(current.getTime() + slotDurationMs + gapDurationMs);
      }
    }

    if (slots.length > 0) {
      await insertAvailabilityCache({
        provider_id: providerId,
        booking_link_id: bookingLinkId,
        start_date: formatDateToYMD(date),
        slots: slots,
        timezone: timezone,
      });
    }
  }
}
