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

    // Get pagination params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''

    const from = (page - 1) * limit
    const to = from + limit - 1

    // Build query to get friends
    // Query both directions: where user is user_id or friend_id
    let query1 = supabase
      .from('friendships')
      .select(`
        id,
        accepted_at,
        friend:friend_id(
          id,
          first_name,
          last_name,
          profile_picture_url,
          photo_url,
          current_tier,
          is_blocked
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'accepted')

    let query2 = supabase
      .from('friendships')
      .select(`
        id,
        accepted_at,
        friend:user_id(
          id,
          first_name,
          last_name,
          profile_picture_url,
          photo_url,
          current_tier,
          is_blocked
        )
      `)
      .eq('friend_id', user.id)
      .eq('status', 'accepted')

    const [result1, result2] = await Promise.all([query1, query2])

    if (result1.error || result2.error) {
      console.error('Query error:', result1.error || result2.error)
      return NextResponse.json({ error: 'Failed to fetch friends' }, { status: 500 })
    }

    // Combine and normalize results
    const allFriends = [
      ...(result1.data || []).map((f: any) => ({
        friendship_id: f.id,
        accepted_at: f.accepted_at,
        ...f.friend,
      })),
      ...(result2.data || []).map((f: any) => ({
        friendship_id: f.id,
        accepted_at: f.accepted_at,
        ...f.friend,
      })),
    ].filter((f: any) => !f.is_blocked) // Filter out blocked users

    // Apply search filter if provided
    let filteredFriends = allFriends
    if (search) {
      const searchLower = search.toLowerCase()
      filteredFriends = allFriends.filter((f: any) =>
        f.first_name?.toLowerCase().includes(searchLower) ||
        f.last_name?.toLowerCase().includes(searchLower)
      )
    }

    // Sort alphabetically by first name
    filteredFriends.sort((a: any, b: any) =>
      (a.first_name || '').localeCompare(b.first_name || '')
    )

    // Apply pagination
    const total = filteredFriends.length
    const paginatedFriends = filteredFriends.slice(from, to + 1)

    return NextResponse.json({
      friends: paginatedFriends,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Error fetching friends list:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
