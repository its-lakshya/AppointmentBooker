// lib/db/addon.ts

import { createSupabaseAdminClient } from '@/lib/supabase/supabase'

type AddonInput = {
  serviceId: string
  name: string
  description?: string
  additionalMinutes?: number
  additionalPrice?: number
}

export async function createAddon({
  serviceId,
  name,
  description,
  additionalMinutes,
  additionalPrice,
}: AddonInput) {
  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .from('addons')
    .insert({
      service_id: serviceId,
      name,
      description,
      additional_minutes: additionalMinutes ?? 0,
      additional_price: additionalPrice ?? 0,
    })
    .select()
    .single()

  return { addon: data, error }
}

export async function getAddonsByServiceId(serviceId: string) {
  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .from('addons')
    .select('*')
    .eq('service_id', serviceId)

  return { addons: data, error }
}

export async function updateAddon(
  addonId: string,
  updates: Partial<Omit<AddonInput, 'serviceId'>>
) {
  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .from('addons')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', addonId)
    .select()
    .single()

  return { addon: data, error }
}

export async function deleteAddon(addonId: string) {
  const supabase = createSupabaseAdminClient()

  const { error } = await supabase
    .from('addons')
    .delete()
    .eq('id', addonId)

  return { success: !error, error }
}

export async function getAddonById(addonId: string) {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("addons")
    .select("*")
    .eq("id", addonId)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}
