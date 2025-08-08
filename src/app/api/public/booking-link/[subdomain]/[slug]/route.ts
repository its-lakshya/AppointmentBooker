import { getProviderBySubdomain } from "@/lib/db/providers";
import { createSupabaseAdminClient } from "@/lib/supabase/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  context: { params: Promise<{ subdomain: string; slug: string }> }
) {
  const supabase = createSupabaseAdminClient();

  const { subdomain, slug } = await context.params;

  // 1. Get provider by subdomain
  const { data: provider, error: providerError } =
    await getProviderBySubdomain(subdomain);

  if (providerError || !provider) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  // 2. Get booking link by slug and provider_id
  const { data: bookingLink, error: bookingLinkError } = await supabase
    .from("booking_links")
    .select("*")
    .eq("provider_id", provider.id)
    .eq("slug", slug)
    .single();

  if (bookingLinkError || !bookingLink) {
    return NextResponse.json(
      { error: "Booking link not found" },
      { status: 404 }
    );
  }

  // 3. Get related services
  const { data: serviceRow, error: serviceRowError } = await supabase
    .from("booking_link_services")
    .select("service_id")
    .eq("booking_link_id", bookingLink.id)
    .single();

  if (serviceRowError || !serviceRow) {
    return NextResponse.json({ error: "No service linked" }, { status: 404 });
  }

  // Step 2: Get the service details
  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("*")
    .eq("id", serviceRow.service_id)
    .single(); // 👈 we expect only one row

  if (serviceError || !service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  // 4. Get related staff
  const { data: linkStaff } = await supabase
    .from("booking_link_staff")
    .select("user_id")
    .eq("booking_link_id", bookingLink.id);

  const staffIds = linkStaff?.map((s) => s.user_id) || [];

  const { data: staff } = await supabase
    .from("users")
    .select("id, first_name, last_name, image_url")
    .in("id", staffIds);

  return NextResponse.json({
    success: true,
    bookingLink,
    service,
    staff,
  });
}
