import { generateAvailabilityCacheForBookingLink } from "@/lib/availability/generateAvailabilityCache";
import { deleteBookingLink, updateBookingLink } from "@/lib/db/booking_links";
import { getUserByClerkId } from "@/lib/db/users";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, context: {params:  Promise<{id: string}>}) {
  const auth = getAuth(req);
  if (!auth.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const {id} = await context.params;
  const user = await getUserByClerkId(auth.userId);
  if (!user || !user.provider_id) {
    return NextResponse.json({ error: "User not found or missing provider_id" }, { status: 404 });
  }

  const body = await req.json();
  const {
    name,
    slug,
    type,
    maxAttendees,
    paymentRequired,
    customForm,
    availabilityConfig,
    serviceIds,
    staffIds,
    addonIds,
  } = body;

  // Validate required fields (same as POST)
  if (!name || !slug || !serviceIds?.length) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const { bookingLink, error } = await updateBookingLink(id, {
    providerId: user.provider_id,
    name,
    slug,
    type,
    maxAttendees,
    paymentRequired,
    customForm,
    availabilityConfig,
    serviceIds,
    staffIds,
    addonIds,
  });

  if (error || !bookingLink) {
    return NextResponse.json({ error: error?.message || "Failed to update booking link" }, { status: 500 });
  }

  if (availabilityConfig) {
    await generateAvailabilityCacheForBookingLink({
      providerId: user.provider_id,
      bookingLinkId: id,
      availabilityConfig,
    });
  }

  return NextResponse.json({ bookingLink }, { status: 200 });
}


export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const { userId } = getAuth(req);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getUserByClerkId(userId);
  if (!user?.provider_id || user.role !== "admin") {
    return NextResponse.json(
      { error: "Only provider admins can delete booking links" },
      { status: 403 }
    );
  }

  const { error } = await deleteBookingLink(id, user.provider_id);

  if (error) {
    console.error("Error deleting booking link:", error);
    return NextResponse.json(
      { error: "Failed to delete booking link" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
