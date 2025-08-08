// /api/user/route.ts
import { getUserByClerkId, updateUser, deleteUser } from "@/lib/db/users";
import { auth, getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/user
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await getUserByClerkId(userId);
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Fetch user failed:", error);
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
}

// PATCH /api/user
export async function PATCH(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    await updateUser({
      clerkUserId: userId,
      email: body?.email,
      firstName: body?.firstName,
      lastName: body?.lastName,
      imageUrl: body?.imageUrl,
      // phoneNumber: body.phoneNumber,
      providerId: body?.providerId,
      role: body?.role,
    });

    return NextResponse.json({ success: true, message: "User updated" });
  } catch (error) {
    console.error("Update user failed:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// DELETE /api/user
export async function DELETE(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await deleteUser(userId);
    return NextResponse.json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("Delete user failed:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
