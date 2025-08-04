import { inviteStaff } from "@/lib/clerk/invite";
import { getUserByClerkId } from "@/lib/db/users";
import { createSupabaseAdminClient } from "@/lib/supabase/supabase";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  const { email } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const user = await getUserByClerkId(userId);

  const providerId = user?.provider_id;
  const role = user?.role;

  if (!providerId) {
    return NextResponse.json(
      { error: "User not linked to a provider" },
      { status: 400 }
    );
  }

  if (role !== "admin") {
    return NextResponse.json(
      { error: "Only admins can invite staff" },
      { status: 403 }
    );
  }

  // Check if email already exists in users table
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingUser) {
    return NextResponse.json(
      { error: "This email is already associated with an account" },
      { status: 400 }
    );
  }

  try {
    const invitation = await inviteStaff({ email, providerId });

    return NextResponse.json({
      success: true,
      invitation: {
        email: invitation.emailAddress,
        status: invitation.status,
        id: invitation.id,
      },
    });
  } catch (error) {
    console.error("Error inviting staff:", error);
    return NextResponse.json(
      { error: "Failed to send invite" },
      { status: 500 }
    );
  }
}
