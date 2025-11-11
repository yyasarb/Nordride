import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!
const SPOTIFY_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL + '/api/spotify/callback'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Check for errors from Spotify
    if (error) {
      console.error('Spotify auth error:', error)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile?spotify_error=${error}`)
    }

    if (!code || !state) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile?spotify_error=missing_params`)
    }

    // Verify state for CSRF protection
    const storedState = cookies().get('spotify_auth_state')?.value
    if (state !== storedState) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile?spotify_error=invalid_state`)
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: SPOTIFY_REDIRECT_URI
      })
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error('Spotify token error:', errorData)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile?spotify_error=token_exchange_failed`)
    }

    const tokenData = await tokenResponse.json()
    const { access_token, refresh_token, expires_in } = tokenData

    // Get user profile from Spotify
    const profileResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    })

    if (!profileResponse.ok) {
      console.error('Failed to fetch Spotify profile')
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile?spotify_error=profile_fetch_failed`)
    }

    const spotifyProfile = await profileResponse.json()

    // Get current user from Supabase
    const cookieStore = cookies()
    const supabaseAccessToken = cookieStore.get('sb-access-token')?.value
    const supabaseRefreshToken = cookieStore.get('sb-refresh-token')?.value

    if (!supabaseAccessToken) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/login?redirect=/profile`)
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser(supabaseAccessToken)

    if (userError || !user) {
      console.error('User fetch error:', userError)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/login?redirect=/profile`)
    }

    // Calculate token expiration
    const expiresAt = new Date(Date.now() + expires_in * 1000)

    // Update user with Spotify data
    const { error: updateError } = await supabase
      .from('users')
      .update({
        spotify_connected: true,
        spotify_user_id: spotifyProfile.id,
        spotify_display_name: spotifyProfile.display_name,
        spotify_email: spotifyProfile.email,
        spotify_access_token: access_token,
        spotify_refresh_token: refresh_token,
        spotify_token_expires_at: expiresAt.toISOString(),
        spotify_connected_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile?spotify_error=db_update_failed`)
    }

    // Clear state cookie
    cookies().delete('spotify_auth_state')

    // Redirect back to profile with success
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile?spotify_connected=true`)
  } catch (error) {
    console.error('Spotify callback error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile?spotify_error=unknown`)
  }
}
