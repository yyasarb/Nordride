'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { OAuthButtons } from '@/components/auth/oauth-buttons'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Load saved email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('nordride_saved_email')
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }))
      setRememberMe(true)
    }
  }, [])

  useEffect(() => {
    const msg = searchParams.get('message')
    if (msg) setMessage(msg)
  }, [searchParams])

  useEffect(() => {
    const checkExistingSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session?.user) {
        const redirect = searchParams.get('redirect') || '/'
        router.replace(redirect)
      }
    }

    checkExistingSession()
  }, [router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (signInError) throw signInError

      if (!data.user) {
        throw new Error('Login failed')
      }

      // Save email if remember me is checked
      if (rememberMe) {
        localStorage.setItem('nordride_saved_email', formData.email)
      } else {
        localStorage.removeItem('nordride_saved_email')
      }

      // Redirect to the intended page or homepage
      const redirect = searchParams.get('redirect') || '/'
      router.push(redirect)

    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-2">Welcome back</h1>
          <p className="text-gray-600">
            Log in to your Nordride account
          </p>
        </div>

        <Card className="p-8 shadow-lg border-2">
          {/* Success Message from signup */}
          {message && (
            <div className="flex items-center gap-2 p-4 bg-green-50 border-2 border-green-200 rounded-xl text-green-700 mb-6">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{message}</span>
            </div>
          )}

          {/* OAuth Buttons */}
          <OAuthButtons mode="login" redirectTo={searchParams.get('redirect') || undefined} />

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </label>
              <input
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                autoComplete="current-password"
                required
                disabled={loading}
              />
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                  disabled={loading}
                />
                <label htmlFor="rememberMe" className="text-sm text-gray-700 cursor-pointer select-none">
                  Remember me
                </label>
              </div>
              <Link href="/auth/forgot-password" className="text-sm hover:underline">
                Forgot password?
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full rounded-full text-lg py-6"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log in'}
            </Button>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="text-black hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
