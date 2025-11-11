import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { createClient } from '@/lib/supabase/server'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'


export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get friend_id from query params
    const { searchParams } = new URL(request.url)
    const friend_id = searchParams.get('friend_id')

    if (!friend_id) {
      return NextResponse.json({ error: 'Friend ID is required' }, { status: 400 })
    }

    // Delete friendships in both directions (if they exist)
    const { error: deleteError } = await supabase
      .from('friendships')
      .delete()
      .or(`and(user_id.eq.${user.id},friend_id.eq.${friend_id}),and(user_id.eq.${friend_id},friend_id.eq.${user.id})`)
      .eq('status', 'accepted')

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json({ error: 'Failed to unfriend user' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully unfriended user',
    })
  } catch (error: any) {
    console.error('Error unfriending user:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
