import { deleteService, updateService } from "@/lib/db/services";
import { getUserByClerkId } from "@/lib/db/users";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = getAuth(req);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getUserByClerkId(userId);
  if (!user?.provider_id || user.role !== "admin") {
    return NextResponse.json(
      { error: "Only provider admins can update services" },
      { status: 403 }
    );
  }

  const serviceId = params.id;
  const body = await req.json();

  try {
    const service = await updateService(serviceId, body, user.provider_id);
    return NextResponse.json({ success: true, service });
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = getAuth(req);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getUserByClerkId(userId);
  if (!user?.provider_id || user.role !== "admin") {
    return NextResponse.json(
      { error: "Only provider admins can delete services" },
      { status: 403 }
    );
  }

  const serviceId = params.id;

  try {
    await deleteService(serviceId, user.provider_id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { error: "Failed to delete service" },
      { status: 500 }
    );
  }
}
