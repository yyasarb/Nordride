import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { createClient } from '@/lib/supabase/server'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'


/**
 * GET /api/messages/thread?user_id=xxx
 * Find or create a direct message thread between current user and specified user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get target user ID from query params
    const { searchParams } = new URL(request.url)
    const targetUserId = searchParams.get('user_id')

    if (!targetUserId) {
      return NextResponse.json({ error: 'user_id parameter is required' }, { status: 400 })
    }

    // Can't message yourself
    if (targetUserId === user.id) {
      return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 })
    }

    // Check if target user exists
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select('id, first_name, last_name')
      .eq('id', targetUserId)
      .single()

    if (userError || !targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 })
    }

    // Check if blocked
    const { data: blockedCheck } = await supabase
      .from('blocked_users')
      .select('id')
      .or(`and(blocker_id.eq.${user.id},blocked_id.eq.${targetUserId}),and(blocker_id.eq.${targetUserId},blocked_id.eq.${user.id})`)
      .limit(1)

    if (blockedCheck && blockedCheck.length > 0) {
      return NextResponse.json({ error: 'Cannot message this user' }, { status: 403 })
    }

    // Sort user IDs to ensure consistency (smaller ID first)
    const [user1Id, user2Id] = [user.id, targetUserId].sort()

    // Try to find existing thread
    const { data: existingThread, error: findError } = await supabase
      .from('message_threads')
      .select('id')
      .eq('user1_id', user1Id)
      .eq('user2_id', user2Id)
      .is('ride_id', null)
      .maybeSingle()

    if (findError) {
      console.error('Error finding thread:', findError)
      return NextResponse.json({ error: 'Failed to find thread' }, { status: 500 })
    }

    if (existingThread) {
      // Thread exists, return it
      return NextResponse.json({
        thread_id: existingThread.id,
        created: false,
      })
    }

    // Create new thread
    const { data: newThread, error: createError } = await supabase
      .from('message_threads')
      .insert({
        user1_id: user1Id,
        user2_id: user2Id,
        ride_id: null,
      })
      .select('id')
      .single()

    if (createError) {
      console.error('Error creating thread:', createError)
      return NextResponse.json({ error: 'Failed to create thread' }, { status: 500 })
    }

    return NextResponse.json({
      thread_id: newThread.id,
      created: true,
    })

  } catch (error: any) {
    console.error('Error in thread API:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
