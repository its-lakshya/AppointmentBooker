import { getBookingLinkByProviderSlugAndSubdomain } from "@/lib/db/booking_links";
import { createSupabaseAdminClient } from "@/lib/supabase/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ subdomain: string; slug: string }> }
) {
  const { subdomain, slug } = await context.params;
  const { searchParams } = new URL(req.url);

  const start = searchParams.get("start"); // "2025-08-08"
  const end = searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json(
      { error: "Missing start or end query param" },
      { status: 400 }
    );
  }

  const { bookingLink, bookingError } = await getBookingLinkByProviderSlugAndSubdomain(
    subdomain,
    slug
  );

  if (bookingError || !bookingLink) {
    return NextResponse.json({ error: "Booking link not found" }, { status: 404 });
  }

  const supabase = createSupabaseAdminClient();

  // 1. Get availability_cache rows for the date range
  const { data: availabilityRows, error: availabilityErr } = await supabase
    .from("availability_cache")
    .select("start_date, slots")
    .eq("booking_link_id", bookingLink.id)
    .gte("start_date", start)
    .lte("start_date", end);

  if (availabilityErr || !availabilityRows) {
    return NextResponse.json({ error: "Unable to load availability" }, { status: 500 });
  }

  // Flatten all slots from all days into one array
  const allAvailableSlots = availabilityRows.flatMap((row) => row.slots);

  // 2. Fetch all bookings in same range for this booking link
  const { data: bookings, error: bookingErr } = await supabase
    .from("bookings")
    .select("start_time, end_time")
    .eq("booking_link_id", bookingLink.id)
    .gte("start_time", `${start}T00:00:00Z`)
    .lte("end_time", `${end}T23:59:59Z`)
    .neq("status", "cancelled");

  if (bookingErr) {
    console.log("Booking fetch error object:", bookingErr);
    return NextResponse.json({ error: "Unable to fetch bookings" }, { status: 500 });
  }

  const bookedTimeRanges = bookings.map((b) => ({
    start: b.start_time,
    end: b.end_time,
  }));

  // 3. Filter out already booked slots
  const availableSlots = allAvailableSlots.filter((slot: { start: string; end: string }) => {
    return !bookedTimeRanges.some(
      (booking) =>
        slot.start < booking.end && slot.end > booking.start // overlap check
    );
  });

  return NextResponse.json({
    availableSlots,
    bookedSlots: bookedTimeRanges,
    timezone: bookingLink.availability_config.timezone,
  });
}
