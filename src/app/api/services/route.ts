import { createService, getServicesByProviderId } from "@/lib/db/services";
import { getUserByClerkId } from "@/lib/db/users";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserByClerkId(userId);
  if (!user?.provider_id || user.role !== "admin") {
    return NextResponse.json(
      { error: "Only provider admins can create services" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { name, description, duration, price, allow_addons } = body;

  if (!name || !duration) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const service = await createService({
      providerId: user.provider_id,
      name,
      description,
      duration,
      price,
      allow_addons,
    });

    return NextResponse.json({ success: true, service });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
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

  try {
    const services = await getServicesByProviderId(user.provider_id);
    return NextResponse.json({ success: true, services });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}
