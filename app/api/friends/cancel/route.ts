import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { createClient } from '@/lib/supabase/server'



export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get friendship_id from query params
    const { searchParams } = new URL(request.url)
    const friendship_id = searchParams.get('friendship_id')

    if (!friendship_id) {
      return NextResponse.json({ error: 'Friendship ID is required' }, { status: 400 })
    }

    // Verify the request belongs to the user and is still pending
    const { data: friendship, error: fetchError } = await supabase
      .from('friendships')
      .select('*')
      .eq('id', friendship_id)
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single()

    if (fetchError || !friendship) {
      return NextResponse.json({ error: 'Friend request not found or already processed' }, { status: 404 })
    }

    // Delete the friendship request
    const { error: deleteError } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendship_id)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json({ error: 'Failed to cancel friend request' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Friend request cancelled successfully',
    })
  } catch (error: any) {
    console.error('Error cancelling friend request:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
