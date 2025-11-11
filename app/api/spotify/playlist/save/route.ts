import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, playlistId, playlistName, playlistUrl, playlistImage, playlistOwner, trackCount, isCollaborative } = body

    if (!userId || !playlistId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Update user with selected playlist
    const { error: updateError } = await supabase
      .from('users')
      .update({
        spotify_playlist_id: playlistId,
        spotify_playlist_name: playlistName,
        spotify_playlist_url: playlistUrl,
        spotify_playlist_image: playlistImage,
        spotify_playlist_owner: playlistOwner,
        spotify_playlist_track_count: trackCount,
        spotify_playlist_is_collaborative: isCollaborative
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Playlist save error:', updateError)
      return NextResponse.json({ error: 'Failed to save playlist' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Save playlist error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
