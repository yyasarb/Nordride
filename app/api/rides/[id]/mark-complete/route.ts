import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rideId = params.id

    // Get ride details to determine if user is driver or rider
    const { data: rideData, error: rideError } = await supabase
      .from('rides')
      .select('driver_id, status, arrival_time')
      .eq('id', rideId)
      .single()

    if (rideError || !rideData) {
      return NextResponse.json({ error: 'Ride not found' }, { status: 404 })
    }

    // Type assertion after null check
    const ride = rideData as { driver_id: string; status: string; arrival_time: string | null }

    // Check if ride has departed and arrived
    if (!ride.arrival_time || new Date(ride.arrival_time) > new Date()) {
      return NextResponse.json(
        { error: 'Cannot mark trip as complete before arrival time' },
        { status: 400 }
      )
    }

    const isDriver = user.id === ride.driver_id

    if (isDriver) {
      // Driver marking complete
      const { error: updateError } = await supabase
        .from('rides')
        .update({ driver_marked_complete: true })
        .eq('id', rideId)

      if (updateError) {
        throw updateError
      }
    } else {
      // Rider marking complete - check if they're an approved rider
      const { data: booking, error: bookingError } = await supabase
        .from('booking_requests')
        .select('status')
        .eq('ride_id', rideId)
        .eq('rider_id', user.id)
        .single()

      if (bookingError || !booking || booking.status !== 'approved') {
        return NextResponse.json(
          { error: 'Only approved riders can mark trip as complete' },
          { status: 403 }
        )
      }

      // Add rider to riders_marked_complete array
      const { error: updateError } = await supabase.rpc(
        'add_rider_to_completed',
        {
          ride_id: rideId,
          rider_id: user.id
        }
      )

      if (updateError) {
        throw updateError
      }
    }

    // Check if trip is now fully completed
    const { data: isCompleted, error: checkError } = await supabase.rpc(
      'is_trip_completed',
      { ride_id: rideId }
    )

    if (checkError) {
      console.error('Error checking trip completion:', checkError)
    }

    // If trip is fully completed, update status and make reviews visible
    if (isCompleted) {
      const { error: statusError } = await supabase
        .from('rides')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', rideId)

      if (statusError) {
        console.error('Error updating trip status:', statusError)
      }

      // Make reviews visible
      const { error: reviewError } = await supabase
        .from('reviews')
        .update({ is_visible: true })
        .eq('ride_id', rideId)

      if (reviewError) {
        console.error('Error making reviews visible:', reviewError)
      }
    }

    return NextResponse.json({
      success: true,
      tripCompleted: isCompleted
    })
  } catch (error: any) {
    console.error('Mark complete error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to mark trip as complete' },
      { status: 500 }
    )
  }
}
