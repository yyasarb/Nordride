import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirect = requestUrl.searchParams.get('redirect') || '/'

  if (code) {
    // Create a Supabase client with the auth code
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        flowType: 'pkce'
      }
    })

    try {
      // Exchange code for session
      const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

      if (sessionError) throw sessionError

      if (session?.user) {
        const user = session.user

        // Check if user profile exists
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        // If profile doesn't exist, create it with OAuth data
        if (!existingProfile && !profileCheckError) {
          // Extract data from OAuth provider
          const userMetadata = user.user_metadata || {}
          const firstName = userMetadata.given_name || userMetadata.first_name || userMetadata.name?.split(' ')[0] || ''
          const lastName = userMetadata.family_name || userMetadata.last_name || userMetadata.name?.split(' ').slice(1).join(' ') || ''
          const fullName = userMetadata.full_name || userMetadata.name || `${firstName} ${lastName}`.trim()
          const avatarUrl = userMetadata.avatar_url || userMetadata.picture || null

          // Create profile with OAuth data
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email,
              first_name: firstName,
              last_name: lastName,
              full_name: fullName,
              profile_picture_url: avatarUrl,
              photo_url: avatarUrl,
              email_verified: true, // OAuth emails are pre-verified
              phone_verified: false,
              trust_score: 100,
              total_rides_driver: 0,
              total_rides_rider: 0,
              created_at: new Date().toISOString(),
            })

          if (insertError) {
            console.error('Error creating OAuth profile:', insertError)
            // Don't throw - let user continue and complete profile manually
          }
        }

        // Check profile completion
        const { data: profile } = await supabase
          .from('users')
          .select('profile_picture_url, photo_url, languages, first_name, last_name')
          .eq('id', user.id)
          .single()

        const hasProfilePicture = !!(profile?.profile_picture_url || profile?.photo_url)
        const hasLanguages = profile?.languages && profile.languages.length > 0
        const hasName = !!(profile?.first_name && profile?.last_name)

        // If profile incomplete, redirect to profile edit
        if (!hasProfilePicture || !hasLanguages || !hasName) {
          return NextResponse.redirect(
            new URL('/profile/edit?message=Please complete your profile to get started', requestUrl.origin)
          )
        }

        // Profile complete, redirect to intended destination
        return NextResponse.redirect(new URL(redirect, requestUrl.origin))
      }
    } catch (error) {
      console.error('OAuth callback error:', error)
      return NextResponse.redirect(
        new URL('/auth/login?error=Authentication failed. Please try again.', requestUrl.origin)
      )
    }
  }

  // No code present, redirect to login
  return NextResponse.redirect(new URL('/auth/login', requestUrl.origin))
}
