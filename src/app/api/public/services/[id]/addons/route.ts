import { getAddonsByServiceId } from "@/lib/db/addons";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const serviceId = id;

  if (!serviceId) {
    return NextResponse.json(
      { success: false, message: "Missing service ID" },
      { status: 400 }
    );
  }

  try {
    const { addons, error } = await getAddonsByServiceId(serviceId);

    if (error) {
      console.error("Error fetching addons:", error);
      return NextResponse.json(
        { success: false, message: "Failed to fetch addons" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: addons });
  } catch (err) {
    console.error("Unexpected error fetching addons:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
