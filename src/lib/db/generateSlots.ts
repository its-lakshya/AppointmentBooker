type DailyAvailability = {
  day: string; // "monday", "tuesday", ...
  intervals: { start: string; end: string }[]; // e.g. [{ start: "09:00", end: "12:00" }]
};

type AvailabilityConfig = {
  timezone: string; // Just returned, not used for conversion in JS
  slotDurationMinutes: number;
  availability: DailyAvailability[];
};

function getWeekdayName(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
}

function parseTimeToDate(baseDate: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export function generateSlotsFromConfig(config: AvailabilityConfig) {
  const slots: string[] = [];

  const now = new Date();
  const today = new Date(now.toDateString()); // strip time
  const end = new Date(today);
  end.setDate(end.getDate() + 7);

  for (
    let day = new Date(today);
    day <= end;
    day.setDate(day.getDate() + 1)
  ) {
    const weekday = getWeekdayName(day);
    const daily = config.availability.find((a) => a.day === weekday);
    if (!daily) continue;

    for (const interval of daily.intervals) {
      const intervalStart = parseTimeToDate(day, interval.start);
      const intervalEnd = parseTimeToDate(day, interval.end);

      for (
        let slot = new Date(intervalStart);
        slot < intervalEnd;
        slot = new Date(slot.getTime() + config.slotDurationMinutes * 60 * 1000)
      ) {
        if (slot > now) {
          slots.push(slot.toISOString()); // always in UTC
        }
      }
    }
  }

  slots.sort(); // optional: keep in chronological order
  return { slots, timezone: config.timezone };
}
