'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  MapPin,
  Calendar,
  Users,
  DollarSign,
  ArrowRight,
  MessageCircle,
  Car,
  Clock,
  AlertCircle,
  CheckCircle,
  PawPrint,
  Cigarette,
  Backpack,
  X,
  Check,
  Loader2,
  Star
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

const CANCEL_REASON_OPTIONS = [
  { value: 'change_of_plans', label: 'Change of plans' },
  { value: 'inappropriate_message', label: 'Inappropriate message' },
  { value: 'no_longer_available', label: 'No longer available' },
  { value: 'other', label: 'Other' }
]

const RIDER_CANCEL_REASON_OPTIONS = [
  { value: 'no_longer_travelling', label: 'No longer travelling' },
  { value: 'found_other_ride', label: 'Found another ride' },
  { value: 'schedule_conflict', label: 'Schedule conflict' },
  { value: 'other', label: 'Other' }
]

type RideBookingRequest = {
  id: string
  status: 'pending' | 'approved' | 'declined' | 'cancelled'
  seats_requested: number | null
  rider_id: string
  created_at: string
  rider: {
    id: string
    first_name: string | null
    last_name: string | null
    full_name: string | null
    profile_picture_url: string | null
  } | null
}

type RideDetails = {
  id: string
  driver_id: string
  vehicle_id: string
  origin_address: string
  destination_address: string
  route_km: number
  departure_time: string
  arrival_time: string | null
  seats_available: number
  seats_booked: number
  suggested_total_cost: number
  status: string
  is_round_trip: boolean
  return_departure_time: string | null
  return_suggested_total_cost: number | null
  route_description: string | null
  pets_allowed: boolean
  smoking_allowed: boolean
  luggage_capacity: string[] | null
  created_at: string
  driver_marked_complete: boolean
  riders_marked_complete: string[] | null
  booking_requests: RideBookingRequest[] | null
  driver: {
    id: string
    full_name: string
    first_name: string
    last_name: string
    profile_picture_url: string | null
    trust_score: number
    total_rides_driver: number
    languages: string[] | null
  }
  vehicle: {
    brand: string
    model: string | null
    color: string | null
    plate_number: string
  }
}

