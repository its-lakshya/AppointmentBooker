import { getBookingByStaffClerkId } from "@/lib/db/bookings";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // console.log(userId)
  const { bookings, error } = await getBookingByStaffClerkId(userId);
  // console.log(bookings)

  if (error) {
    console.error("Error fetching bookings for staff:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking links" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, bookings });
}
