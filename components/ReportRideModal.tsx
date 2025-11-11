'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ReportRideModalProps {
  isOpen: boolean
  onClose: () => void
  rideId: string
  userId: string
}

const REPORT_REASONS = [
  { value: 'no_show', label: 'No-show', description: 'Driver or rider did not show up' },
  { value: 'late_arrival', label: 'Late arrival', description: 'Significantly late without notice' },
  { value: 'unsafe_driving', label: 'Unsafe driving', description: 'Reckless or dangerous driving behavior' },
  { value: 'inappropriate_behavior', label: 'Inappropriate behavior', description: 'Rude, offensive, or unprofessional conduct' },
  { value: 'vehicle_condition', label: 'Vehicle condition', description: 'Car was dirty, unsafe, or not as described' },
  { value: 'route_change', label: 'Route change', description: 'Unauthorized change to agreed route' },
  { value: 'harassment', label: 'Harassment', description: 'Any form of harassment or threatening behavior' },
  { value: 'other', label: 'Other', description: 'Other issue not listed above' },
]

export default function ReportRideModal({ isOpen, onClose, rideId, userId }: ReportRideModalProps) {
  const [selectedReason, setSelectedReason] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      if (!selectedReason) {
        throw new Error('Please select a reason for reporting')
      }

      // Submit the report
      const { error: submitError } = await supabase
        .from('ride_reports')
        .insert({
          ride_id: rideId,
          reporter_id: userId,
          reason: selectedReason,
          description: description.trim() || null,
          status: 'pending',
        })

      if (submitError) throw submitError

      setSuccess(true)
      setTimeout(() => {
        onClose()
        // Reset form
        setSelectedReason('')
        setDescription('')
        setSuccess(false)
      }, 2000)
    } catch (err: any) {
      console.error('Error submitting report:', err)
      setError(err.message || 'Failed to submit report. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            Report Ride Issue
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={submitting}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {success ? (
            <div className="py-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Report Submitted</h3>
              <p className="text-gray-600">
                Thank you for reporting this issue. Our team will review it shortly.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-900">
                  <strong>Important:</strong> Reports are reviewed by our moderation team. False reports may result in account suspension. Please only report genuine safety or conduct issues.
                </p>
              </div>

              {/* Reason Selection */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-900">
                  What happened? <span className="text-red-600">*</span>
                </label>
                <div className="space-y-2">
                  {REPORT_REASONS.map((reason) => (
                    <label
                      key={reason.value}
                      className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedReason === reason.value
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={reason.value}
                        checked={selectedReason === reason.value}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{reason.label}</div>
                        <div className="text-sm text-gray-600">{reason.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">
                  Additional details {selectedReason === 'other' && <span className="text-red-600">*</span>}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide specific details about what happened..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all min-h-[120px] resize-y"
                  maxLength={1000}
                  required={selectedReason === 'other'}
                />
                <p className="text-xs text-gray-500">
                  {description.length}/1000 characters
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                  <p className="text-sm text-red-700 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    {error}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={submitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!selectedReason || submitting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
