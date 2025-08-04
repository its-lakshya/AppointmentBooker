import { v4 as uuidv4 } from 'uuid';

import { sendBookingRescheduleEmail } from '@/lib/email/sendBookingRescheduleEmail';

import { sendBookingCancellationEmail } from '../email/sendBookingCancellationEmail';
import { createSupabaseAdminClient } from '../supabase/supabase';
import { BookingStatus, PaymentStatus } from '@/types/enums';
import { addSlotToAvailabilityCache, insertAvailabilityCache, removeBookedSlotFromCache } from './availability_cache';

type AttendeeInput = {
  full_name: string;
  email: string;
  phone?: string;
  // eslint-disable-next-line
  intake_data?: any;
};

type CreateBookingInput = {
  providerId: string;
  bookingLinkId: string;
  serviceId: string;
  staffUserId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  startTime: string;
  endTime: string;
  timezone: string;
  status: BookingStatus,
  paymentStatus: PaymentStatus,
  price?: number;
  attendeeCount?: number;
  // eslint-disable-next-line
  intakeData?: any;
  attendees?: AttendeeInput[];
};

export async function createBooking(input: CreateBookingInput) {
  const supabase = createSupabaseAdminClient();

  const {
    providerId,
    bookingLinkId,
    serviceId,
    staffUserId,
    clientName,
    clientEmail,
    clientPhone,
    startTime,
    endTime,
    status,
    paymentStatus,
    timezone,
    price,
    attendeeCount,
    intakeData,
    attendees = [],
  } = input;

  const rescheduleToken = uuidv4();
  const cancelToken = uuidv4();

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      provider_id: providerId,
      booking_link_id: bookingLinkId,
      service_id: serviceId,
      staff_user_id: staffUserId,
      client_name: clientName.trim(),
      client_email: clientEmail.trim().toLowerCase(),
      client_phone: clientPhone?.trim(),
      start_time: startTime,
      end_time: endTime,
      timezone,
      status,
      payment_status: paymentStatus,
      price: price || 0,
      attendee_count: attendeeCount || 1,
      intake_data: intakeData,
      reschedule_token: rescheduleToken,
      cancel_token: cancelToken,
    })
    .select()
    .single();

  if (error) return { booking: null, error };

  // Insert attendees if provided
  if (attendees.length > 0) {
    const attendeeData = attendees.map((attendee) => ({
      booking_id: booking.id,
      full_name: attendee.full_name.trim(),
      email: attendee.email.trim().toLowerCase(),
      phone: attendee.phone?.trim(),
      intake_data: attendee.intake_data,
    }));

    const { error: attendeesError } = await supabase
      .from("booking_attendees")
      .insert(attendeeData);

    if (attendeesError) {
      return { booking, error: attendeesError };
    }
  }

  return { booking, error: null };
}

// export async function validateBookingSlot(
//   bookingLinkId: string,
//   startTime: string,
//   endTime: string
// ) {
//   const supabase = createSupabaseAdminClient();
//   const date = startTime.split("T")[0];
//   console.log(startTime, endTime, date)

//   const { data: cache, error } = await supabase
//     .from("availability_cache")
//     .select("slots")
//     .eq("booking_link_id", bookingLinkId)
//     .eq("start_date", date)
//     .maybeSingle();

//   if (error || !cache) {
//     return {
//       valid: false,
//       reason: "No availability cache found for this date",
//     };
//   }

//   const slots: string[] = cache.slots;
//   const slotSet = new Set(slots);

//   const current = new Date(startTime);
//   const end = new Date(endTime);
//   const durationMinutes = (end.getTime() - current.getTime()) / 60000;

//   const expectedSlotCount = durationMinutes / 30;
//   const slotTimes: string[] = [];

//   for (let i = 0; i < expectedSlotCount; i++) {
//     slotTimes.push(new Date(current.getTime() + i * 30 * 60000).toISOString());
//   }

//   const allSlotsAvailable = slotTimes.every((s) => slotSet.has(s));

//   return {
//     valid: allSlotsAvailable,
//     reason: allSlotsAvailable ? null : "Selected time slot is not available",
//   };
// }

