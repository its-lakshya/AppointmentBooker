export enum UserRole {
  Admin = "admin",
  Staff = "staff",
}

export enum BookingLink {
  Individual = "individual",
  RoundRobin = "round_robin",
  Collective = "collective",
  Group = "group"
}

export enum BookingStatus {
  Confirmed = "confirmed",
  Cancelled = "cancelled",
  Rescheduled = "rescheduled",
  NoShow = "no_show"
}

export enum PaymentStatus {
  Paid = "paid",
  Unpaid = "unpaid",
  Refunded = "refunded"
}