export default function RideDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [ride, setRide] = useState<RideDetails | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [cancelDialog, setCancelDialog] = useState<{
    requestId: string
    seatsRequested: number
    status: RideBookingRequest['status']
  } | null>(null)
  const [cancelReason, setCancelReason] = useState('change_of_plans')
  const [cancelSubmitting, setCancelSubmitting] = useState(false)
  const [rideCancelling, setRideCancelling] = useState(false)
  const [riderCancelDialog, setRiderCancelDialog] = useState<RideBookingRequest | null>(null)
  const [riderCancelReason, setRiderCancelReason] = useState('no_longer_travelling')
  const [riderCancelSubmitting, setRiderCancelSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [markingComplete, setMarkingComplete] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [existingReview, setExistingReview] = useState<any>(null)
  const [selectedReviewee, setSelectedReviewee] = useState<string | null>(null)
  const [existingReviews, setExistingReviews] = useState<Record<string, any>>({})

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        setUser(currentUser)

        const { data: rideData, error } = await supabase
          .from('rides')
          .select(`
            *,
            driver:users!rides_driver_id_fkey(
              id,
              full_name,
              first_name,
              last_name,
              profile_picture_url,
              trust_score,
              total_rides_driver,
              languages
            ),
            vehicle:vehicles!rides_vehicle_id_fkey(
              brand,
              model,
              color,
              plate_number
            ),
            booking_requests(
              id,
              status,
              seats_requested,
              rider_id,
              created_at,
              rider:users!booking_requests_rider_id_fkey(
                id,
                first_name,
                last_name,
                full_name,
                profile_picture_url
              )
            )
          `)
          .eq('id', params.id)
          .single()

        if (error) throw error

        // Normalize Supabase data (foreign keys come as arrays)
        if (rideData) {
          const normalized: any = {
            ...rideData,
            driver: Array.isArray(rideData.driver) && rideData.driver.length > 0
              ? rideData.driver[0]
              : rideData.driver,
            vehicle: Array.isArray(rideData.vehicle) && rideData.vehicle.length > 0
              ? rideData.vehicle[0]
              : rideData.vehicle,
            booking_requests: rideData.booking_requests?.map((req: any) => ({
              ...req,
              rider: Array.isArray(req.rider) && req.rider.length > 0
                ? req.rider[0]
                : req.rider
            }))
          }
          setRide(normalized as RideDetails)
        }
      } catch (error) {
        console.error('Failed to load ride:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [params.id])

  // Auto-dismiss feedback after 3 seconds
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => {
        setFeedback(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [feedback])

  // Fetch existing reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!user || !ride) return

      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('ride_id', ride.id)
        .eq('reviewer_id', user.id)

      if (!error && data) {
        const reviewsMap: Record<string, any> = {}
        data.forEach(review => {
          reviewsMap[review.reviewee_id] = review
        })
        setExistingReviews(reviewsMap)

        // Set the first existing review if any
        if (data.length > 0) {
          setExistingReview(data[0])
          setReviewText(data[0].text || '')
        }
      }
    }

    fetchReviews()
  }, [user, ride])

  const handleRequestRide = async () => {
    if (!user || !ride) {
      setFeedback({ type: 'error', message: 'Please log in to request a ride.' })
      return
    }

    if (user.id === ride.driver_id) {
      setFeedback({ type: 'error', message: 'You cannot request your own ride.' })
      return
    }

    if (ride.status === 'cancelled') {
      setFeedback({ type: 'error', message: 'This ride has been cancelled.' })
      return
    }

    if (seatsRemaining <= 0) {
      setFeedback({ type: 'error', message: 'Sorry, this ride is already full.' })
      return
    }

    // Check profile completion before allowing request
    const { data: profileData } = await supabase
      .from('users')
      .select('profile_completed')
      .eq('id', user.id)
      .single()

    if (!profileData?.profile_completed) {
      setFeedback({ type: 'error', message: 'Please complete your profile before requesting rides.' })
      return
    }

    setRequesting(true)
    setFeedback(null)

    try {
      // Check for ANY existing request (including cancelled/declined)
      const { data: existingRequest, error: existingError } = await supabase
        .from('booking_requests')
        .select('id, status')
        .eq('ride_id', ride.id)
        .eq('rider_id', user.id)
        .maybeSingle()

      if (existingError) {
        throw existingError
      }

      let bookingRequest: { id: string } | null = null

      if (existingRequest) {
        // If request already exists with pending or approved status, show error
        if (existingRequest.status === 'pending' || existingRequest.status === 'approved') {
          setFeedback({
            type: 'error',
            message:
              existingRequest.status === 'pending'
                ? 'You already have a pending request for this ride.'
                : 'You have already been approved for this ride.'
          })
          return
        }

        // If request exists but was cancelled/declined, update it to pending
        const { data: updatedRequest, error: updateError } = await supabase
          .from('booking_requests')
          .update({
            status: 'pending',
            seats_requested: 1,
            cancelled_at: null,
            declined_at: null
          })
          .eq('id', existingRequest.id)
          .select('id')
          .single()

        if (updateError) {
          throw updateError
        }

        bookingRequest = updatedRequest
      } else {
        // No existing request, create a new one
        const { data: newRequest, error: requestError } = await supabase
          .from('booking_requests')
          .insert({
            ride_id: ride.id,
            rider_id: user.id,
            status: 'pending',
            seats_requested: 1,
          })
          .select('id')
          .single()

        if (requestError) {
          throw requestError
        }

        bookingRequest = newRequest
      }

      // Ensure message thread exists and send automatic message to notify the driver
      let threadId: string | null = null

      // First, try to find existing thread
      const { data: existingThread } = await supabase
        .from('message_threads')
        .select('id')
        .eq('ride_id', ride.id)
        .maybeSingle()

      if (existingThread?.id) {
        threadId = existingThread.id
      } else {
        // Create thread if it doesn't exist (fallback in case trigger didn't fire)
        const { data: newThread, error: createError } = await supabase
          .from('message_threads')
          .insert({ ride_id: ride.id })
          .select('id')
          .single()

        if (!createError && newThread?.id) {
          threadId = newThread.id
        }
      }

      // Send automatic message
      if (threadId) {
        const requestRefText = bookingRequest?.id ? ` Reference: ${bookingRequest.id}` : ''
        const { error: messageError } = await supabase.from('messages').insert({
          thread_id: threadId,
          sender_id: user.id,
          body: `Hi! I'd like to join this ride. I just sent a request.${requestRefText}`
        })
        if (messageError) {
          console.warn('Failed to send automatic ride request message:', messageError)
        }
      }

      // Refresh the ride data to update UI with new booking request
      const { data: updatedRide } = await supabase
        .from('rides')
        .select(`
          *,
          driver:users!rides_driver_id_fkey(id, first_name, last_name, full_name, photo_url, profile_picture_url, trust_score),
          vehicle:vehicles!rides_vehicle_id_fkey(brand, model, color, year, plate_number),
          booking_requests(
            id,
            status,
            seats_requested,
            rider_id,
            rider:users!booking_requests_rider_id_fkey(id, first_name, last_name, full_name, profile_picture_url, photo_url)
          )
        `)
        .eq('id', ride.id)
        .single()

      if (updatedRide) {
        setRide(updatedRide as any)
      }

      setFeedback({
        type: 'success',
        message: 'Ride request sent successfully! The driver will be notified.'
      })
    } catch (error: any) {
      console.error('Request ride error:', error)
      setFeedback({
        type: 'error',
        message: error?.message || 'Failed to send ride request. Please try again.',
      })
    } finally {
      setRequesting(false)
    }
  }

  const handleContactDriver = async () => {
    if (!user) {
      setFeedback({ type: 'error', message: 'Please log in to contact the driver.' })
      return
    }

    if (!ride) return

    // Ensure message thread exists before navigating
    try {
      let threadId: string | null = null

      // First, try to find existing thread
      const { data: existingThread } = await supabase
        .from('message_threads')
        .select('id')
        .eq('ride_id', ride.id)
        .maybeSingle()

      if (existingThread?.id) {
        threadId = existingThread.id
      } else {
        // Create thread if it doesn't exist
        const { data: newThread, error: createError } = await supabase
          .from('message_threads')
          .insert({ ride_id: ride.id })
          .select('id')
          .single()

        if (!createError && newThread?.id) {
          threadId = newThread.id
        }
      }

      // Navigate to messages with the thread
      if (threadId) {
        router.push(`/messages?thread=${threadId}`)
      } else {
        router.push(`/messages?ride=${ride.id}`)
      }
    } catch (error) {
      console.error('Error accessing messages:', error)
      router.push(`/messages?ride=${ride.id}`)
    }
  }

  const handleCancelRequest = async () => {
    if (!user || !ride) return

    setRequesting(true)
    setFeedback(null)

    try {
      // Find the user's pending booking request
      const { data: existingRequest, error: findError } = await supabase
        .from('booking_requests')
        .select('id')
        .eq('ride_id', ride.id)
        .eq('rider_id', user.id)
        .eq('status', 'pending')
        .maybeSingle()

      if (findError) {
        throw findError
      }

      if (!existingRequest) {
        setFeedback({ type: 'error', message: 'No pending request found to cancel.' })
        return
      }

      // Cancel the request
      const { error: cancelError } = await supabase
        .from('booking_requests')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', existingRequest.id)

      if (cancelError) {
        throw cancelError
      }

      // Refresh the ride data to update UI
      const { data: updatedRide } = await supabase
        .from('rides')
        .select(`
          *,
          driver:users!rides_driver_id_fkey(id, first_name, last_name, full_name, photo_url, profile_picture_url, trust_score),
          vehicle:vehicles!rides_vehicle_id_fkey(brand, model, color, year, plate_number),
          booking_requests(
            id,
            status,
            seats_requested,
            rider_id,
            rider:users!booking_requests_rider_id_fkey(id, first_name, last_name, full_name, profile_picture_url, photo_url)
          )
        `)
        .eq('id', ride.id)
        .single()

      if (updatedRide) {
        setRide(updatedRide as any)
      }

      setFeedback({
        type: 'success',
        message: 'Request cancelled successfully.'
      })
    } catch (error: any) {
      console.error('Cancel request error:', error)
      setFeedback({
        type: 'error',
        message: error?.message || 'Failed to cancel request. Please try again.',
      })
    } finally {
      setRequesting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const cancelReasonOptions = CANCEL_REASON_OPTIONS

  const getDisplayName = (rider: RideBookingRequest['rider']) => {
    if (!rider) return 'Nordride user'
    const name = [rider.first_name, rider.last_name].filter(Boolean).join(' ')
    return name || rider.full_name || 'Nordride user'
  }

  const statusBadgeClass = (status: RideBookingRequest['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'cancelled':
      case 'declined':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200'
    }
  }

  const handleOpenCancel = (request: RideBookingRequest) => {
    setCancelReason('change_of_plans')
    setCancelDialog({
      requestId: request.id,
      seatsRequested: request.seats_requested ?? 0,
      status: request.status,
    })
  }

  const handleConfirmCancel = async () => {
    if (!ride || !cancelDialog) return

    try {
      setCancelSubmitting(true)
      const { error: updateError } = await supabase
        .from('booking_requests')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', cancelDialog.requestId)

      if (updateError) throw updateError

      setRide((prev) => {
        if (!prev) return prev
        const requests = prev.booking_requests ?? []
        const target = requests.find((req) => req && req.id === cancelDialog.requestId)
        const seatsAdjustment =
          target && target.status === 'approved'
            ? Math.max(0, target.seats_requested ?? 0)
            : 0
        const updatedRequests = requests.map((req) => {
          if (!req) return req
          if (req.id === cancelDialog.requestId) {
            return {
              ...req,
              status: 'cancelled' as const,
            }
          }
          return req
        })
        return {
          ...prev,
          seats_booked: Math.max(0, prev.seats_booked - seatsAdjustment),
          booking_requests: updatedRequests,
        }
      })

      setFeedback({
        type: 'success',
        message: 'Rider is removed from this trip.',
      })
    } catch (error: any) {
      console.error('Cancel rider error:', error)
      setFeedback({
        type: 'error',
        message: error?.message || 'Failed to cancel this rider. Please try again.',
      })
    } finally {
      setCancelSubmitting(false)
      setCancelDialog(null)
    }
  }

  const handleApproveRequest = async (request: RideBookingRequest) => {
    if (!ride) return

    const seatsRequested = request.seats_requested ?? 1
    const seatsRemaining = ride.seats_available - ride.seats_booked

    if (seatsRemaining < seatsRequested) {
      setFeedback({
        type: 'error',
        message: `Not enough seats available. Rider requested ${seatsRequested} seat(s), but only ${seatsRemaining} available.`,
      })
      return
    }

    try {
      const { error: updateError } = await supabase
        .from('booking_requests')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
        })
        .eq('id', request.id)

      if (updateError) throw updateError

      setRide((prev) => {
        if (!prev) return prev
        const updatedRequests = (prev.booking_requests ?? []).map((req) => {
          if (!req) return req
          if (req.id === request.id) {
            return {
              ...req,
              status: 'approved' as const,
            }
          }
          return req
        })
        return {
          ...prev,
          seats_booked: prev.seats_booked + seatsRequested,
          booking_requests: updatedRequests,
        }
      })

      setFeedback({
        type: 'success',
        message: 'Ride request approved!',
      })
    } catch (error: any) {
      console.error('Approve request error:', error)
      setFeedback({
        type: 'error',
        message: error?.message || 'Failed to approve request. Please try again.',
      })
    }
  }

  const handleCancelRide = async () => {
    if (!ride || rideCancelling) return
    const confirmed = window.confirm('Cancel this ride? Riders will be notified and the trip will be removed from search results.')
    if (!confirmed) return

    try {
      setRideCancelling(true)
      const { error: cancelError } = await supabase
        .from('rides')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
        .eq('id', ride.id)

      if (cancelError) throw cancelError

      setRide((prev) => (prev ? { ...prev, status: 'cancelled' } : prev))
      setFeedback({ type: 'success', message: 'Ride has been cancelled.' })
    } catch (error: any) {
      console.error('Cancel ride error:', error)
      setFeedback({
        type: 'error',
        message: error?.message || 'Failed to cancel this ride. Please try again.',
      })
    } finally {
      setRideCancelling(false)
    }
  }

  const handleMarkComplete = async () => {
    if (!user || !ride || markingComplete) return

    try {
      setMarkingComplete(true)
      const response = await fetch(`/api/rides/${ride.id}/mark-complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to mark trip as complete')
      }

      // Update local state
      setRide((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          driver_marked_complete: user.id === prev.driver_id ? true : prev.driver_marked_complete,
          riders_marked_complete: user.id === prev.driver_id
            ? prev.riders_marked_complete
            : [...(prev.riders_marked_complete || []), user.id],
          status: data.tripCompleted ? 'completed' : prev.status
        }
      })

      setFeedback({
        type: 'success',
        message: data.tripCompleted
          ? 'Trip completed! You can now write a review.'
          : 'Marked as complete. Waiting for others to confirm.'
      })
    } catch (error: any) {
      console.error('Mark complete error:', error)
      setFeedback({
        type: 'error',
        message: error?.message || 'Failed to mark trip as complete. Please try again.'
      })
    } finally {
      setMarkingComplete(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!user || !ride || submittingReview) return
    if (!reviewText.trim()) {
      setFeedback({ type: 'error', message: 'Please write a review before submitting.' })
      return
    }

    if (!selectedReviewee) {
      setFeedback({ type: 'error', message: 'Please select a person to review.' })
      return
    }

    try {
      setSubmittingReview(true)

      const reviewData = {
        ride_id: ride.id,
        reviewer_id: user.id,
        reviewee_id: selectedReviewee,
        rating: 5, // Default rating (not displayed to users)
        text: reviewText.trim(),
        is_visible: tripCompleted // Only visible if trip is completed
      }

      const existingForReviewee = existingReviews[selectedReviewee]

      if (existingForReviewee) {
        // Update existing review
        const { error } = await supabase
          .from('reviews')
          .update(reviewData)
          .eq('id', existingForReviewee.id)

        if (error) throw error
        setFeedback({ type: 'success', message: 'Review updated successfully!' })
      } else {
        // Create new review
        const { error } = await supabase
          .from('reviews')
          .insert(reviewData)

        if (error) throw error
        setFeedback({
          type: 'success',
          message: tripCompleted
            ? 'Review submitted successfully!'
            : 'Review saved! It will become visible once the trip is completed.'
        })
      }

      // Refresh reviews
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('ride_id', ride.id)
        .eq('reviewer_id', user.id)

      if (data) {
        const reviewsMap: Record<string, any> = {}
        data.forEach(review => {
          reviewsMap[review.reviewee_id] = review
        })
        setExistingReviews(reviewsMap)
      }

      // Clear selection and form
      setSelectedReviewee(null)
      setReviewText('')
    } catch (error: any) {
      console.error('Submit review error:', error)
      setFeedback({
        type: 'error',
        message: error?.message || 'Failed to submit review. Please try again.'
      })
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ride details...</p>
        </div>
      </div>
    )
  }

  if (!ride) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <Card className="max-w-md p-8 text-center border-2 border-amber-200 bg-amber-50">
          <h1 className="text-xl font-semibold mb-3">Ride not found</h1>
          <p className="text-sm text-amber-800">
            We couldn&apos;t locate this trip. It may have been removed by the driver.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button asChild className="rounded-full">
              <Link href="/rides/search">Browse rides</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-2">
              <Link href="/rides/my">Go to My rides</Link>
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const bookingRequests = (ride.booking_requests ?? []).filter(
    (request): request is RideBookingRequest => Boolean(request)
  )
  const approvedRequests = bookingRequests.filter((request) => request.status === 'approved')
  const pendingRequests = bookingRequests.filter((request) => request.status === 'pending')
  const userBooking = bookingRequests.find((request) => request.rider_id === user?.id)
  const rideCancelled = ride.status === 'cancelled'
  const isDriver = user?.id === ride.driver_id

  // Trip completion logic
  const hasArrived = ride.arrival_time ? new Date(ride.arrival_time) <= new Date() : false
  const canMarkComplete = hasArrived && ride.status !== 'cancelled' && ride.status !== 'completed'
  const userHasMarkedComplete = isDriver
    ? ride.driver_marked_complete
    : (ride.riders_marked_complete || []).includes(user?.id || '')
  const approvedRiderIds = approvedRequests.map(req => req.rider_id)
  const ridersWhoMarked = (ride.riders_marked_complete || []).filter(id => approvedRiderIds.includes(id))
  const totalApprovedRiders = approvedRiderIds.length
  const totalMarkedComplete = (ride.driver_marked_complete ? 1 : 0) + ridersWhoMarked.length
  const totalParties = 1 + totalApprovedRiders // driver + approved riders
  const tripCompleted = ride.status === 'completed'

  const handleOpenRiderCancel = () => {
    if (!userBooking) return
    setRiderCancelReason('no_longer_travelling')
    setRiderCancelDialog(userBooking)
  }

  const handleConfirmRiderCancel = async () => {
    if (!userBooking) return
    try {
      setRiderCancelSubmitting(true)
      const { error: updateError } = await supabase
        .from('booking_requests')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', userBooking.id)

      if (updateError) throw updateError

      setRide((prev) => {
        if (!prev) return prev
        const requests = prev.booking_requests ?? []
        const target = requests.find((req) => req && req.id === userBooking.id)
        const adjustedSeats =
          target && target.status === 'approved'
            ? Math.max(0, target.seats_requested ?? 0)
            : 0
        const updatedRequests = requests.map((req) => {
          if (!req) return req
          if (req.id === userBooking.id) {
            return {
              ...req,
              status: 'cancelled' as const,
            }
          }
          return req
        })
        return {
          ...prev,
          seats_booked: Math.max(0, prev.seats_booked - adjustedSeats),
          booking_requests: updatedRequests,
        }
      })

      setFeedback({ type: 'success', message: 'Your request has been cancelled.' })
    } catch (error: any) {
      console.error('Cancel request error:', error)
      setFeedback({
        type: 'error',
        message: error?.message || 'Failed to cancel your request. Please try again.',
      })
    } finally {
      setRiderCancelSubmitting(false)
      setRiderCancelDialog(null)
    }
  }

  const seatsRemaining = Math.max(0, ride.seats_available - ride.seats_booked)
  const capacityPercentage = ride.seats_available > 0
    ? Math.max(
        0,
        Math.min(
          100,
          Math.round(((ride.seats_available - seatsRemaining) / ride.seats_available) * 100)
        )
      )
    : 100

  return (
    <>
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        {/* Back button */}
        <Button variant="outline" asChild className="mb-6 rounded-full">
          <Link href="/rides/search">← Back to rides</Link>
        </Button>

        {/* Completion Banner - Show at top if trip is completed */}
        {tripCompleted && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-800">
                  This trip has been marked as complete by all parties. You can now write a review.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6">
          {/* Main ride info card */}
          <Card className="p-6 border-2">
            <div className="space-y-6">
              {/* Route */}
              <div>
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-black"></div>
                    <div className="w-0.5 h-12 bg-gray-300"></div>
                    <MapPin className="w-5 h-5 text-black" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">From</p>
                      <p className="text-xl font-semibold">{ride.origin_address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">To</p>
                      <p className="text-xl font-semibold">{ride.destination_address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trip type badge */}
              <div className="flex items-center gap-2">
                {ride.is_round_trip ? (
                  <div className="inline-flex items-center gap-2 bg-blue-50 border-2 border-blue-200 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                    <ArrowRight className="h-4 w-4 transform rotate-180" />
                    Round Trip
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 bg-gray-50 border-2 border-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
                    <ArrowRight className="h-4 w-4" />
                    One-Way
                  </div>
                )}
              </div>

              {isDriver && !tripCompleted && (
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm" className="rounded-full border-2">
                    <Link href={`/rides/${ride.id}/edit`}>Edit ride</Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="rounded-full"
                    onClick={handleCancelRide}
                    disabled={rideCancelled || rideCancelling}
                  >
                    {rideCancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cancel ride'}
                  </Button>
                </div>
              )}

              {rideCancelled && (
                <div className="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  This ride has been cancelled. Riders will no longer be able to request seats.
                </div>
              )}

              {/* Date and time */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Departure</p>
                    <p className="font-semibold">{formatDate(ride.departure_time)}</p>
                    <p className="text-sm text-gray-600">{formatTime(ride.departure_time)}</p>
                  </div>
                </div>

                {ride.is_round_trip && ride.return_departure_time && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Return</p>
                      <p className="font-semibold">{formatDate(ride.return_departure_time)}</p>
                      <p className="text-sm text-gray-600">{formatTime(ride.return_departure_time)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Distance and price */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-xs text-emerald-600 uppercase tracking-wide">Distance</p>
                    <p className="font-semibold text-lg text-emerald-800">{ride.route_km.toFixed(1)} km</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-xs text-emerald-600 uppercase tracking-wide">Total Cost</p>
                    <p className="font-semibold text-lg text-emerald-800">{ride.suggested_total_cost} SEK</p>
                    {ride.is_round_trip && ride.return_suggested_total_cost && (
                      <p className="text-xs text-emerald-600">
                        Return: {ride.return_suggested_total_cost} SEK
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Seats available */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                    <Users className="h-5 w-5 text-gray-700" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs uppercase tracking-wide text-gray-500">
                      <span>Seat availability</span>
                      <span>{seatsRemaining} left</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className={`${seatsRemaining > 0 ? 'bg-emerald-500' : 'bg-red-500'} h-full transition-all`}
                      style={{
                          width: seatsRemaining > 0 ? `${capacityPercentage}%` : '100%'
                        }}
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-700">
                      {rideCancelled
                        ? 'This ride has been cancelled.'
                        : seatsRemaining > 0
                        ? `${ride.seats_available - seatsRemaining} booked · ${seatsRemaining} seats open`
                        : 'This ride is fully booked.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Trip Preferences */}
              <div className="p-4 bg-gray-50 rounded-xl border-2">
                <h3 className="font-semibold text-sm mb-3">Trip Preferences</h3>
                <div className="grid md:grid-cols-3 gap-3">
                  {/* Pets */}
                  <div className="flex items-center gap-2">
                    <PawPrint className={`h-4 w-4 ${ride.pets_allowed ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className="text-sm">Pets</span>
                    {ride.pets_allowed ? (
                      <Check className="h-4 w-4 text-green-600 ml-auto" />
                    ) : (
                      <X className="h-4 w-4 text-gray-400 ml-auto" />
                    )}
                  </div>

                  {/* Smoking */}
                  <div className="flex items-center gap-2">
                    <Cigarette className={`h-4 w-4 ${ride.smoking_allowed ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className="text-sm">Smoking</span>
                    {ride.smoking_allowed ? (
                      <Check className="h-4 w-4 text-green-600 ml-auto" />
                    ) : (
                      <X className="h-4 w-4 text-gray-400 ml-auto" />
                    )}
                  </div>

                  {/* Luggage */}
                  <div className="flex items-center gap-2">
                    <Backpack className={`h-4 w-4 ${ride.luggage_capacity && ride.luggage_capacity.length > 0 ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className="text-sm">Luggage</span>
                    {ride.luggage_capacity && ride.luggage_capacity.length > 0 ? (
                      <div className="ml-auto text-xs text-gray-600">
                        {ride.luggage_capacity.map(size =>
                          size === 'carry_on' ? 'Carry-on' : size.charAt(0).toUpperCase() + size.slice(1)
                        ).join(', ')}
                      </div>
                    ) : (
                      <X className="h-4 w-4 text-gray-400 ml-auto" />
                    )}
                  </div>
                </div>
              </div>

              {/* Special request / description */}
              {ride.route_description && (
                <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 mb-1">Driver&apos;s Notes</p>
                      <p className="text-sm text-amber-700">{ride.route_description}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Driver info card */}
          <Card className="p-6 border-2">
            <h2 className="text-xl font-bold mb-4">Driver Information</h2>
            <div className="flex items-center gap-4">
              {ride.driver.profile_picture_url ? (
                <Image
                  src={ride.driver.profile_picture_url}
                  alt={ride.driver.full_name}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-600">
                    {ride.driver.first_name?.[0]}{ride.driver.last_name?.[0]}
                  </span>
                </div>
              )}
              <div>
                <p className="font-semibold text-lg">{ride.driver.full_name}</p>
                <p className="text-sm text-gray-600">
                  {ride.driver.total_rides_driver} rides completed
                </p>
              </div>
            </div>

            {/* Vehicle info */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-3">
                <Car className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-500">Vehicle</p>
                  <p className="font-semibold">
                    {ride.vehicle.brand} {ride.vehicle.model || ''}
                  </p>
                  <p className="text-sm text-gray-600">
                    {ride.vehicle.color && `${ride.vehicle.color} • `}{ride.vehicle.plate_number}
                  </p>
                </div>
              </div>
            </div>

            {/* Languages */}
            {ride.driver.languages && ride.driver.languages.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500 mb-2">Driver speaks</p>
                <div className="flex flex-wrap gap-2">
                  {ride.driver.languages.map((lang: string) => (
                    <span
                      key={lang}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm border"
                    >
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Trip Completion Card - Only show if not completed yet */}
          {!tripCompleted && hasArrived && (isDriver || (userBooking && userBooking.status === 'approved')) && (
            <Card className="p-6 border-2">
              <h2 className="text-xl font-bold mb-4">Trip Completion</h2>

              {canMarkComplete ? (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-blue-800 mb-1">Trip has arrived</p>
                        <p className="text-sm text-blue-700 mb-3">
                          {totalMarkedComplete} of {totalParties} {totalParties === 1 ? 'party has' : 'parties have'} marked this trip as complete
                        </p>

                        {/* Show who has marked complete */}
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center gap-2 text-sm">
                            {ride.driver_marked_complete ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                            )}
                            <span className={ride.driver_marked_complete ? 'text-green-700 font-medium' : 'text-gray-600'}>
                              Driver
                            </span>
                          </div>
                          {approvedRequests.map((request) => {
                            const hasMarked = ridersWhoMarked.includes(request.rider_id)
                            return (
                              <div key={request.id} className="flex items-center gap-2 text-sm">
                                {hasMarked ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                                )}
                                <span className={hasMarked ? 'text-green-700 font-medium' : 'text-gray-600'}>
                                  {getDisplayName(request.rider)}
                                </span>
                              </div>
                            )
                          })}
                        </div>

                        <p className="text-xs text-blue-600">
                          Trip will auto-complete 5 hours after arrival time if not manually confirmed.
                        </p>
                      </div>
                    </div>
                  </div>

                  {!userHasMarkedComplete && (
                    <Button
                      onClick={handleMarkComplete}
                      disabled={markingComplete}
                      className="w-full rounded-full"
                    >
                      {markingComplete ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Marking complete...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Trip as Complete
                        </>
                      )}
                    </Button>
                  )}

                  {userHasMarkedComplete && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-center">
                      <p className="text-sm text-green-700 font-medium">
                        ✓ You&apos;ve marked this trip as complete
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-xl">
                  <p className="text-sm text-gray-600">
                    Trip completion will be available after the arrival time.
                  </p>
                </div>
              )}
            </Card>
          )}

          {/* Review Card - Only show if trip has arrived and user is a participant */}
          {hasArrived && (isDriver || (userBooking && userBooking.status === 'approved')) && (
            <Card className="p-6 border-2">
              <h2 className="text-xl font-bold mb-4">Write a Review</h2>

              {!selectedReviewee ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-4">
                    Select a person to leave a review for:
                  </p>

                  {/* List riders for driver, or show driver for rider */}
                  {isDriver ? (
                    // Driver reviews riders
                    approvedRequests.length > 0 ? (
                      approvedRequests.map((request) => {
                        const hasReviewed = existingReviews[request.rider_id]
                        return (
                          <div
                            key={request.id}
                            className="flex items-center justify-between p-4 border-2 rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {request.rider?.profile_picture_url ? (
                                <Image
                                  src={request.rider.profile_picture_url}
                                  alt={getDisplayName(request.rider)}
                                  width={40}
                                  height={40}
                                  className="h-10 w-10 rounded-full object-cover"
                                  sizes="40px"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold">
                                  {getDisplayName(request.rider).slice(0, 1).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <p className="font-semibold">{getDisplayName(request.rider)}</p>
                                {hasReviewed && (
                                  <p className="text-xs text-green-600">✓ Review submitted</p>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant={hasReviewed ? "outline" : "default"}
                              className="rounded-full"
                              onClick={() => {
                                setSelectedReviewee(request.rider_id)
                                if (hasReviewed) {
                                  setReviewText(hasReviewed.text || '')
                                } else {
                                  setReviewText('')
                                }
                              }}
                            >
                              {hasReviewed ? 'Edit review' : 'Leave review'}
                            </Button>
                          </div>
                        )
                      })
                    ) : (
                      <p className="text-sm text-gray-500">No riders to review</p>
                    )
                  ) : (
                    // Rider reviews driver
                    <div className="flex items-center justify-between p-4 border-2 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        {ride.driver.profile_picture_url ? (
                          <Image
                            src={ride.driver.profile_picture_url}
                            alt={ride.driver.full_name}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full object-cover"
                            sizes="40px"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold">
                            {ride.driver.first_name?.[0]}{ride.driver.last_name?.[0]}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold">{ride.driver.full_name}</p>
                          <p className="text-xs text-gray-500">Driver</p>
                          {existingReviews[ride.driver_id] && (
                            <p className="text-xs text-green-600">✓ Review submitted</p>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={existingReviews[ride.driver_id] ? "outline" : "default"}
                        className="rounded-full"
                        onClick={() => {
                          setSelectedReviewee(ride.driver_id)
                          const existing = existingReviews[ride.driver_id]
                          if (existing) {
                            setReviewText(existing.text || '')
                          } else {
                            setReviewText('')
                          }
                        }}
                      >
                        {existingReviews[ride.driver_id] ? 'Edit review' : 'Leave review'}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedReviewee(null)
                      setReviewText('')
                    }}
                    className="mb-2"
                  >
                    ← Back to list
                  </Button>

                  {/* Review Text */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Your review
                    </label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      maxLength={500}
                      rows={4}
                      placeholder="Share your experience with this trip..."
                      className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {reviewText.length}/500 characters
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={handleSubmitReview}
                    disabled={submittingReview || !reviewText.trim()}
                    className="w-full rounded-full"
                  >
                    {submittingReview ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : existingReviews[selectedReviewee] ? (
                      'Update Review'
                    ) : (
                      'Submit Review'
                    )}
                  </Button>

                  {existingReviews[selectedReviewee] && tripCompleted && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-center">
                      <p className="text-sm text-green-700 font-medium">
                        ✓ Your review is live and visible to others
                      </p>
                    </div>
                  )}

                  {existingReviews[selectedReviewee] && !tripCompleted && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-sm text-amber-700">
                        Your review is saved but will only become visible after the trip is marked as complete by all parties.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}

          {isDriver && !tripCompleted && (approvedRequests.length > 0 || pendingRequests.length > 0) && (
            <Card className="p-6 border-2">
              <h2 className="text-xl font-bold mb-4">Ride requests</h2>
              <div className="space-y-4">
                {approvedRequests.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700">Approved riders</h3>
                    {approvedRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex flex-col gap-3 rounded-2xl border px-4 py-3 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="flex items-center gap-3">
                          {request.rider?.profile_picture_url ? (
                            <Image
                              src={request.rider.profile_picture_url}
                              alt={getDisplayName(request.rider)}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-full object-cover"
                              sizes="40px"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold">
                              {getDisplayName(request.rider).slice(0, 1).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">
                              <Link href={`/profile/${request.rider?.id ?? ''}`} className="hover:underline">
                                {getDisplayName(request.rider)}
                              </Link>
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                              <span>
                                {request.seats_requested ?? 1} seat{(request.seats_requested ?? 1) > 1 ? 's' : ''}
                              </span>
                              <span className={`rounded-full border px-2 py-0.5 ${statusBadgeClass(request.status)}`}>
                                {request.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <Button asChild variant="ghost" size="sm" className="rounded-full">
                            <Link href={`/messages?ride=${ride.id}`}>Open chat</Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="rounded-full"
                            onClick={() => handleOpenCancel(request)}
                            disabled={rideCancelled}
                          >
                            Cancel rider
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {pendingRequests.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700">Pending requests</h3>
                    {pendingRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex flex-col gap-3 rounded-2xl border px-4 py-3 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="flex items-center gap-3">
                          {request.rider?.profile_picture_url ? (
                            <Image
                              src={request.rider.profile_picture_url}
                              alt={getDisplayName(request.rider)}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-full object-cover"
                              sizes="40px"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold">
                              {getDisplayName(request.rider).slice(0, 1).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">
                              <Link href={`/profile/${request.rider?.id ?? ''}`} className="hover:underline">
                                {getDisplayName(request.rider)}
                              </Link>
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                              <span>
                                {request.seats_requested ?? 1} seat{(request.seats_requested ?? 1) > 1 ? 's' : ''}
                              </span>
                              <span className={`rounded-full border px-2 py-0.5 ${statusBadgeClass(request.status)}`}>
                                {request.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <Button asChild variant="ghost" size="sm" className="rounded-full">
                            <Link href={`/messages?ride=${ride.id}`}>Open chat</Link>
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            className="rounded-full"
                            onClick={() => handleApproveRequest(request)}
                            disabled={rideCancelled || seatsRemaining < (request.seats_requested ?? 1)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="rounded-full"
                            onClick={() => handleOpenCancel(request)}
                            disabled={rideCancelled}
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Feedback messages */}
          {feedback && (
            <div
              className={`flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-sm ${
                feedback.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Action buttons - only show for non-drivers */}
          {!isDriver && (
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="flex-1 rounded-full"
                variant={userBooking?.status === 'pending' ? 'outline' : 'default'}
                onClick={userBooking?.status === 'pending' ? handleCancelRequest : handleRequestRide}
                disabled={
                  requesting ||
                  rideCancelled ||
                  (userBooking?.status === 'approved') ||
                  (userBooking?.status !== 'pending' && seatsRemaining === 0)
                }
              >
                <Users className="h-5 w-5 mr-2" />
                {rideCancelled
                  ? 'Ride cancelled'
                  : userBooking?.status === 'approved'
                  ? 'Request Approved'
                  : userBooking?.status === 'pending'
                  ? requesting
                    ? 'Cancelling...'
                    : 'Cancel Request'
                  : requesting
                  ? 'Sending request...'
                  : seatsRemaining === 0
                  ? 'Ride Full'
                  : 'Request to Join'}
              </Button>

              <Button
                variant="outline"
                className="flex-1 rounded-full border-2"
                onClick={handleContactDriver}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Contact Driver
              </Button>
            </div>
          )}

          {/* Driver view message */}
          {isDriver && rideCancelled && (
            <div className="p-4 rounded-xl text-center bg-red-50 border-2 border-red-200">
              <p className="text-red-700 font-medium">
                This ride is cancelled. Create a new ride if you need to plan a fresh trip.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>

    {cancelDialog && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <Card className="w-full max-w-md p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Cancel rider request</h3>
            <p className="text-sm text-gray-600">
              Choose a reason for removing this rider. They will be notified.
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Reason</label>
            <select
              value={cancelReason}
              onChange={(event) => setCancelReason(event.target.value)}
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
            >
              {CANCEL_REASON_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              className="rounded-full"
              onClick={() => setCancelDialog(null)}
              disabled={cancelSubmitting}
            >
              Keep rider
            </Button>
            <Button
              variant="destructive"
              className="rounded-full"
              onClick={handleConfirmCancel}
              disabled={cancelSubmitting}
            >
              {cancelSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cancel rider'}
            </Button>
          </div>
        </Card>
      </div>
    )}
    {riderCancelDialog && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <Card className="w-full max-w-md p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Cancel your request</h3>
            <p className="text-sm text-gray-600">
              Let the driver know why you need to cancel.
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Reason</label>
            <select
              value={riderCancelReason}
              onChange={(event) => setRiderCancelReason(event.target.value)}
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
            >
              {RIDER_CANCEL_REASON_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              className="rounded-full"
              onClick={() => setRiderCancelDialog(null)}
              disabled={riderCancelSubmitting}
            >
              Keep request
            </Button>
            <Button
              variant="destructive"
              className="rounded-full"
              onClick={handleConfirmRiderCancel}
              disabled={riderCancelSubmitting}
            >
              {riderCancelSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cancel request'}
            </Button>
          </div>
        </Card>
      </div>
    )}
    </>
  )
}
