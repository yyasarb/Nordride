'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { OAuthButtons } from '@/components/auth/oauth-buttons'

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('First and last name are required')
      return
    }

    setLoading(true)

    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: formData.firstName.trim(),
            last_name: formData.lastName.trim(),
            full_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim()
          }
        }
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error('Failed to create user')
      }

      // Create user profile in the users table
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: formData.email,
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          full_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
          email_verified: true,
          phone_verified: false,
          trust_score: 100,
          total_rides_driver: 0,
          total_rides_rider: 0
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        throw new Error(`Profile creation failed: ${profileError.message}`)
      }

      setSuccess(true)

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push('/auth/login?message=Account created successfully! Please log in.')
      }, 2000)

    } catch (err: any) {
      console.error('Signup error:', err)
      setError(err.message || 'Failed to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="font-display text-5xl font-bold mb-2">Create account</h1>
          <p className="text-gray-600">
            Join Nordride and start sharing rides
          </p>
        </div>

        <Card className="p-8 shadow-lg border-2">
          {/* OAuth Buttons */}
          <OAuthButtons mode="signup" />

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                  required
                  disabled={loading}
                />
              </div>
            </div>

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
                required
                minLength={6}
                disabled={loading}
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                required
                minLength={6}
                disabled={loading}
              />
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                className="mt-1"
                required
                disabled={loading}
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                By creating an account, I agree to the{' '}
                <Link href="/legal/terms" className="text-black font-semibold hover:underline" target="_blank">
                  Terms & Conditions
                </Link>
                {' '}and{' '}
                <Link href="/legal/privacy" className="text-black font-semibold hover:underline" target="_blank">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center gap-2 p-4 bg-green-50 border-2 border-green-200 rounded-xl text-green-700">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">Account created! Redirecting to login...</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full rounded-full text-lg py-6"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-black hover:underline font-medium">
                Log in
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  )
}
