import { NextRequest, NextResponse } from "next/server";
import {
  createBookingLink,
  getBookingLinksByProviderId,
  isBookingLinkSlugAvailable,
} from "@/lib/db/booking_links";
import { getUserByClerkId } from "@/lib/db/users";
import { getAuth } from "@clerk/nextjs/server";
import { generateAvailabilityCacheForBookingLink } from "@/lib/availability/generateAvailabilityCache";

export async function POST(req: NextRequest) {
  const auth = getAuth(req);
  if (!auth.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    serviceId,
    staffIds,
    addonIds,
  } = body;

  if (!name || !slug || !serviceId || !availabilityConfig) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const { available, error: slugCheckError } = await isBookingLinkSlugAvailable(
    user.provider_id,
    slug
  );

  if (slugCheckError) {
    console.error("Error checking slug availability:", slugCheckError);
    return NextResponse.json(
      { error: "Error checking slug availability" },
      { status: 500 }
    );
  }

  if (!available) {
    return NextResponse.json(
      { error: "Slug already taken" },
      { status: 400 }
    );
  }

  const { bookingLink, error } = await createBookingLink({
    providerId: user.provider_id,
    createdBy: user.id,
    name,
    slug,
    type,
    maxAttendees,
    paymentRequired,
    customForm,
    availabilityConfig,
    serviceId,
    staffIds,
    addonIds,
  });

  if (error || !bookingLink) {
    return NextResponse.json({ error: error?.message || "Failed to create booking link" }, { status: 500 });
  }

  if (availabilityConfig) {
    await generateAvailabilityCacheForBookingLink({
      providerId: user.provider_id,
      bookingLinkId: bookingLink.id,
      availabilityConfig,
    });
  }

  return NextResponse.json({ success: true, bookingLink });
}


export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserByClerkId(userId);
  if (!user?.provider_id) {
    return NextResponse.json(
      { error: "User is not linked to a provider" },
      { status: 403 }
    );
  }

  const { bookingLinks, error } = await getBookingLinksByProviderId(user.provider_id);

  if (error) {
    console.error("Error fetching booking links:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking links" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, bookingLinks });
}
