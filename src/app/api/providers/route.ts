import { createProvider } from "@/lib/db/providers";
import { createSupabaseAdminClient } from "@/lib/supabase/supabase";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, subdomain } = body;

  if (!name || !subdomain) {
    return NextResponse.json(
      { error: "Missing name or subdomain" },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdminClient();

  // Check subdomain uniqueness
  const { data: existing } = await supabase
    .from("providers")
    .select("id")
    .eq("subdomain", subdomain)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "Subdomain already in use" },
      { status: 400 }
    );
  }

  // Optional: Prevent duplicate providers per user
  const { data: existingUser } = await supabase
    .from("users")
    .select("provider_id")
    .eq("clerk_user_id", userId)
    .single();

  if (existingUser?.provider_id) {
    return NextResponse.json(
      { error: "User already linked to a provider" },
      { status: 400 }
    );
  }

  const { provider, error } = await createProvider({
    name: body?.name,
    intro: body?.intro,
    logo_url: body?.logo_url,
    cover_image_url: body?.cover_image_url,
    colour_primary: body?.color_primary,
    colour_secondary: body?.color_secondary,
    subdomain: body?.subdomain,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Link user to provider
  await supabase
    .from("users")
    .update({ provider_id: provider.id })
    .eq("clerk_user_id", userId);

  return NextResponse.json({ provider }, { status: 201 });
}
