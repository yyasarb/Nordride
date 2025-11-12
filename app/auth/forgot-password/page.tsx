'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (resetError) throw resetError

      setSuccess(true)
      setEmail('')
    } catch (err: any) {
      console.error('Password reset error:', err)
      setError(err.message || 'Failed to send reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-2">Reset password</h1>
          <p className="text-gray-600">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <Card className="p-8 shadow-lg border-2">
          {success ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <div className="bg-green-100 rounded-full p-4">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Check your email</h3>
                <p className="text-gray-600">
                  We&apos;ve sent a password reset link to your email address. Click the link to reset your password.
                </p>
              </div>
              <Link href="/auth/login">
                <Button className="w-full rounded-full">
                  Back to login
                </Button>
              </Link>
            </div>
          ) : (
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                  required
                  disabled={loading}
                />
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
                {loading ? 'Sending...' : 'Send reset link'}
              </Button>

              {/* Back to Login */}
              <p className="text-center text-sm text-gray-600">
                Remember your password?{' '}
                <Link href="/auth/login" className="text-black hover:underline font-medium">
                  Log in
                </Link>
              </p>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
