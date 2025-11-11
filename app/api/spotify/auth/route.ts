import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!
const SPOTIFY_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL + '/api/spotify/callback'

export async function GET() {
  try {
    const scopes = [
      'playlist-read-private',
      'playlist-read-collaborative',
      'playlist-modify-public',
      'playlist-modify-private',
      'user-read-email',
      'user-read-private'
    ].join(' ')

    // Generate state for CSRF protection
    const state = Math.random().toString(36).substring(7)

    // Store state in cookie for verification
    cookies().set('spotify_auth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600 // 10 minutes
    })

    const params = new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      response_type: 'code',
      redirect_uri: SPOTIFY_REDIRECT_URI,
      state: state,
      scope: scopes,
      show_dialog: 'true'
    })

    const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`

    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('Spotify auth error:', error)
    return NextResponse.json({ error: 'Failed to initiate Spotify authentication' }, { status: 500 })
  }
}
