import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { createClient } from '@/lib/supabase/server'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'


export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get other_user_id from query params
    const { searchParams } = new URL(request.url)
    const other_user_id = searchParams.get('user_id')

    if (!other_user_id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Check if users are friends
    const { data: areFriends } = await supabase.rpc('are_users_friends', {
      user1_id: user.id,
      user2_id: other_user_id,
    })

    // Check if there's a pending request (either direction)
    const { data: pendingRequests } = await supabase
      .from('friendships')
      .select('id, user_id, friend_id, status')
      .or(`and(user_id.eq.${user.id},friend_id.eq.${other_user_id}),and(user_id.eq.${other_user_id},friend_id.eq.${user.id})`)
      .eq('status', 'pending')

    // Check if user is blocked (either direction)
    const { data: blockStatus } = await supabase
      .from('blocked_users')
      .select('blocker_id')
      .or(`and(blocker_id.eq.${user.id},blocked_id.eq.${other_user_id}),and(blocker_id.eq.${other_user_id},blocked_id.eq.${user.id})`)
      .limit(1)

    let status = 'none' // none, friends, pending_sent, pending_received, blocked_by_you, blocked_by_them

    if (blockStatus && blockStatus.length > 0) {
      if (blockStatus[0].blocker_id === user.id) {
        status = 'blocked_by_you'
      } else {
        status = 'blocked_by_them'
      }
    } else if (areFriends) {
      status = 'friends'
    } else if (pendingRequests && pendingRequests.length > 0) {
      const request = pendingRequests[0]
      if (request.user_id === user.id) {
        status = 'pending_sent'
      } else {
        status = 'pending_received'
      }
    }

    return NextResponse.json({
      status,
      friendship_id: pendingRequests && pendingRequests.length > 0 ? pendingRequests[0].id : null,
    })
  } catch (error: any) {
    console.error('Error fetching friendship status:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
