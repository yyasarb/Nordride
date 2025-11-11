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
    const { blocked_id, reason } = body

    if (!blocked_id) {
      return NextResponse.json({ error: 'Blocked user ID is required' }, { status: 400 })
    }

    if (user.id === blocked_id) {
      return NextResponse.json({ error: 'Cannot block yourself' }, { status: 400 })
    }

    // Delete any existing friendships
    await supabase
      .from('friendships')
      .delete()
      .or(`and(user_id.eq.${user.id},friend_id.eq.${blocked_id}),and(user_id.eq.${blocked_id},friend_id.eq.${user.id})`)

    // Add to blocked_users
    const { error: blockError } = await supabase
      .from('blocked_users')
      .insert({
        blocker_id: user.id,
        blocked_id: blocked_id,
        reason: reason || null,
      })

    if (blockError) {
      // Check if already blocked
      if (blockError.code === '23505') {
        return NextResponse.json({ error: 'User is already blocked' }, { status: 400 })
      }
      console.error('Block error:', blockError)
      return NextResponse.json({ error: 'Failed to block user' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'User blocked successfully',
    })
  } catch (error: any) {
    console.error('Error blocking user:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
