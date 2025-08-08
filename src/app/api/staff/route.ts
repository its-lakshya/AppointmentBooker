import { getUserByClerkId } from "@/lib/db/users";
import { createSupabaseAdminClient } from "@/lib/supabase/supabase";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getUserByClerkId(userId);
  if (!user?.provider_id || user.role !== "admin") {
    return NextResponse.json(
      { error: "Only admins can view staff list" },
      { status: 403 }
    );
  }

  const supabase = createSupabaseAdminClient();
  const { data: staff, error } = await supabase
    .from("users")
    .select("id, first_name, last_name, email, image_url, role, created_at")
    .eq("provider_id", user.provider_id)
    .neq("id", user.id); // Exclude self if needed

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

    return NextResponse.json({ success: true, staff });
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  const { user_id } = await req.json();

  if (!userId || !user_id) {
    return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
  }

  const user = await getUserByClerkId(userId);
  if (!user?.provider_id || user.role !== "admin") {
    return NextResponse.json(
      { error: "Only admins can delete staff" },
      { status: 403 }
    );
  }

  const supabase = createSupabaseAdminClient();
  const actingUser = await getUserByClerkId(userId);

  if (!actingUser?.provider_id || actingUser.role !== "admin") {
    return NextResponse.json(
      { error: "Only admins can delete staff" },
      { status: 403 }
    );
  }

  if (actingUser.id === user_id) {
    return NextResponse.json(
      { error: "You cannot remove yourself" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("users")
    .delete()
    .eq("id", user_id)
    .eq("provider_id", actingUser.provider_id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
