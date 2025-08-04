import { createSupabaseAdminClient } from '@/lib/supabase/supabase'

export type CreateProviderInput = {
  name: string
  // handle?: string
  intro?: string
  logo_url?: string
  cover_image_url?: string
  colour_primary?: string
  colour_secondary?: string
  subdomain: string
}

export async function createProvider(input: CreateProviderInput) {
  const supabase = createSupabaseAdminClient()

  const { data: existing } = await supabase
    .from('providers')
    .select('id')
    .eq('subdomain', input.subdomain)
    .maybeSingle()

  if (existing) {
    return { provider: null, error: new Error('Subdomain already in use') }
  }

  const { data, error } = await supabase
    .from('providers')
    .insert([input])
    .select()
    .single()

  return { provider: data, error }
}

export async function getProviderById(id: string) {
  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .from('providers')
    .select('*')
    .eq('id', id)
    .single()

  return { provider: data, error }
}

export async function updateProvider(
  id: string,
  updates: Partial<CreateProviderInput>
) {
  const supabase = createSupabaseAdminClient()

  if (updates.subdomain) {
    const { data: existing } = await supabase
      .from('providers')
      .select('id')
      .eq('subdomain', updates.subdomain)
      .neq('id', id)
      .maybeSingle()

    if (existing) {
      return { provider: null, error: new Error('Subdomain already in use') }
    }
  }

  const { data, error } = await supabase
    .from('providers')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  return { provider: data, error }
}

export async function deleteProvider(id: string) {
  const supabase = createSupabaseAdminClient()

  const { error } = await supabase
    .from('providers')
    .delete()
    .eq('id', id)

  return { success: !error, error }
}

export async function getProviderBySubdomain(subdomain: string) {
  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .from('providers')
    .select('*')
    .eq('subdomain', subdomain)
    .maybeSingle()

  return { data: data, error }
}
