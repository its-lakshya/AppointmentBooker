import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const subdomain = searchParams.get('subdomain')

  if (!subdomain) {
    return NextResponse.json({ error: 'Missing subdomain parameter' }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()

  const { data: provider, error } = await supabase
    .from('providers')
    .select(`
      id,
      name,
      intro,
      logo_url,
      cover_image_url,
      colour_primary,
      colour_secondary,
      subdomain
    `)
    .eq('subdomain', subdomain)
    .maybeSingle()

  if (error || !provider) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
  }

  return NextResponse.json({ provider })
}