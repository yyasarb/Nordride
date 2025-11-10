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
    const { recipient_id, message } = body

    if (!recipient_id) {
      return NextResponse.json({ error: 'Recipient ID is required' }, { status: 400 })
    }

    // Check rate limits and validation using database function
    const { data: validation, error: validationError } = await supabase
      .rpc('can_send_friend_request', {
        sender_id: user.id,
        recipient_id: recipient_id,
      })

    if (validationError) {
      console.error('Validation error:', validationError)
      return NextResponse.json({ error: 'Validation failed' }, { status: 500 })
    }

    if (!validation || validation.length === 0) {
      return NextResponse.json({ error: 'Validation check failed' }, { status: 500 })
    }

    const validationResult = validation[0]
    if (!validationResult.can_send) {
      return NextResponse.json({ error: validationResult.error_message }, { status: 400 })
    }

    // Create friend request
    const { data: friendship, error: insertError } = await supabase
      .from('friendships')
      .insert({
        user_id: user.id,
        friend_id: recipient_id,
        status: 'pending',
        message: message || null,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json({ error: 'Failed to send friend request' }, { status: 500 })
    }

    // Get recipient info for notification
    const { data: recipient } = await supabase
      .from('users')
      .select('first_name, last_name')
      .eq('id', recipient_id)
      .single()

    // Get sender info for notification
    const { data: sender } = await supabase
      .from('users')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single()

    // Create notification for recipient
    await supabase.rpc('create_notification', {
      p_user_id: recipient_id,
      p_type: 'friend_request_received',
      p_title: `Friend request from ${sender?.first_name} ${sender?.last_name}`,
      p_body: message || `${sender?.first_name} wants to connect with you on Nordride`,
      p_ride_id: null,
      p_booking_request_id: null,
      p_metadata: { friend_request_id: friendship.id, sender_id: user.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Friend request sent successfully',
      friendship,
    })
  } catch (error: any) {
    console.error('Error sending friend request:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
