import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Clear all Spotify data
    const { error: updateError } = await supabase
      .from('users')
      .update({
        spotify_connected: false,
        spotify_user_id: null,
        spotify_display_name: null,
        spotify_email: null,
        spotify_access_token: null,
        spotify_refresh_token: null,
        spotify_token_expires_at: null,
        spotify_playlist_id: null,
        spotify_playlist_name: null,
        spotify_playlist_url: null,
        spotify_playlist_image: null,
        spotify_playlist_owner: null,
        spotify_playlist_track_count: null,
        spotify_playlist_is_collaborative: null,
        spotify_connected_at: null
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Spotify disconnect error:', updateError)
      return NextResponse.json({ error: 'Failed to disconnect Spotify' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Disconnect error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
