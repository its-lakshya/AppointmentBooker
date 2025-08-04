import { createSupabaseAdminClient } from '@/lib/supabase/supabase'

export async function createService({
  providerId,
  name,
  description,
  duration,
  price,
  allow_addons,
}: {
  providerId: string
  name: string
  description?: string
  duration: number
  price?: number
  allow_addons?: boolean
}) {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('services')
    .insert({
      provider_id: providerId,
      name,
      description,
      duration_minutes: duration,
      price,
      allow_addons,
    })
    .select()
    .single()

  if (error || !data) throw new Error(error?.message)
  return data
}

export async function getServicesByProviderId(providerId: string) {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('provider_id', providerId)

  if (error || !data) throw new Error(error?.message)
  return data
}

export async function updateService(id: string, updates: Partial<{
  name?: string
  description?: string
  duration?: number
  price?: number
  allow_addons?: boolean
}>, providerId: string) {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('services')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('provider_id', providerId)
    .select()
    .single()

  if (error || !data) throw new Error(error?.message)
  return data
}

export async function deleteService(id: string, providerId: string) {
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id)
    .eq('provider_id', providerId)

  if (error) throw new Error(error?.message)
}
