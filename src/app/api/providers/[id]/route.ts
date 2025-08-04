import {
  deleteProvider,
  getProviderById,
  updateProvider,
} from "@/lib/db/providers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { provider, error } = await getProviderById(params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ provider }, { status: 200 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const updates = await req.json();

  if (updates.subdomain && typeof updates.subdomain !== "string") {
    return NextResponse.json(
      { error: "Invalid subdomain format" },
      { status: 400 }
    );
  }

  const { provider, error } = await updateProvider(params.id, updates);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ provider }, { status: 200 });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { success, error } = await deleteProvider(params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success }, { status: 200 });
}
