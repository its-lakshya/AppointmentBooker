type MinimalAvailabilityConfig = {
  timezone: string; // E.g. "Asia/Kolkata"
  workingHours: {
    [day: string]: {
      enabled: boolean;
      slots: { start: string; end: string }[]; // e.g., "09:00" to "17:00"
    };
  };
  startDate: string,
  maxBookingDaysInFuture: number;
  slotIntervalMinutes?: number; // Optional (fallback to service duration)
};

const availabilityConfig: MinimalAvailabilityConfig = {
  timezone: "Asia/Kolkata", // still needed for UI conversion
  workingHours: {
    monday: {
      enabled: true,
      slots: [
        {
          start: "2025-08-04T03:30:00Z", // 09:00 IST in UTC
          end: "2025-08-04T07:30:00Z",   // 13:00 IST in UTC
        },
        {
          start: "2025-08-04T08:30:00Z", // 14:00 IST in UTC
          end: "2025-08-04T12:30:00Z",   // 18:00 IST in UTC
        },
      ],
    },
    tuesday: {
      enabled: true,
      slots: [
        {
          start: "2025-08-05T04:30:00Z", // 10:00 IST in UTC
          end: "2025-08-05T10:30:00Z",   // 16:00 IST in UTC
        },
      ],
    },
    wednesday: {
      enabled: true,
      slots: [
        {
          start: "2025-08-06T04:00:00Z", // 09:30 IST
          end: "2025-08-06T12:00:00Z",   // 17:30 IST
        },
      ],
    },
    thursday: { enabled: false, slots: [] },
    friday: {
      enabled: true,
      slots: [
        {
          start: "2025-08-08T05:30:00Z", // 11:00 IST
          end: "2025-08-08T11:30:00Z",   // 17:00 IST
        },
      ],
    },
    saturday: { enabled: false, slots: [] },
    sunday: { enabled: false, slots: [] },
  },
  startDate: "25-08-06",
  maxBookingDaysInFuture: 30,
  slotIntervalMinutes: 30,
};
