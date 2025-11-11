import { NextResponse } from 'next/server'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { supabase } from '@/lib/supabase'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'


/**
 * User search endpoint
 * Searches users by username, first name, and last name
 * GET /api/users/search?q=searchTerm
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      )
    }

    const searchTerm = query.trim()

    // Search using full-text search on username, first_name, last_name
    const { data, error } = await supabase
      .from('users')
      .select('id, username, first_name, last_name, profile_picture_url, photo_url, bio, current_tier, social_verified')
      .or(`username.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
      .limit(20)

    if (error) {
      console.error('User search error:', error)
      return NextResponse.json(
        { error: 'Search failed', details: error.message },
        { status: 500 }
      )
    }

    // Format results
    const results = (data || []).map((user) => ({
      id: user.id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      profilePicture: user.profile_picture_url || user.photo_url,
      bio: user.bio,
      tier: user.current_tier,
      socialVerified: user.social_verified,
    }))

    // Sort: exact matches first, then partial matches
    results.sort((a, b) => {
      const aExact =
        a.username?.toLowerCase() === searchTerm.toLowerCase() ||
        a.firstName?.toLowerCase() === searchTerm.toLowerCase() ||
        a.lastName?.toLowerCase() === searchTerm.toLowerCase()
      const bExact =
        b.username?.toLowerCase() === searchTerm.toLowerCase() ||
        b.firstName?.toLowerCase() === searchTerm.toLowerCase() ||
        b.lastName?.toLowerCase() === searchTerm.toLowerCase()

      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1
      return 0
    })

    return NextResponse.json({
      success: true,
      query: searchTerm,
      count: results.length,
      results,
    })
  } catch (error: any) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
