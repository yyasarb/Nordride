/* eslint-disable react/no-unescaped-entities */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Download, Trash2, AlertCircle, CheckCircle, Shield, FileText } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Tab = 'privacy' | 'profile'

export default function SettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('privacy')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (!authUser) {
        router.push('/auth/login')
        return
      }

      setUser(authUser)
    } catch (error) {
      console.error('Error loading user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = async () => {
    try {
      setExporting(true)
      setMessage(null)

      if (!user) return

      // Fetch all user data
      const [profileData, ridesData, bookingsData, reviewsData, messagesData] = await Promise.all([
        supabase.from('users').select('*').eq('id', user.id).single(),
        supabase.from('rides').select('*').eq('driver_id', user.id),
        supabase.from('booking_requests').select('*').eq('rider_id', user.id),
        supabase.from('reviews').select('*').or(`reviewer_id.eq.${user.id},reviewee_id.eq.${user.id}`),
        supabase.from('messages').select('*').eq('sender_id', user.id),
      ])

      const exportData = {
        exported_at: new Date().toISOString(),
        user_id: user.id,
        email: user.email,
        profile: profileData.data,
        rides_offered: ridesData.data,
        ride_requests: bookingsData.data,
        reviews: reviewsData.data,
        messages: messagesData.data,
      }

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `nordride-data-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setMessage({ type: 'success', text: 'Your data has been exported successfully.' })
    } catch (error) {
      console.error('Error exporting data:', error)
      setMessage({ type: 'error', text: 'Failed to export data. Please try again.' })
    } finally {
      setExporting(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setMessage({ type: 'error', text: 'Please type DELETE to confirm account deletion.' })
      return
    }

    try {
      setDeleting(true)
      setMessage(null)

      if (!user) return

      // Delete user data (cascade deletes should handle related data)
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id)

      if (deleteError) throw deleteError

      // Sign out
      await supabase.auth.signOut()

      // Redirect to homepage with message
      router.push('/?deleted=true')
    } catch (error) {
      console.error('Error deleting account:', error)
      setMessage({ type: 'error', text: 'Failed to delete account. Please contact support.' })
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <Link href="/profile" className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </Link>

        <h1 className="font-display text-4xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600 mb-8">Manage your account preferences and data</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b-2 border-gray-200">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'privacy'
                ? 'border-b-4 border-black -mb-[2px] text-black'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Shield className="h-5 w-5 inline-block mr-2" />
            Privacy & Data
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'profile'
                ? 'border-b-4 border-black -mb-[2px] text-black'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="h-5 w-5 inline-block mr-2" />
            Profile Settings
          </button>
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl border-2 flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Privacy & Data Tab */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            {/* Export Data */}
            <Card className="p-6 border-2">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 text-blue-800 p-3 rounded-full flex-shrink-0">
                  <Download className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xl font-bold mb-2">Export Your Data</h3>
                  <p className="text-gray-600 mb-4">
                    Download a copy of all your data stored on Nordride, including your profile, rides, bookings, reviews, and messages.
                    This data will be provided in JSON format.
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Includes: Profile information, ride history, booking requests, reviews, and message history.
                  </p>
                  <Button
                    onClick={handleExportData}
                    disabled={exporting}
                    className="rounded-full"
                  >
                    {exporting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Delete Account */}
            <Card className="p-6 border-2 border-red-200 bg-red-50">
              <div className="flex items-start gap-4">
                <div className="bg-red-200 text-red-800 p-3 rounded-full flex-shrink-0">
                  <Trash2 className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xl font-bold mb-2 text-red-900">Delete Your Account</h3>
                  <p className="text-red-800 mb-4">
                    Permanently delete your Nordride account and all associated data. This action cannot be undone.
                  </p>

                  {!showDeleteConfirm ? (
                    <Button
                      onClick={() => setShowDeleteConfirm(true)}
                      variant="outline"
                      className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded-full"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg border-2 border-red-300">
                        <p className="font-semibold text-red-900 mb-2">⚠️ Warning</p>
                        <p className="text-sm text-red-800 mb-3">
                          This will permanently delete:
                        </p>
                        <ul className="text-sm text-red-800 list-disc list-inside space-y-1 mb-4">
                          <li>Your profile and personal information</li>
                          <li>All rides you've offered</li>
                          <li>All booking requests and ride history</li>
                          <li>Your reviews and messages</li>
                          <li>Your account access</li>
                        </ul>
                        <p className="text-sm font-semibold text-red-900">
                          Type <span className="bg-red-200 px-2 py-1 rounded font-mono">DELETE</span> to confirm:
                        </p>
                      </div>
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="Type DELETE"
                        className="w-full px-4 py-2 border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        disabled={deleting}
                      />
                      <div className="flex gap-3">
                        <Button
                          onClick={handleDeleteAccount}
                          disabled={deleting || deleteConfirmText !== 'DELETE'}
                          className="bg-red-600 hover:bg-red-700 text-white rounded-full"
                        >
                          {deleting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Confirm Delete
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => {
                            setShowDeleteConfirm(false)
                            setDeleteConfirmText('')
                          }}
                          variant="outline"
                          disabled={deleting}
                          className="rounded-full"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Privacy Information */}
            <Card className="p-6 border-2 bg-gray-50">
              <h3 className="font-display text-lg font-bold mb-3">Your Privacy Rights</h3>
              <p className="text-gray-600 text-sm mb-4">
                Under GDPR, you have the right to:
              </p>
              <ul className="text-gray-600 text-sm space-y-2 list-disc list-inside">
                <li>Access your personal data</li>
                <li>Rectify inaccurate data</li>
                <li>Request erasure of your data</li>
                <li>Export your data (data portability)</li>
                <li>Object to data processing</li>
                <li>Withdraw consent at any time</li>
              </ul>
              <p className="text-gray-600 text-sm mt-4">
                For more information, read our{' '}
                <Link href="/legal/privacy" className="text-black font-semibold hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </Card>
          </div>
        )}

        {/* Profile Settings Tab */}
        {activeTab === 'profile' && (
          <Card className="p-8 border-2">
            <h3 className="font-display text-xl font-bold mb-4">Profile Settings</h3>
            <p className="text-gray-600 mb-6">
              Edit your profile information, add languages, interests, and manage your vehicles.
            </p>
            <Link href="/profile/edit">
              <Button className="rounded-full">
                Go to Profile Edit
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  )
}
