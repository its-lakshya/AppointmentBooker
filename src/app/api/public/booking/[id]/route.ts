// File: /app/api/public/booking/[token]/route.ts (GET)

import { getBookingById } from "@/lib/db/bookings";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  context: { params: Promise<{ token: string }> }
) => {
  const { token } = await context.params;

  const booking = await getBookingById(token);

  if (!booking) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 404 });
  }

  return NextResponse.json({ booking });
};
