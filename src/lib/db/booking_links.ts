// Updated: /lib/db/booking_links.ts
import { createSupabaseAdminClient } from "@/lib/supabase/supabase";
import { BookingLink } from "@/types/enums";
import { PostgrestError } from "@supabase/supabase-js";

export type BookingLinkInput = {
  providerId: string;
  createdBy: string;
  slug: string;
  name: string;
  type?: string;
  maxAttendees?: number;
  paymentRequired?: boolean;
  customForm?: object;
  availabilityConfig?: object;
  serviceIds: string[];
  staffIds?: string[];
  addonIds?: string[];
};

type BookingLinkResult = {
  // eslint-disable-next-line
  bookingLink: any | null;
  error: PostgrestError | Error | null;
};

export async function createBookingLink(input: BookingLinkInput): Promise<BookingLinkResult> {
  const supabase = createSupabaseAdminClient();

  const { data: bookingLink, error: linkError } = await supabase
    .from("booking_links")
    .insert({
      provider_id: input.providerId,
      created_by: input.createdBy,
      slug: input.slug,
      name: input.name,
      type: input.type || BookingLink.Individual,
      max_attendees: input.maxAttendees,
      payment_required: input.paymentRequired || false,
      custom_form: input.customForm || {},
      availability_config: input.availabilityConfig || {},
    })
    .select()
    .single();

  if (linkError || !bookingLink) return { bookingLink: null, error: linkError };

  if (input.serviceIds?.length) {
    const serviceRows = input.serviceIds.map((serviceId) => ({
      booking_link_id: bookingLink.id,
      service_id: serviceId,
    }));

    const { error: servicesError } = await supabase
      .from("booking_link_services")
      .upsert(serviceRows, { onConflict: "booking_link_id,service_id" });

    if (servicesError) return { bookingLink: null, error: servicesError };
  }

  if (input.staffIds?.length) {
    const staffRows = input.staffIds.map((userId) => ({
      booking_link_id: bookingLink.id,
      user_id: userId,
    }));

    const { error: staffError } = await supabase
      .from("booking_link_staff")
      .upsert(staffRows, { onConflict: "booking_link_id,user_id" });

    if (staffError) return { bookingLink: null, error: staffError };
  }

  if (input.addonIds?.length) {
    const addonRows = input.addonIds.map((addonId) => ({
      booking_link_id: bookingLink.id,
      addon_id: addonId,
    }));

    const { error: addonError } = await supabase
      .from("booking_link_addons")
      .upsert(addonRows, { onConflict: "booking_link_id,addon_id" });

    if (addonError) return { bookingLink: null, error: addonError };
  }

  return { bookingLink, error: null };
}

export async function getBookingLinksByProviderId(providerId: string) {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("booking_links")
    .select(`*,
      booking_link_services ( service_id ),
      booking_link_staff ( user_id ),
      booking_link_addons ( addon_id )`)
    .eq("provider_id", providerId);

  if (error || !data) return { bookingLinks: [], error };

  const bookingLinks = data.map((link) => ({
    ...link,
    serviceIds: link.booking_link_services?.map((s: { service_id: string }) => s.service_id) || [],
    staffIds: link.booking_link_staff?.map((s: { user_id: string }) => s.user_id) || [],
    addonIds: link.booking_link_addons?.map((a: { addon_id: string }) => a.addon_id) || [],
  }));

  return { bookingLinks, error: null };
}

export async function updateBookingLink(
  bookingLinkId: string,
  updates: Omit<BookingLinkInput, "createdBy"> & { providerId: string }
): Promise<BookingLinkResult> {
  const supabase = createSupabaseAdminClient();

  const {
    name,
    slug,
    type,
    maxAttendees,
    paymentRequired,
    customForm,
    availabilityConfig,
    serviceIds,
    staffIds,
    addonIds,
    providerId
  } = updates;

  const fieldsToUpdate = {
    payment_required: paymentRequired,
    name,
    slug,
    type,
    max_attendees: maxAttendees,
    custom_form: customForm,
    availability_config: availabilityConfig
  };

  const { data: bookingLink, error } = await supabase
    .from("booking_links")
    .update(fieldsToUpdate)
    .eq("id", bookingLinkId)
    .eq("provider_id", providerId)
    .select()
    .single();

  if (error) return { bookingLink: null, error };

  if (serviceIds) {
    await supabase.from("booking_link_services").delete().eq("booking_link_id", bookingLinkId);
    if (serviceIds.length) {
      const serviceInserts = serviceIds.map((serviceId) => ({ booking_link_id: bookingLinkId, service_id: serviceId }));
      await supabase.from("booking_link_services").upsert(serviceInserts, { onConflict: "booking_link_id,service_id" });
    }
  }

  if (staffIds) {
    await supabase.from("booking_link_staff").delete().eq("booking_link_id", bookingLinkId);
    if (staffIds.length) {
      const staffInserts = staffIds.map((userId) => ({ booking_link_id: bookingLinkId, user_id: userId }));
      await supabase.from("booking_link_staff").upsert(staffInserts, { onConflict: "booking_link_id,user_id" });
    }
  }

  if (addonIds) {
    await supabase.from("booking_link_addons").delete().eq("booking_link_id", bookingLinkId);
    if (addonIds.length) {
      const addonInserts = addonIds.map((addonId) => ({ booking_link_id: bookingLinkId, addon_id: addonId }));
      await supabase.from("booking_link_addons").upsert(addonInserts, { onConflict: "booking_link_id,addon_id" });
    }
  }

  return { bookingLink, error: null };
}

export async function deleteBookingLink(bookingLinkId: string, providerId: string) {
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from("booking_links")
    .delete()
    .eq("id", bookingLinkId)
    .eq("provider_id", providerId);

  return { success: !error, error };
}

export async function isBookingLinkSlugAvailable(providerId: string, slug: string) {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("booking_links")
    .select("id")
    .eq("provider_id", providerId)
    .eq("slug", slug)
    .maybeSingle();

  return { available: !data, error };
}

export async function getBookingLinkByProviderSlugAndSubdomain(providerSubdomain: string, slug: string) {
  const supabase = createSupabaseAdminClient();

  const { data: provider, error: providerError } = await supabase
    .from("providers")
    .select("id")
    .eq("subdomain", providerSubdomain)
    .maybeSingle();

  if (providerError || !provider) {
    return { bookingLink: null, error: providerError || new Error("Provider not found") };
  }

  const { data: bookingLink, error: linkError } = await supabase
    .from("booking_links")
    .select("*")
    .eq("provider_id", provider.id)
    .eq("slug", slug)
    .maybeSingle();

  return { bookingLink, bookingError: linkError };
}