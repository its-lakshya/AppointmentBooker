import { getAuth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/users";
import { deleteAddon, updateAddon, getAddonById } from "@/lib/db/addons";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; addonId: string } }
) {
  const { userId } = getAuth(req);
  const body = await req.json();
  const serviceId = params.id;
  const addonId = params.addonId;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserByClerkId(userId);

  if (!user?.provider_id || user.role !== "admin") {
    return NextResponse.json(
      { error: "Only provider admins can update addons" },
      { status: 403 }
    );
  }

  const addon = await getAddonById(addonId);
  if (!addon || addon.service_id !== serviceId) {
    return NextResponse.json({ error: "Addon not found or access denied" }, { status: 404 });
  }

  try {
    const updated = await updateAddon(addonId, body);
    return NextResponse.json({ success: true, addon: updated });
  } catch (error) {
    console.error("Error updating addon:", error);
    return NextResponse.json({ error: "Failed to update addon" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; addonId: string } }
) {
  const { userId } = getAuth(req);
  const serviceId = params.id;
  const addonId = params.addonId;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserByClerkId(userId);

  if (!user?.provider_id || user.role !== "admin") {
    return NextResponse.json(
      { error: "Only provider admins can delete addons" },
      { status: 403 }
    );
  }

  const addon = await getAddonById(addonId);
  if (!addon || addon.service_id !== serviceId) {
    return NextResponse.json({ error: "Addon not found or access denied" }, { status: 404 });
  }

  try {
    const result = await deleteAddon(addonId);
    return NextResponse.json({ success: result.success });
  } catch (error) {
    console.error("Error deleting addon:", error);
    return NextResponse.json({ error: "Failed to delete addon" }, { status: 500 });
  }
}
