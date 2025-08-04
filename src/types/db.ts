export type AvailabilitySlot = {
  start: string; // ISO UTC string, e.g., "2025-08-08T05:30:00Z"
  end: string;   // ISO UTC string
};

export type AvailabilityCache = {
  id: string;
  provider_id: string;
  booking_link_id: string;
  start_date: string; // "YYYY-MM-DD" format
  slots: AvailabilitySlot[];
  timezone: string;
  expires_at?: string; // optional, ISO datetime string
  created_at?: string;
  updated_at?: string;
};

export type TimeSlot = {
  start: string; // UTC ISO string e.g., "2025-08-08T05:30:00Z"
  end: string;   // UTC ISO string
};

export type WorkingDayConfig = {
  enabled: boolean;
  slots: TimeSlot[]; // Working hours for the day
};

export type AvailabilityConfig = {
  timezone: string; // e.g., "Asia/Kolkata"
  workingHours: {
    [day: string]: WorkingDayConfig; // "monday", "tuesday", etc.
  };
  startDate: string,
  slotGapMinutes: number;
  maxBookingDaysInFuture: number;
  slotIntervalMinutes?: number; // optional: fallback to service duration if not provided
};
