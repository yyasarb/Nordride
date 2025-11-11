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

    // Get query params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'incoming' // 'incoming' or 'sent'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const from = (page - 1) * limit
    const to = from + limit - 1

    if (type === 'incoming') {
      // Get incoming friend requests
      const { data, error, count } = await supabase
        .from('friendships')
        .select(`
          id,
          message,
          requested_at,
          requester:user_id(
            id,
            first_name,
            last_name,
            profile_picture_url,
            photo_url,
            current_tier,
            is_blocked
          )
        `, { count: 'exact' })
        .eq('friend_id', user.id)
        .eq('status', 'pending')
        .order('requested_at', { ascending: false })
        .range(from, to)

      if (error) {
        console.error('Query error:', error)
        return NextResponse.json({ error: 'Failed to fetch friend requests' }, { status: 500 })
      }

      // Normalize data and filter out blocked users
      const requests = (data || [])
        .filter((r: any) => !r.requester?.is_blocked)
        .map((r: any) => ({
          friendship_id: r.id,
          message: r.message,
          requested_at: r.requested_at,
          ...r.requester,
        }))

      return NextResponse.json({
        requests,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      })
    } else if (type === 'sent') {
      // Get sent friend requests
      const { data, error, count } = await supabase
        .from('friendships')
        .select(`
          id,
          message,
          requested_at,
          recipient:friend_id(
            id,
            first_name,
            last_name,
            profile_picture_url,
            photo_url,
            current_tier,
            is_blocked
          )
        `, { count: 'exact' })
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('requested_at', { ascending: false })
        .range(from, to)

      if (error) {
        console.error('Query error:', error)
        return NextResponse.json({ error: 'Failed to fetch sent requests' }, { status: 500 })
      }

      // Normalize data and filter out blocked users
      const requests = (data || [])
        .filter((r: any) => !r.recipient?.is_blocked)
        .map((r: any) => ({
          friendship_id: r.id,
          message: r.message,
          requested_at: r.requested_at,
          ...r.recipient,
        }))

      return NextResponse.json({
        requests,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      })
    } else {
      return NextResponse.json({ error: 'Invalid request type' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Error fetching friend requests:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
