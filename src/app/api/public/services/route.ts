// /api/public/services
import { getProviderById } from "@/lib/db/providers";
import { getServicesByProviderId } from "@/lib/db/services";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const providerIdentifier = searchParams.get("provider")?.trim();

  if (!providerIdentifier) {
    return NextResponse.json(
      { success: false, message: "Missing provider identifier" },
      { status: 400 }
    );
  }

  try {
    const {provider, error} = await getProviderById(providerIdentifier); // Should support subdomain or ID
    if (!provider) {
      return NextResponse.json(
        { success: false, message: "Provider not found" },
        { status: 404 }
      );
    }

    if (error || !provider) {
      return NextResponse.json(
        { success: false, message: "Provider not found" },
        { status: 404 }
      );
    }

    const services = await getServicesByProviderId(provider.id);

    return NextResponse.json(
      { success: true, data: services },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching public services:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch services" },
      { status: 500 }
    );
  }
}
