import { BookingStatus, PaymentStatus, UserRole } from "./enums";

export type AvailabilitySlot = {
  start: string; // ISO UTC string, e.g., "2025-08-08T05:30:00Z"
  end: string; // ISO UTC string
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
  end: string; // UTC ISO string
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
  startDate: string;
  slotGapMinutes: number;
  maxBookingDaysInFuture: number;
  slotIntervalMinutes?: number; // optional: fallback to service duration if not provided
};

export type Service = {
  id: string;
  provider_id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  allow_addons: boolean;
  created_at: string;
  updated_at: string;
};

export type BookingLink = {
  addonIds: string[];
  // eslint-disable-next-line
  availability_config: any;
  // {timezone: "Asia/Calcutta", startDate: "2025-08-03", workingHours: Object, slotGapMinutes: 10, slotIntervalMinutes: 30, …}
  cancellation_cutoff_hours: number | null;
  created_at: string;
  created_by: string;
  // eslint-disable-next-line
  custom_form: any;
  id: string;
  max_attendees: number;
  name: string;
  payment_required: boolean;
  provider_id: string;
  serviceId: string;
  slug: string;
  staffIds: string[];
  type: string;
  updated_at: string;
};

// export type Staff = {
//   id: string;
//   first_name: string;
//   last_name: string;
//   email: string;
//   image_url: string;
//   role: UserRole;
// };

export type User = {
  id: string;
  clerk_user_id: string;
  providerId: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  email: string;
  image_url: string;
  created_at: string;
};

export type Booking = {
  id: string;
  provider_id: string;
  booking_link_id: string | null;
  service_id: string | null;
  staff_user_id: string | null;
  client_name: string;
  client_email: string;
  client_phone: string;
  start_time: string; // stored as text in DB — ISO string expected
  end_time: string;   // stored as text in DB — ISO string expected
  timezone: string;
  status: BookingStatus; // extend based on enum
  payment_status: PaymentStatus; // extend based on enum
  price: number | null;
  attendee_count: number;
  // eslint-disable-next-line
  intake_data: Record<string, any> | null;
  reschedule_token: string | null;
  cancel_token: string | null;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
};


export type Addon = {
  id: string;
  service_id: string;
  name: string;
  description: string;
  additional_minute: number;
  additional_price: number;
};

export type ServiceResponse = {
  success: boolean;
  services: Service[];
};

export type ServiceCreateResponse = {
  success: boolean;
  service: Service;
};

export type BookingLinksResponse = {
  success: boolean;
  bookingLinks: BookingLink[];
};

export type StaffResponse = {
  success: boolean;
  staff: User[];
};

export type AddonsResponse = {
  success: boolean;
  addons: Addon[];
};

export type CreateBookingLinkResponse = {
  success: boolean;
  bookingLink: BookingLink;
};

export type BookingLinkResponse = {
  success: boolean;
  bookingLink: BookingLink;
  service: Service;
  staff: User[];
};

export type UserResponse = {
  succss: boolean;
  user: User;
};

export type StaffBookingsResponse = {
  success: boolean;
  bookings: Booking[];
}