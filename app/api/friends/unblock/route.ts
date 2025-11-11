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

    // Get blocked_id from query params
    const { searchParams } = new URL(request.url)
    const blocked_id = searchParams.get('blocked_id')

    if (!blocked_id) {
      return NextResponse.json({ error: 'Blocked user ID is required' }, { status: 400 })
    }

    // Remove from blocked_users
    const { error: unblockError } = await supabase
      .from('blocked_users')
      .delete()
      .eq('blocker_id', user.id)
      .eq('blocked_id', blocked_id)

    if (unblockError) {
      console.error('Unblock error:', unblockError)
      return NextResponse.json({ error: 'Failed to unblock user' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'User unblocked successfully',
    })
  } catch (error: any) {
    console.error('Error unblocking user:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
