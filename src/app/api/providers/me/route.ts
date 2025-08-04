import { getAuth } from '@clerk/nextjs/server'
import { createSupabaseAdminClient } from '@/lib/supabase/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req)

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createSupabaseAdminClient()

  // Get user record by Clerk user ID
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('provider_id')
    .eq('clerk_user_id', userId)
    .single()

  if (userError || !user?.provider_id) {
    return NextResponse.json({ error: 'Provider not found for user' }, { status: 404 })
  }

  // Get provider details
  const { data: provider, error: providerError } = await supabase
    .from('providers')
    .select('*')
    .eq('id', user.provider_id)
    .single()

  if (providerError) {
    return NextResponse.json({ error: providerError.message }, { status: 500 })
  }

  return NextResponse.json({ provider }, { status: 200 })
}


export async function PATCH(req: NextRequest) {
  const { userId } = getAuth(req)

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const updates = await req.json()
  const supabase = createSupabaseAdminClient()

  // Get user's provider ID
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('provider_id')
    .eq('clerk_user_id', userId)
    .single()

  if (userError || !user?.provider_id) {
    return NextResponse.json({ error: 'Provider not found for user' }, { status: 404 })
  }

  // If subdomain is being updated, check for uniqueness
  if (updates.subdomain) {
    const { data: existing } = await supabase
      .from('providers')
      .select('id')
      .eq('subdomain', updates.subdomain)
      .neq('id', user.provider_id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'Subdomain already in use' },
        { status: 400 }
      )
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from('providers')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.provider_id)
    .select()
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 })
  }

  return NextResponse.json({ provider: updated }, { status: 200 })
}
