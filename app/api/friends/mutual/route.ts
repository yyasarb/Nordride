import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { createClient } from '@/lib/supabase/server'



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

    // Call database function to get mutual friends
    const { data, error } = await supabase.rpc('get_mutual_friends', {
      user_a: user.id,
      user_b: other_user_id,
    })

    if (error) {
      console.error('Query error:', error)
      return NextResponse.json({ error: 'Failed to fetch mutual friends' }, { status: 500 })
    }

    return NextResponse.json({
      mutual_friends: data || [],
      count: (data || []).length,
    })
  } catch (error: any) {
    console.error('Error fetching mutual friends:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
