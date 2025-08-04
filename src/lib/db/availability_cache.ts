// import { AvailabilityCache } from "@/types/db";
import { createSupabaseAdminClient } from "../supabase/supabase";

export async function insertAvailabilityCache(data: {
  provider_id: string;
  booking_link_id: string;
  start_date: string;
  slots: { start: string; end: string }[];
  timezone: string;
}) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("availability_cache").insert({
    provider_id: data.provider_id,
    booking_link_id: data.booking_link_id,
    start_date: data.start_date,
    slots: data.slots,
    timezone: data.timezone,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  });

  if (error) {
    console.error("Error inserting availability cache", error);
  }
}

export async function removeBookedSlotFromCache({
  bookingLinkId,
  slotStart,
  slotEnd,
}: {
  bookingLinkId: string;
  slotStart: string; // ISO string
  slotEnd: string;   // ISO string
}) {
  const supabase = createSupabaseAdminClient();
  const startDate = slotStart.split("T")[0]; // YYYY-MM-DD

  // 1. Fetch the relevant availability_cache row
  const { data: cache, error } = await supabase
    .from("availability_cache")
    .select("id, slots")
    .eq("booking_link_id", bookingLinkId)
    .eq("start_date", startDate)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch availability cache:", error);
    return;
  }

  if (!cache) {
    console.warn("No availability cache found for date:", startDate);
    return;
  }

  const slots: { start: string; end: string }[] = cache.slots;
  // console.log(slotStart + "-" + slotEnd + "-" + slots[0].start + "-" + slots[0].end)
  // 2. Remove the booked slot (exact match)
  const updatedSlots = slots.filter(
    (slot) => !(slot.start === slotStart && slot.end === slotEnd)
  );

  console.log(updatedSlots)
  console.log(updatedSlots.length, slots.length)

  // 3. Update the cache if anything was removed
  if (updatedSlots.length !== slots.length) {
    const { error: updateError } = await supabase
      .from("availability_cache")
      .update({ slots: updatedSlots })
      .eq("id", cache.id);

    if (updateError) {
      console.error("Failed to update availability cache:", updateError);
    }
  }
}

export async function addSlotToAvailabilityCache({
  bookingLinkId,
  date,
  start,
  end,
}: {
  bookingLinkId: string;
  date: string;
  start: string;
  end: string;
}) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("availability_cache")
    .select("slots")
    .eq("booking_link_id", bookingLinkId)
    .eq("start_date", date)
    .maybeSingle();

  if (error) return;

  const existingSlots = (data?.slots || []) as {
    start: string;
    end: string;
  }[];

  const newSlots = [...existingSlots, { start, end }];
  newSlots.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  await supabase
    .from("availability_cache")
    .update({ slots: newSlots })
    .eq("booking_link_id", bookingLinkId)
    .eq("start_date", date);
}
