import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  checkRouteProximity,
  type Point,
  type RouteProximityMatch
} from '@/lib/route-proximity'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export type RideWithProximity = {
  id: string
  driver_id: string
  driver_name: string
  driver_photo?: string | null
  driver_first_name?: string | null
  origin_address: string
  destination_address: string
  departure_time: string
  seats_available: number
  seats_booked: number
  route_km: number
  suggested_total_cost: number
  vehicle_brand?: string
  vehicle_model?: string
  is_round_trip: boolean
  is_return_leg: boolean
  return_departure_time?: string | null
  female_only: boolean
  pets_allowed: boolean
  smoking_allowed: boolean
  luggage_capacity: string[]
  created_at: string
  proximity: RouteProximityMatch
}

/**
 * POST /api/rides/search-proximity
 * Search for rides based on route proximity matching
 *
 * Body params:
 * - departure: { lat: number, lon: number }
 * - destination: { lat: number, lon: number }
 * - maxDistanceKm: number (optional, default 20)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { departure, destination, maxDistanceKm = 20 } = body

    // Validate inputs
    if (!departure || !destination) {
      return NextResponse.json(
        { error: 'Both departure and destination coordinates are required' },
        { status: 400 }
      )
    }

    if (!departure.lat || !departure.lon || !destination.lat || !destination.lon) {
      return NextResponse.json(
        { error: 'Invalid coordinate format. Expected { lat, lon }' },
        { status: 400 }
      )
    }

    const riderDeparture: Point = {
      lat: Number(departure.lat),
      lon: Number(departure.lon)
    }

    const riderDestination: Point = {
      lat: Number(destination.lat),
      lon: Number(destination.lon)
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch all available rides with their route polylines
    const { data: rides, error } = await supabase
      .from('rides')
      .select(`
        *,
        driver:driver_id(first_name, last_name, full_name, profile_picture_url, photo_url),
        vehicle:vehicle_id(brand, model)
      `)
      .eq('status', 'published')
      .gte('departure_time', new Date().toISOString())
      .order('departure_time', { ascending: true })

    if (error) {
      console.error('Error fetching rides:', error)
      return NextResponse.json({ error: 'Failed to fetch rides' }, { status: 500 })
    }

    if (!rides || rides.length === 0) {
      return NextResponse.json([])
    }

    // Calculate proximity for each ride and filter matches
    const ridesWithProximity: RideWithProximity[] = []

    for (const ride of rides) {
      // Skip rides without route polyline
      if (!ride.route_polyline) {
        continue
      }

      // Skip rides with no available seats
      const seatsBooked = ride.seats_booked ?? 0
      const seatsAvailable = ride.seats_available ?? 0
      const seatsRemaining = seatsAvailable - seatsBooked
      if (seatsRemaining <= 0) {
        continue
      }

      // Calculate proximity
      const proximity = checkRouteProximity(
        riderDeparture,
        riderDestination,
        ride.route_polyline,
        Number(maxDistanceKm)
      )

      // Only include rides that match the proximity criteria
      if (!proximity.isMatch) {
        continue
      }

      const driverName =
        [ride.driver?.first_name, ride.driver?.last_name].filter(Boolean).join(' ') ||
        ride.driver?.full_name ||
        'Unknown Driver'

      const baseRide: RideWithProximity = {
        id: ride.id,
        driver_id: ride.driver_id,
        driver_name: driverName,
        driver_photo: ride.driver?.profile_picture_url || ride.driver?.photo_url || null,
        driver_first_name: ride.driver?.first_name || null,
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
        proximity
      }

      ridesWithProximity.push(baseRide)

      // Add return leg if applicable
      if (ride.is_round_trip && ride.return_departure_time) {
        ridesWithProximity.push({
          ...baseRide,
          origin_address: ride.destination_address,
          destination_address: ride.origin_address,
          departure_time: ride.return_departure_time,
          is_round_trip: false,
          is_return_leg: true,
          return_departure_time: null,
        })
      }
    }

    // Sort by match quality (perfect first) then by departure time
    ridesWithProximity.sort((a, b) => {
      // Perfect matches first
      if (a.proximity.matchQuality === 'perfect' && b.proximity.matchQuality !== 'perfect') {
        return -1
      }
      if (b.proximity.matchQuality === 'perfect' && a.proximity.matchQuality !== 'perfect') {
        return 1
      }

      // Then sort by departure time
      return new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime()
    })

    return NextResponse.json(ridesWithProximity)
  } catch (error) {
    console.error('Search proximity error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
