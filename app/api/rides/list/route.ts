import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: rides, error } = await supabase
      .from('rides')
      .select(`
        *,
        driver:users!rides_driver_id_fkey(first_name, last_name, full_name),
        vehicle:vehicles!rides_vehicle_id_fkey(brand, model)
      `)
      .eq('status', 'published')
      .gte('departure_time', new Date().toISOString())
      .order('departure_time', { ascending: true })
      .limit(50)

    if (error) {
      console.error('Error fetching rides:', error)
      return NextResponse.json({ error: 'Failed to fetch rides' }, { status: 500 })
    }

    // Transform the data
    const transformedRides = rides.map((ride) => {
      const driverName = [ride.driver?.first_name, ride.driver?.last_name]
        .filter(Boolean)
        .join(' ') || ride.driver?.full_name || 'Unknown Driver'

      return {
        id: ride.id,
        driver_name: driverName,
        origin_address: ride.origin_address,
        destination_address: ride.destination_address,
        departure_time: ride.departure_time,
        seats_available: ride.seats_available,
        seats_booked: ride.seats_booked || 0,
        route_km: ride.route_km,
        suggested_total_cost: ride.suggested_total_cost,
        vehicle_brand: ride.vehicle?.brand,
        vehicle_model: ride.vehicle?.model,
      }
    })

    return NextResponse.json(transformedRides)
  } catch (error) {
    console.error('Fetch rides error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
