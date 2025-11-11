import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user's Spotify tokens
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('spotify_access_token, spotify_refresh_token, spotify_token_expires_at')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.spotify_access_token) {
      return NextResponse.json({ error: 'Spotify not connected' }, { status: 400 })
    }

    // Check if token is expired and refresh if needed
    let accessToken = user.spotify_access_token
    const expiresAt = new Date(user.spotify_token_expires_at)

    if (expiresAt < new Date()) {
      // Token expired, refresh it
      const refreshResult = await refreshSpotifyToken(user.spotify_refresh_token, userId)
      if (refreshResult.error) {
        return NextResponse.json({ error: 'Token refresh failed' }, { status: 401 })
      }
      accessToken = refreshResult.accessToken
    }

    // Fetch playlists from Spotify
    const playlistsResponse = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!playlistsResponse.ok) {
      console.error('Spotify playlists fetch failed:', await playlistsResponse.text())
      return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: 500 })
    }

    const playlistsData = await playlistsResponse.json()

    return NextResponse.json({ playlists: playlistsData.items })
  } catch (error) {
    console.error('Playlists fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function refreshSpotifyToken(refreshToken: string, userId: string) {
  try {
    const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!
    const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    })

    if (!response.ok) {
      return { error: 'Refresh failed' }
    }

    const data = await response.json()
    const { access_token, expires_in } = data
    const expiresAt = new Date(Date.now() + expires_in * 1000)

    // Update tokens in database
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    await supabase
      .from('users')
      .update({
        spotify_access_token: access_token,
        spotify_token_expires_at: expiresAt.toISOString()
      })
      .eq('id', userId)

    return { accessToken: access_token }
  } catch (error) {
    console.error('Token refresh error:', error)
    return { error: 'Refresh failed' }
  }
}
