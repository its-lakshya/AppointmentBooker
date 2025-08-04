import { rescheduleBookingByToken } from "@/lib/db/bookings";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (
  req: NextRequest,
  context: { params: Promise<{ token: string }> }
) => {
  const { token } = await context.params;
  const { startTime, endTime } = await req.json();

  const result = await rescheduleBookingByToken(token, startTime, endTime);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
};
