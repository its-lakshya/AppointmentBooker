import { createSupabaseAdminClient } from "@/lib/supabase/supabase";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  const body = await req.json();
  const {serviceId} = body;
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createSupabaseAdminClient();
  const { data: addons, error } = await supabase
    .from("addons")
    .select("id, service_id, name, description, additional_minutes, additional_price")
    .eq("service_id", serviceId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

    return NextResponse.json({ success: true, addons });
}