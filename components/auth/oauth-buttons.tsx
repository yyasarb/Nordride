'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface OAuthButtonsProps {
  mode: 'login' | 'signup'
  redirectTo?: string
}

export function OAuthButtons({ mode, redirectTo }: OAuthButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleOAuthLogin = async (provider: 'google') => {
    try {
      setError('')
      setLoading(provider)

      const redirectUrl = `${window.location.origin}/auth/callback${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          // Request OpenID scopes for email, profile, name information
          // Google will return: email, name, given_name, family_name, picture
          scopes: 'openid email profile'
        }
      })

      if (oauthError) throw oauthError

      // OAuth redirect happens automatically via Supabase
      // User will be redirected to provider, then back to callback URL
    } catch (err: any) {
      console.error('OAuth error:', err)
      setError(err.message || 'Failed to authenticate. Please try again.')
      setLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* OAuth Buttons */}
      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-full py-6 border-2 flex items-center justify-center gap-3 hover:bg-gray-50 transition-all"
          onClick={() => handleOAuthLogin('google')}
          disabled={loading !== null}
        >
          {loading === 'google' ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </Button>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">or</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Terms and Privacy Notice */}
      <p className="text-xs text-center text-gray-500">
        By continuing, you agree to our{' '}
        <Link href="/legal/terms" className="text-black hover:underline font-medium" target="_blank">
          Terms & Conditions
        </Link>
        {' '}and{' '}
        <Link href="/legal/privacy" className="text-black hover:underline font-medium" target="_blank">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  )
}