export async function validateBookingSlot(
  bookingLinkId: string,
  startTime: string,
  endTime: string
) {
  const supabase = createSupabaseAdminClient();
  const date = startTime.split("T")[0];

  const { data: cache, error } = await supabase
    .from("availability_cache")
    .select("slots")
    .eq("booking_link_id", bookingLinkId)
    .eq("start_date", date)
    .maybeSingle();

  if (error || !cache) {
    return {
      valid: false,
      reason: "No availability cache found for this date",
    };
  }

  const slots: { start: string; end: string }[] = cache.slots;

  const slotExists = slots.some(
    (slot) => slot.start === startTime && slot.end === endTime
  );

  return {
    valid: slotExists,
    reason: slotExists ? null : "Selected time slot is not available",
  };
}


export async function checkBookingOverlap(
  providerId: string,
  staffUserId: string,
  startTime: string,
  endTime: string
) {
  const supabase = createSupabaseAdminClient();

  const { data: overlaps, error } = await supabase
    .from("bookings")
    .select("id")
    .eq("provider_id", providerId)
    .eq("staff_user_id", staffUserId)
    .or(`status.eq.confirmed,status.eq.rescheduled`)
    .lt("start_time", endTime)
    .gt("end_time", startTime);

  if (error) {
    return { valid: false, reason: "Error checking overlapping bookings" };
  }

  return {
    valid: overlaps.length === 0,
    reason: overlaps.length ? "Booking overlaps with another booking" : null,
  };
}

export async function validateServiceAndStaff(
  providerId: string,
  serviceId: string,
  staffUserId?: string
) {
  const supabase = createSupabaseAdminClient();

  const [serviceRes, staffRes] = await Promise.all([
    supabase
      .from("services")
      .select("id")
      .eq("id", serviceId)
      .eq("provider_id", providerId)
      .maybeSingle(),

    staffUserId
      ? supabase
          .from("users")
          .select("id")
          .eq("id", staffUserId)
          .eq("provider_id", providerId)
          .maybeSingle()
      : Promise.resolve({ data: true }), // skip validation if staffUserId not provided
  ]);

  const serviceValid = serviceRes.data;
  const staffValid = staffRes.data;

  return {
    valid: !!(serviceValid && staffValid),
    reason: !serviceValid
      ? "Invalid service for this provider"
      : !staffValid
        ? "Invalid staff for this provider"
        : null,
  };
}


// export async function rescheduleBookingByToken(
//   token: string,
//   startTime: string,
//   endTime: string
// ) {
//   const supabase = createSupabaseAdminClient();

//   const { data: booking, error } = await supabase
//     .from("bookings")
//     .select("*, services(*), users!client_id(*), providers(*)")
//     .eq("reschedule_token", token)
//     .single();

//   if (error || !booking) {
//     return { success: false, error: "Invalid or expired reschedule token" };
//   }

//   const slotCheck = await validateBookingSlot(
//     booking.booking_link_id,
//     startTime,
//     endTime
//   );
//   if (!slotCheck.valid) {
//     return { success: false, error: slotCheck.reason };
//   }

//   const overlapCheck = await checkBookingOverlap(
//     booking.provider_id,
//     booking.staff_user_id,
//     startTime,
//     endTime
//   );
//   if (!overlapCheck.valid) {
//     return { success: false, error: overlapCheck.reason };
//   }

//   const { error: updateError } = await supabase
//     .from("bookings")
//     .update({
//       start_time: startTime,
//       end_time: endTime,
//       status: "rescheduled",
//     })
//     .eq("id", booking.id);

//   if (updateError) {
//     return { success: false, error: "Failed to update booking" };
//   }

//   const clientEmail = booking.users?.email;
//   const clientName = booking.users?.first_name || "there";
//   const serviceName = booking.services?.name || "Service";
//   const providerName = booking.providers?.name || "Provider";
//   const timezone = booking.timezone || "your timezone";

//   if (clientEmail) {
//     await sendBookingRescheduleEmail({
//       to: clientEmail,
//       clientName,
//       serviceName,
//       providerName,
//       startTime,
//       endTime,
//       timezone,
//     });
//   }

//   return { success: true, bookingId: booking.id };
// }


