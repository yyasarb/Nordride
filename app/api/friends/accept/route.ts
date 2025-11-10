import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { friendship_id } = body

    if (!friendship_id) {
      return NextResponse.json({ error: 'Friendship ID is required' }, { status: 400 })
    }

    // Get the friendship request
    const { data: friendship, error: fetchError } = await supabase
      .from('friendships')
      .select('*')
      .eq('id', friendship_id)
      .eq('friend_id', user.id)
      .eq('status', 'pending')
      .single()

    if (fetchError || !friendship) {
      return NextResponse.json({ error: 'Friend request not found' }, { status: 404 })
    }

    // Update friendship status to accepted
    const { error: updateError } = await supabase
      .from('friendships')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', friendship_id)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: 'Failed to accept friend request' }, { status: 500 })
    }

    // Get user info for notification
    const { data: accepter } = await supabase
      .from('users')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single()

    // Create notification for the requester
    await supabase.rpc('create_notification', {
      p_user_id: friendship.user_id,
      p_type: 'friend_request_accepted',
      p_title: `${accepter?.first_name} accepted your friend request`,
      p_body: `You and ${accepter?.first_name} are now friends on Nordride`,
      p_ride_id: null,
      p_booking_request_id: null,
      p_metadata: { friendship_id: friendship.id, friend_id: user.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Friend request accepted successfully',
    })
  } catch (error: any) {
    console.error('Error accepting friend request:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
