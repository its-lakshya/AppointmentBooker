// /api/services/[id]/addons/route.ts

import { getAuth } from '@clerk/nextjs/server'
import { createAddon, getAddonsByServiceId } from '@/lib/db/addons'
import { createSupabaseAdminClient } from '@/lib/supabase/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { getUserByClerkId } from '@/lib/db/users'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const serviceId = params.id

  if (!serviceId) {
    return NextResponse.json({ error: 'Missing service ID' }, { status: 400 })
  }

  const { addons, error } = await getAddonsByServiceId(serviceId)

  if (error) {
    console.error('Error fetching addons:', error)
    return NextResponse.json({ error: 'Failed to fetch addons' }, { status: 500 })
  }

  return NextResponse.json({ success: true, addons })
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const serviceId = params.id
  const { userId } = getAuth(req)

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await getUserByClerkId(userId)
  if (!user?.provider_id || user.role !== 'admin') {
    return NextResponse.json({ error: 'Only provider admins can create addons' }, { status: 403 })
  }

  const body = await req.json()
  const { name, description, additionalMinutes, additionalPrice } = body

  if (!name) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Validate service ownership
  const supabase = createSupabaseAdminClient()
  const { data: service } = await supabase
    .from('services')
    .select('id')
    .eq('id', serviceId)
    .eq('provider_id', user.provider_id)
    .maybeSingle()

  if (!service) {
    return NextResponse.json({ error: 'Service not found or access denied' }, { status: 404 })
  }

  try {
    const { addon, error } = await createAddon({
      serviceId,
      name,
      description,
      additionalMinutes,
      additionalPrice,
    })

    if (error) throw error
    return NextResponse.json({ success: true, addon })
  } catch (error) {
    console.error('Error creating addon:', error)
    return NextResponse.json({ error: 'Failed to create addon' }, { status: 500 })
  }
}
