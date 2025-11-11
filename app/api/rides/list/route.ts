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
        driver:driver_id(first_name, last_name, full_name, username, profile_picture_url, photo_url, current_tier, verification_tier),
        vehicle:vehicle_id(brand, model)
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
    const transformedRides: Array<Record<string, any>> = []

    rides.forEach((ride) => {
      const seatsBooked = ride.seats_booked ?? 0
      const seatsAvailable = ride.seats_available ?? 0
      const seatsRemaining = seatsAvailable - seatsBooked
      if (seatsRemaining <= 0) {
        return
      }

      const driverName =
        [ride.driver?.first_name, ride.driver?.last_name].filter(Boolean).join(' ') ||
        ride.driver?.full_name ||
        'Unknown Driver'

      const baseRide = {
        id: ride.id,
        driver_id: ride.driver_id,
        driver_name: driverName,
        driver_photo: ride.driver?.profile_picture_url || ride.driver?.photo_url || null,
        driver_first_name: ride.driver?.first_name || null,
        driver_username: ride.driver?.username || null,
        driver_tier: ride.driver?.current_tier || 1,
        driver_verification_tier: ride.driver?.verification_tier || 1,
        origin_address: ride.origin_address,
        destination_address: ride.destination_address,
        departure_time: ride.departure_time,
        seats_available: ride.seats_available,
        seats_booked: ride.seats_booked || 0,
        route_km: ride.route_km,
        suggested_total_cost: ride.suggested_total_cost,
        vehicle_brand: ride.vehicle?.brand,
        vehicle_model: ride.vehicle?.model,
        is_round_trip: ride.is_round_trip || false,
        is_return_leg: false,
        return_departure_time: ride.return_departure_time || null,
        female_only: ride.female_only || false,
        pets_allowed: ride.pets_allowed || false,
        smoking_allowed: ride.smoking_allowed || false,
        luggage_capacity: ride.luggage_capacity || [],
        created_at: ride.created_at,
      }

      transformedRides.push(baseRide)

      if (ride.is_round_trip && ride.return_departure_time) {
        transformedRides.push({
          ...baseRide,
          origin_address: ride.destination_address,
          destination_address: ride.origin_address,
          departure_time: ride.return_departure_time,
          is_round_trip: false,
          is_return_leg: true,
          return_departure_time: null,
        })
      }
    })

    return NextResponse.json(transformedRides)
  } catch (error) {
    console.error('Fetch rides error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
