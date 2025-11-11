import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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
    const { friendship_id, block_user } = body

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

    // Delete the friendship request
    const { error: deleteError } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendship_id)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json({ error: 'Failed to decline friend request' }, { status: 500 })
    }

    // If block_user is true, add to blocked_users
    if (block_user) {
      const { error: blockError } = await supabase
        .from('blocked_users')
        .insert({
          blocker_id: user.id,
          blocked_id: friendship.user_id,
          reason: 'Blocked during friend request decline',
        })

      if (blockError) {
        console.error('Block error:', blockError)
        return NextResponse.json({
          success: true,
          message: 'Friend request declined but blocking failed',
          blocked: false,
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Friend request declined and user blocked',
        blocked: true,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Friend request declined successfully',
      blocked: false,
    })
  } catch (error: any) {
    console.error('Error declining friend request:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
