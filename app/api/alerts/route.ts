import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export type RideAlert = {
  id: string
  user_id: string
  name: string | null
  departure_address: string
  destination_address: string
  proximity_km: number
  is_enabled: boolean
  created_at: string
  updated_at: string
}

/**
 * GET /api/alerts
 * Get all alerts for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: request.headers.get('Authorization') ?? '',
        },
      },
    })

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: alerts, error } = await supabase
      .from('ride_alerts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching alerts:', error)
      return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
    }

    return NextResponse.json(alerts || [])
  } catch (error) {
    console.error('Get alerts error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/alerts
 * Create a new ride alert
 *
 * Body:
 * - name?: string
 * - departure_address: string
 * - departure_lat: number
 * - departure_lon: number
 * - destination_address: string
 * - destination_lat: number
 * - destination_lon: number
 * - proximity_km?: number (default 20, range 1-50)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: request.headers.get('Authorization') ?? '',
        },
      },
    })

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      departure_address,
      departure_lat,
      departure_lon,
      destination_address,
      destination_lat,
      destination_lon,
      proximity_km = 20,
    } = body

    // Validate required fields
    if (!departure_address || !destination_address) {
      return NextResponse.json(
        { error: 'Departure and destination addresses are required' },
        { status: 400 }
      )
    }

    if (!departure_lat || !departure_lon || !destination_lat || !destination_lon) {
      return NextResponse.json(
        { error: 'Departure and destination coordinates are required' },
        { status: 400 }
      )
    }

    // Validate proximity range
    const proximityValue = Number(proximity_km)
    if (proximityValue < 1 || proximityValue > 50) {
      return NextResponse.json(
        { error: 'Proximity must be between 1 and 50 km' },
        { status: 400 }
      )
    }

    // Check active alert count (max 10)
    const { count, error: countError } = await supabase
      .from('ride_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_enabled', true)

    if (countError) {
      console.error('Error checking alert count:', countError)
      return NextResponse.json({ error: 'Failed to check alert limit' }, { status: 500 })
    }

    if (count && count >= 10) {
      return NextResponse.json(
        { error: 'Maximum of 10 active alerts allowed. Disable or delete an existing alert first.' },
        { status: 400 }
      )
    }

    // Create PostGIS POINT format: POINT(lon lat)
    const departurePoint = `POINT(${departure_lon} ${departure_lat})`
    const destinationPoint = `POINT(${destination_lon} ${destination_lat})`

    const { data: alert, error: insertError } = await supabase
      .from('ride_alerts')
      .insert({
        user_id: user.id,
        name: name || null,
        departure_address,
        departure_coords: departurePoint,
        destination_address,
        destination_coords: destinationPoint,
        proximity_km: proximityValue,
        is_enabled: true,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating alert:', insertError)
      return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 })
    }

    return NextResponse.json(alert, { status: 201 })
  } catch (error) {
    console.error('Create alert error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/alerts
 * Update an existing alert
 *
 * Body:
 * - id: string (required)
 * - name?: string
 * - proximity_km?: number
 * - is_enabled?: boolean
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: request.headers.get('Authorization') ?? '',
        },
      },
    })

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, proximity_km, is_enabled } = body

    if (!id) {
      return NextResponse.json({ error: 'Alert ID is required' }, { status: 400 })
    }

    // Build update object
    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (proximity_km !== undefined) {
      const proximityValue = Number(proximity_km)
      if (proximityValue < 1 || proximityValue > 50) {
        return NextResponse.json(
          { error: 'Proximity must be between 1 and 50 km' },
          { status: 400 }
        )
      }
      updates.proximity_km = proximityValue
    }
    if (is_enabled !== undefined) updates.is_enabled = is_enabled

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { data: alert, error: updateError } = await supabase
      .from('ride_alerts')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating alert:', updateError)
      return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 })
    }

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    return NextResponse.json(alert)
  } catch (error) {
    console.error('Update alert error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/alerts?id=<alert_id>
 * Delete an alert
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: request.headers.get('Authorization') ?? '',
        },
      },
    })

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Alert ID is required' }, { status: 400 })
    }

    const { error: deleteError } = await supabase
      .from('ride_alerts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting alert:', deleteError)
      return NextResponse.json({ error: 'Failed to delete alert' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete alert error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
