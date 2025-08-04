import { createSupabaseAdminClient } from '@/lib/supabase/supabase'
import { generateSlotsFromConfig } from './generateSlots'

//eslint-disable-next-line
export async function getAvailabilityForBookingLink(bookingLink: any) {
  const supabase = createSupabaseAdminClient()
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  const { data: cache, error: cacheError } = await supabase
    .from('availability_cache')
    .select('*')
    .eq('booking_link_id', bookingLink.id)
    .eq('start_date', today)
    .maybeSingle()

  if (cache && new Date(cache.expires_at) > new Date()) {
    return { availability: cache, error: null }
  }

  const { slots, timezone } = generateSlotsFromConfig(bookingLink.availability_config)

  const expiresAt = new Date()
  expiresAt.setHours(23, 59, 59)

  const { data, error } = await supabase
    .from('availability_cache')
    .upsert({
      booking_link_id: bookingLink.id,
      provider_id: bookingLink.provider_id,
      user_id: bookingLink.created_by,
      start_date: today,  
      slots,
      timezone,
      generated_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()

  return { availability: data, error }
}
