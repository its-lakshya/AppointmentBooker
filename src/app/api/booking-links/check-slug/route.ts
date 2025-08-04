import { isBookingLinkSlugAvailable } from "@/lib/db/booking_links";
import { getUserByClerkId } from "@/lib/db/users";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserByClerkId(userId);
  if (!user?.provider_id) {
    return NextResponse.json(
      { error: "User not linked to a provider" },
      { status: 403 }
    );
  }

  const rawSlug = req.nextUrl.searchParams.get("slug")?.trim().toLowerCase();
  if (!rawSlug) {
    return NextResponse.json({ error: "Missing or invalid slug" }, { status: 400 });
  }

  const { available, error } = await isBookingLinkSlugAvailable(
    user.provider_id,
    rawSlug
  );

  if (error) {
    console.error("Error checking slug availability:", error);
    return NextResponse.json({ error: "Error checking slug" }, { status: 500 });
  }

  return NextResponse.json({ success: true, available });
}