export async function rescheduleBookingByToken(
  token: string,
  newStartTime: string,
  newEndTime: string
) {
  const supabase = createSupabaseAdminClient();

  const { data: booking, error } = await supabase
    .from("bookings")
    .select("*, services(*), providers(*)")
    .eq("reschedule_token", token)
    .single();

  if (error || !booking) {
    return { success: false, error: "Invalid or expired reschedule token" };
  }

  const oldStartTime = booking.start_time;
  const oldEndTime = booking.end_time;

  const slotCheck = await validateBookingSlot(
    booking.booking_link_id,
    newStartTime,
    newEndTime
  );
  if (!slotCheck.valid) {
    return { success: false, error: slotCheck.reason };
  }

  const overlapCheck = await checkBookingOverlap(
    booking.provider_id,
    booking.staff_user_id,
    newStartTime,
    newEndTime
  );
  if (!overlapCheck.valid) {
    return { success: false, error: overlapCheck.reason };
  }

  // ✅ Update booking time
  const { error: updateError } = await supabase
    .from("bookings")
    .update({
      start_time: newStartTime,
      end_time: newEndTime,
      status: "rescheduled",
    })
    .eq("id", booking.id);

  if (updateError) {
    return { success: false, error: "Failed to update booking" };
  }

    // Remove newly booked slot from cache
  await removeBookedSlotFromCache({
    bookingLinkId: booking.booking_link_id,
    slotStart: newStartTime,
    slotEnd: newEndTime,
  });

   // ✅ Add the old slot back to cache (since it's now free)
  await addSlotToAvailabilityCache({
    bookingLinkId: booking.booking_link_id,
    date: oldStartTime.split("T")[0],
    start: oldStartTime,
    end: oldEndTime,
  });

  // ✅ Notify client
  const clientEmail = booking.client_email;
  const clientName = booking.client_name || "there";
  const serviceName = booking.services?.name || "Service";
  const providerName = booking.providers?.name || "Provider";
  const timezone = booking.timezone || "UTC";

  if (clientEmail) {
    await sendBookingRescheduleEmail({
      to: clientEmail,
      clientName,
      serviceName,
      providerName,
      startTime: newStartTime,
      endTime: newEndTime,
      timezone,
    });
  }

  return { success: true, bookingId: booking.id };
}

export async function cancelBookingByToken(token: string) {
  const supabase = createSupabaseAdminClient();

  const { data: booking, error } = await supabase
    .from("bookings")
    .select("*, services(*), providers(*)")
    .eq("cancel_token", token)
    .single();

  if (error || !booking) {
    return { success: false, error: "Invalid or expired cancel token" };
  }

  const cancellationCutoffHours = booking.booking_links?.cancellation_cutoff_hours ?? 0;

  const bookingStart = new Date(booking.start_time);
  const cutoffTime = new Date(bookingStart.getTime() - cancellationCutoffHours * 60 * 60 * 1000);

  if (new Date() > cutoffTime) {
    return {
      success: false,
      error: `Cannot cancel booking less than ${cancellationCutoffHours} hour(s) before start time.`,
    };
  }

  const { error: cancelError } = await supabase
    .from("bookings")
    .update({
      status: "cancelled",
      cancel_token: null,
      reschedule_token: null,
    })
    .eq("id", booking.id);

  if (cancelError) {
    return { success: false, error: "Failed to cancel booking" };
  }

  // Add the cancelled slot back into availability cache
  const date = booking.start_time.split("T")[0];
  await addSlotToAvailabilityCache({
    bookingLinkId: booking.booking_link_id,
    date,
    start: booking.start_time,
    end: booking.end_time,
  });

  const clientEmail = booking.users?.email;
  const clientName = booking.users?.first_name || "there";
  const serviceName = booking.services?.name || "a service";
  const providerName = booking.providers?.name || "a provider";

  if (clientEmail) {
    await sendBookingCancellationEmail({
      to: clientEmail,
      clientName,
      serviceName,
      providerName,
    });
  }

  return { success: true, bookingId: booking.id };
}


export async function getBookingById(id: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
  .from("bookings")
  .select("*")
  .eq(`id`, id)
  .maybeSingle();


  if (error || !data) {
    return null;
  }

  return data;
}
