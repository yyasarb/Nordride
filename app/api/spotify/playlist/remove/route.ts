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

    // Clear playlist data
    const { error: updateError } = await supabase
      .from('users')
      .update({
        spotify_playlist_id: null,
        spotify_playlist_name: null,
        spotify_playlist_url: null,
        spotify_playlist_image: null,
        spotify_playlist_owner: null,
        spotify_playlist_track_count: null,
        spotify_playlist_is_collaborative: null
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Playlist remove error:', updateError)
      return NextResponse.json({ error: 'Failed to remove playlist' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Remove playlist error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
