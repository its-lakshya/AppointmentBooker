import { createSupabaseAdminClient } from '@/lib/supabase/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { createBooking, checkBookingOverlap, validateBookingSlot, validateServiceAndStaff } from '@/lib/db/bookings'
import { sendBookingConfirmationEmail } from '@/lib/email/sendBookingConfirmationEmail'
import { removeBookedSlotFromCache } from '@/lib/db/availability_cache';

  // export async function POST(
  //   req: NextRequest,
  //   context: { params: Promise<{ subdomain: string; slug: string }> }
  // ) {
  //   const supabase = createSupabaseAdminClient()
  //   const body = await req.json()
  //   const { subdomain, slug } = await context.params

  //   const {
  //     serviceId,
  //     staffUserId,
  //     clientName,
  //     clientEmail,
  //     clientPhone,
  //     startTime,
  //     endTime,
  //     timezone,
  //     price,
  //     addonIds = [],
  //     attendeeCount,
  //     intakeData,
  //     attendees,
  //   } = body

  //   if (!serviceId || !clientName || !clientEmail || !startTime || !endTime || !timezone) {
  //     return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  //   }

  //   if (attendeeCount && attendeeCount > 1) {
  //     if (!Array.isArray(attendees) || attendees.length < attendeeCount - 1) {
  //       return NextResponse.json({ error: 'Insufficient attendee information' }, { status: 400 })
  //     }
  //   }

  //   const { data: provider, error: providerError } = await supabase
  //     .from('providers')
  //     .select('*')
  //     .eq('subdomain', subdomain)
  //     .maybeSingle()

  //   if (providerError || !provider) {
  //     return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
  //   }

  //   const { data: bookingLink, error: linkError } = await supabase
  //     .from('booking_links')
  //     .select('id, provider_id')
  //     .eq('provider_id', provider.id)
  //     .eq('slug', slug)
  //     .maybeSingle()

  //   if (linkError || !bookingLink) {
  //     return NextResponse.json({ error: 'Booking link not found' }, { status: 404 })
  //   }

  //     let finalStaffUserId = staffUserId;

  //   if (!finalStaffUserId) {
  //     const { data: linkStaff, error } = await supabase
  //       .from("booking_link_staff")
  //       .select("user_id")
  //       .eq("booking_link_id", bookingLink.id);

  //     if (linkStaff && linkStaff.length > 0) {
  //       finalStaffUserId = linkStaff[0].user_id;
  //     } else {
  //       return NextResponse.json(
  //         { error: "No staff assigned to this booking link" },
  //         { status: 400 }
  //       );
  //     }
  //   }

  //   // Validate service & staff
  //   const { valid, reason } = await validateServiceAndStaff(
  //     provider.id,
  //     serviceId,
  //     finalStaffUserId
  //   );

  //   if (!valid) {
  //     return NextResponse.json({ error: reason }, { status: 400 });
  //   }

  //   // Validate slot
  //   const slotCheck = await validateBookingSlot(bookingLink.id, startTime, endTime)
  //   if (!slotCheck.valid) {
  //     return NextResponse.json({ error: slotCheck.reason }, { status: 400 })
  //   }

  //   // Check overlap for staff
  //   if (staffUserId) {
  //     const overlapCheck = await checkBookingOverlap(provider.id, staffUserId, startTime, endTime)
  //     if (!overlapCheck.valid) {
  //       return NextResponse.json({ error: overlapCheck.reason }, { status: 400 })
  //     }
  //   }

  //   // Validate service and staff ownership
  //   const ownershipCheck = await validateServiceAndStaff(provider.id, serviceId, staffUserId)
  //   if (!ownershipCheck.valid) {
  //     return NextResponse.json({ error: ownershipCheck.reason }, { status: 400 })
  //   }

  //   // ✅ Validate addonIds (if passed)
  //   if (addonIds && addonIds.length > 0) {
  //     const { data: validAddons, error: addonError } = await supabase
  //       .from('addons')
  //       .select('id')
  //       .eq('service_id', serviceId)

  //     if (addonError) {
  //       return NextResponse.json({ error: 'Failed to validate addons' }, { status: 500 })
  //     }

  //     const validAddonIds = validAddons.map(a => a.id)
  //     const invalidAddons = addonIds.filter((id: string) => !validAddonIds.includes(id))

  //     if (invalidAddons.length > 0) {
  //       return NextResponse.json({ error: 'One or more selected addons are invalid' }, { status: 400 })
  //     }
  //   }

  //   // Create booking
  //   const { booking, error: bookingError } = await createBooking({
  //     providerId: provider.id,
  //     bookingLinkId: bookingLink.id,
  //     serviceId,
  //     staffUserId,
  //     clientName,
  //     clientEmail,
  //     clientPhone,
  //     startTime,
  //     endTime,
  //     timezone,
  //     price,
  //     addonIds,
  //     attendeeCount,
  //     intakeData,
  //     attendees,
  //   })

  //   if (bookingError) {
  //     console.error('Booking creation error:', bookingError)
  //     return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  //   }

  //   console.info(`✅ Booking created for ${clientEmail} at ${startTime} - ${endTime}`)

  //   try {
  //     const { data: serviceData } = await supabase
  //       .from('services')
  //       .select('name')
  //       .eq('id', serviceId)
  //       .maybeSingle()

  //     await sendBookingConfirmationEmail({
  //       to: clientEmail,
  //       clientName,
  //       serviceName: serviceData?.name || 'your service',
  //       providerName: provider?.name || 'your provider',
  //       startTime,
  //       endTime,
  //       timezone,
  //     })
  //   } catch (e) {
  //     console.error('⚠️ Failed to send confirmation email:', e)
  //   }

  //   return NextResponse.json({ success: true, bookingId: booking.id })
  // }

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ subdomain: string; slug: string }> }
) {
  const supabase = createSupabaseAdminClient();
  const body = await req.json();
  const { subdomain, slug } = await context.params;

  const {
    serviceId,
    staffUserId,
    clientName,
    clientEmail,
    clientPhone,
    startTime,
    endTime,
    timezone,
    status,
    paymentStatus,
    price,
    attendeeCount,
    intakeData,
    attendees,
    addonIds
  } = body;

  // 🔍 Validate required fields
  if (!serviceId || !clientName || !clientEmail || !startTime || !endTime || !timezone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // 👥 Validate attendees if group booking
  if (attendeeCount && attendeeCount > 1) {
    if (!Array.isArray(attendees) || attendees.length < attendeeCount - 1) {
      return NextResponse.json({ error: "Insufficient attendee information" }, { status: 400 });
    }
  }

  // 📦 Fetch provider by subdomain
  const { data: provider, error: providerError } = await supabase
    .from("providers")
    .select("*")
    .eq("subdomain", subdomain)
    .maybeSingle();

  if (providerError || !provider) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  // 🔗 Fetch booking link
  const { data: bookingLink, error: linkError } = await supabase
    .from("booking_links")
    .select("id, provider_id")
    .eq("provider_id", provider.id)
    .eq("slug", slug)
    .maybeSingle();

  if (linkError || !bookingLink) {
    return NextResponse.json({ error: "Booking link not found" }, { status: 404 });
  }

  // 👤 Determine staff (fallback to booking_link_staff)
  let finalStaffUserId = staffUserId;

  if (!finalStaffUserId) {
    const { data: linkStaff, error: staffError } = await supabase
      .from("booking_link_staff")
      .select("user_id")
      .eq("booking_link_id", bookingLink.id);

    if (staffError || !linkStaff || linkStaff.length === 0) {
      return NextResponse.json(
        { error: "No staff assigned to this booking link" },
        { status: 400 }
      );
    }

    finalStaffUserId = linkStaff[0].user_id;
  }

  // ✅ Validate service & staff ownership
  const ownershipCheck = await validateServiceAndStaff(provider.id, serviceId, finalStaffUserId);
  if (!ownershipCheck.valid) {
    return NextResponse.json({ error: ownershipCheck.reason }, { status: 400 });
  }

  // 🧠 Validate availability slot
  const slotCheck = await validateBookingSlot(bookingLink.id, startTime, endTime);
  if (!slotCheck.valid) {
    return NextResponse.json({ error: slotCheck.reason }, { status: 400 });
  }

  // 🔄 Check for overlapping bookings
  const overlapCheck = await checkBookingOverlap(provider.id, finalStaffUserId, startTime, endTime);
  if (!overlapCheck.valid) {
    return NextResponse.json({ error: overlapCheck.reason }, { status: 400 });
  }

  // ➕ Validate addonIds
  if (addonIds && addonIds.length > 0) {
    const { data: validAddons, error: addonError } = await supabase
      .from("addons")
      .select("id")
      .eq("service_id", serviceId);

    if (addonError) {
      return NextResponse.json({ error: "Failed to validate addons" }, { status: 500 });
    }

    const validAddonIds = validAddons.map((a) => a.id);
    const invalidAddons = addonIds.filter((id: string) => !validAddonIds.includes(id));

    if (invalidAddons.length > 0) {
      return NextResponse.json(
        { error: "One or more selected addons are invalid" },
        { status: 400 }
      );
    }
  }

  // 🛠 Create booking
  const { booking, error: bookingError } = await createBooking({
    providerId: provider.id,
    bookingLinkId: bookingLink.id,
    serviceId,
    staffUserId: finalStaffUserId,
    clientName,
    clientEmail,
    clientPhone,
    startTime,
    endTime,
    timezone,
    status,
    paymentStatus,
    price,
    attendeeCount,
    intakeData,
    attendees,
  });

  if (bookingError) {
    console.error("Booking creation error:", bookingError);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }

  try {
    await removeBookedSlotFromCache({
      bookingLinkId: booking.booking_link_id,
      slotStart: booking.start_time,
      slotEnd: booking.end_time,
    });
    console.log("✅ Slot removed from availability cache successfully.");
  } catch (err) {
    console.error("❌ Failed to remove booked slot from availability cache:", err);
    // Optionally, report to error tracking/logs or alert devs
  }


  // 📧 Send confirmation email
  try {
    const { data: serviceData } = await supabase
      .from("services")
      .select("name")
      .eq("id", serviceId)
      .maybeSingle();

    await sendBookingConfirmationEmail({
      to: clientEmail,
      clientName,
      serviceName: serviceData?.name || "your service",
      providerName: provider.name || "your provider",
      startTime,
      endTime,
      timezone,
    });
  } catch (e) {
    console.error("⚠️ Failed to send confirmation email:", e);
  }

  console.info(`✅ Booking created for ${clientEmail} at ${startTime} - ${endTime}`);

  return NextResponse.json({ success: true, bookingId: booking.id });
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ subdomain: string; slug: string }> }
) {
  const supabase = createSupabaseAdminClient()
  const { subdomain, slug } = await context.params;

  // 1. Get provider
  const { data: provider, error: providerError } = await supabase
    .from('providers')
    .select('id')
    .eq('subdomain', subdomain)
    .maybeSingle()

  if (providerError || !provider) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
  }

  // 2. Get booking link
  const { data: bookingLink, error: linkError } = await supabase
    .from('booking_links')
    .select('*')
    .eq('provider_id', provider.id)
    .eq('slug', slug)
    .maybeSingle()

  if (linkError || !bookingLink) {
    return NextResponse.json({ error: 'Booking link not found' }, { status: 404 })
  }

  // 3. Get services
  const { data: serviceIds, error: serviceError } = await supabase
    .from('booking_link_services')
    .select('service_id')
    .eq('booking_link_id', bookingLink.id)

  if (serviceError) {
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
  }

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .in('id', serviceIds.map(s => s.service_id))

  // 4. Get staff
  const { data: staffIds, error: staffError } = await supabase
    .from('booking_link_staff')
    .select('user_id')
    .eq('booking_link_id', bookingLink.id)

  if (staffError) {
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 })
  }

  const { data: staff } = await supabase
    .from('users')
    .select('id, first_name, last_name, image_url')
    .in('id', staffIds.map(s => s.user_id))

  return NextResponse.json({
    success: true,
    bookingLink,
    services,
    staff,
  })
}
