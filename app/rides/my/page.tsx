'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import {
  Calendar,
  MapPin,
  Users,
  ArrowRight,
  Clock,
  BarChart3,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  Loader2
} from 'lucide-react'

type BookingRequest = {
  id: string
  status: 'pending' | 'approved' | 'declined' | 'cancelled'
  seats_requested: number
  rider_id: string
  rider: {
    id: string
    first_name: string | null
    last_name: string | null
    full_name: string | null
    profile_picture_url: string | null
    photo_url: string | null
  } | null
} | null

type DriverRide = {
  id: string
  origin_address: string
  destination_address: string
  departure_time: string
  status: string
  seats_available: number
  seats_booked: number
  suggested_total_cost: number
  created_at: string
  completed?: boolean
  booking_requests: BookingRequest[] | null
}

type RiderRequest = {
  id: string
  status: 'pending' | 'approved' | 'declined' | 'cancelled'
  seats_requested: number
  created_at: string
  ride: {
    id: string
    origin_address: string
    destination_address: string
    departure_time: string
    status: string
    suggested_total_cost: number
    completed?: boolean
    driver: {
      id: string
      first_name: string | null
      last_name: string | null
      full_name: string | null
      profile_picture_url: string | null
      photo_url: string | null
    } | null
  } | null
}

type UserSummary = {
  id: string
  first_name: string | null
  last_name: string | null
  full_name: string | null
  profile_picture_url: string | null
  photo_url: string | null
}

function getDisplayName(user: UserSummary | null | undefined) {
  if (!user) return 'Nordride user'
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ')
  return name || user.full_name || 'Nordride user'
}

function formatDateTime(date: string) {
  const d = new Date(date)
  return `${d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })} · ${d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })}`
}

function statusBadgeColor(status: string) {
  switch (status) {
    case 'published':
    case 'approved':
      return 'bg-green-50 text-green-700 border-green-200'
    case 'pending':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'declined':
    case 'cancelled':
      return 'bg-red-50 text-red-700 border-red-200'
    case 'completed':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}

export default function MyRidesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [driverRides, setDriverRides] = useState<DriverRide[]>([])
  const [riderRequests, setRiderRequests] = useState<RiderRequest[]>([])
  const [error, setError] = useState('')
  const [approvingRequestId, setApprovingRequestId] = useState<string | null>(null)
  const [cancellingRideId, setCancellingRideId] = useState<string | null>(null)

  useEffect(() => {
    const loadRides = async () => {
      try {
        const {
          data: { user }
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/auth/login?redirect=/rides/my')
          return
        }

        const [driverRes, riderRes] = await Promise.all([
          supabase
            .from('rides')
            .select(
              `
                id,
                origin_address,
                destination_address,
                departure_time,
                status,
                seats_available,
                seats_booked,
                suggested_total_cost,
                created_at,
                completed,
                booking_requests(
                  id,
                  status,
                  seats_requested,
                  rider_id,
                  rider:users!booking_requests_rider_id_fkey(
                    id,
                    first_name,
                    last_name,
                    full_name,
                    profile_picture_url,
                    photo_url
                  )
                )
              `
            )
            .eq('driver_id', user.id)
            .order('departure_time', { ascending: true }),
          supabase
            .from('booking_requests')
            .select(
              `
                id,
                status,
                seats_requested,
                created_at,
                ride:rides(
                  id,
                  origin_address,
                  destination_address,
                  departure_time,
                  status,
                  suggested_total_cost,
                  completed,
                  driver:users!rides_driver_id_fkey(
                    id,
                    first_name,
                    last_name,
                    full_name,
                    profile_picture_url,
                    photo_url
                  )
                )
              `
            )
            .eq('rider_id', user.id)
            .order('created_at', { ascending: false })
        ])

        if (driverRes.error) throw driverRes.error
        if (riderRes.error) throw riderRes.error

        // Normalize Supabase data (rider comes as an array)
        const normalizedDriverRides = (driverRes.data as any[] ?? []).map((ride: any) => ({
          ...ride,
          booking_requests: ride.booking_requests?.map((req: any) => {
            // Supabase returns related data as array, extract first element
            let riderData = null
            if (req.rider) {
              if (Array.isArray(req.rider) && req.rider.length > 0) {
                riderData = req.rider[0]
              } else if (!Array.isArray(req.rider)) {
                riderData = req.rider
              }
            }
            return {
              ...req,
              rider: riderData
            }
          }) ?? null
        }))

        // Normalize rider requests
        const normalizedRiderRequests = (riderRes.data as any[] ?? []).map((request: any) => ({
          ...request,
          ride: Array.isArray(request.ride) && request.ride.length > 0 ? {
            ...request.ride[0],
            driver: Array.isArray(request.ride[0].driver) && request.ride[0].driver.length > 0
              ? request.ride[0].driver[0]
              : null
          } : null
        }))

        setDriverRides(normalizedDriverRides)
        setRiderRequests(normalizedRiderRequests)
      } catch (err: any) {
        console.error('Failed to load rides', err)
        setError(err?.message || 'Failed to load your rides. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadRides()
  }, [router])

  // Separate active and completed rides
  const activeDriverRides = useMemo(
    () => driverRides.filter((ride) => ride.status !== 'cancelled' && !ride.completed),
    [driverRides]
  )

  const completedDriverRides = useMemo(
    () => driverRides.filter((ride) => ride.completed === true),
    [driverRides]
  )

  const activeRiderRequests = useMemo(
    () => riderRequests.filter((req) => !req.ride?.completed && req.ride?.status !== 'cancelled'),
    [riderRequests]
  )

  const completedRiderRequests = useMemo(
    () => riderRequests.filter((req) => req.ride?.completed === true && req.status === 'approved'),
    [riderRequests]
  )

  const stats = useMemo(() => {
    const now = Date.now()
    const offeredUpcoming = activeDriverRides.filter(
      (ride) => new Date(ride.departure_time).getTime() >= now
    ).length
    const offeredCount = activeDriverRides.length
    const joinedApproved = activeRiderRequests.filter((req) => req.status === 'approved').length
    const pendingRequests = activeRiderRequests.filter((req) => req.status === 'pending').length

    return [
      {
        label: 'Rides offered',
        value: offeredCount,
        sublabel: `${offeredUpcoming} upcoming`
      },
      {
        label: 'Rides joining',
        value: joinedApproved,
        sublabel: `${pendingRequests} pending`
      },
      {
        label: 'Seats filled',
        value: activeDriverRides.reduce((total, ride) => total + (ride.seats_booked ?? 0), 0),
        sublabel: 'Across all rides'
      }
    ]
  }, [activeDriverRides, activeRiderRequests])

  const handleApproveRequest = async (requestId: string, rideId: string) => {
    const rideRecord = driverRides.find((ride) => ride.id === rideId)
    if (!rideRecord) return

    const seatsRemaining = rideRecord.seats_available - rideRecord.seats_booked
    if (seatsRemaining <= 0) {
      setError('Cannot approve request. No seats remaining for this ride.')
      return
    }

    try {
      setApprovingRequestId(requestId)
      const { data, error: updateError } = await supabase
        .from('booking_requests')
        .update({ status: 'approved' })
        .eq('id', requestId)
        .select('id, ride_id, status, seats_requested')
        .single()

      if (updateError) throw updateError

      if (data) {
        setDriverRides((prev) =>
          prev.map((ride) => {
            if (ride.id !== data.ride_id) return ride
            const updatedRequests =
              ride.booking_requests?.map((request) =>
                request && request.id === data.id ? { ...request, status: 'approved' } : request
              ) ?? null

            return {
              ...ride,
              seats_booked: ride.seats_booked + (data.seats_requested ?? 0),
              booking_requests: updatedRequests as BookingRequest[] | null
            }
          })
        )
      }
    } catch (err: any) {
      console.error('Failed to approve request', err)
      setError(err?.message || 'Could not approve this rider. Please try again.')
    } finally {
      setApprovingRequestId(null)
    }
  }

  const handleCancelRide = async (rideId: string) => {
    const confirmed = window.confirm(
      'Cancel this ride? Riders will be notified and the trip will be removed from search results.'
    )
    if (!confirmed) return

    try {
      setCancellingRideId(rideId)
      const { error: cancelError } = await supabase
        .from('rides')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
        .eq('id', rideId)

      if (cancelError) throw cancelError

      setDriverRides((prev) =>
        prev.map((ride) => (ride.id === rideId ? { ...ride, status: 'cancelled' } : ride))
      )

      setRiderRequests((prev) =>
        prev.map((request) =>
          request.ride?.id === rideId ? { ...request, status: 'cancelled' } : request
        )
      )
    } catch (err: any) {
      console.error('Failed to cancel ride', err)
      setError(err?.message || 'Could not cancel this ride. Please try again.')
    } finally {
      setCancellingRideId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your rides...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-6xl space-y-10">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="font-display text-4xl md:text-5xl font-bold">My rides</h1>
            <p className="text-gray-600">
              Track the rides you&apos;re offering and the trips you&apos;re joining.
            </p>
          </div>
        </div>

        {error && (
          <Card className="border-2 border-red-200 bg-red-50 p-4 text-red-700 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((item) => (
            <Card key={item.label} className="p-6 border-2">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="h-5 w-5 text-gray-400" />
                <span className="text-xs uppercase tracking-wide text-gray-500">{item.label}</span>
              </div>
              <p className="text-3xl font-bold">{item.value}</p>
              <p className="text-sm text-gray-600 mt-1">{item.sublabel}</p>
            </Card>
          ))}
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold">Rides I&apos;m offering</h2>
            <Link href="/rides/create" className="text-sm font-medium hover:underline">
              Create new ride
            </Link>
          </div>

          {activeDriverRides.length === 0 ? (
            <Card className="p-8 text-center border-2 border-dashed">
              <p className="text-gray-600">
                You haven&apos;t created any active rides yet. Share a trip to get started.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeDriverRides.map((ride) => {
                const approvedRiders =
                  (ride.booking_requests ?? []).filter(
                    (request): request is NonNullable<BookingRequest> =>
                      !!request && request.status === 'approved'
                  )
                const pendingRequests =
                  (ride.booking_requests ?? []).filter(
                    (request): request is NonNullable<BookingRequest> =>
                      !!request && request.status === 'pending'
                  )

                return (
                  <Card key={ride.id} className="p-6 border-2">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center gap-1 mt-1">
                            <div className="w-2 h-2 rounded-full bg-black"></div>
                            <div className="w-0.5 h-6 bg-gray-300"></div>
                            <MapPin className="w-4 h-4 text-black" />
                          </div>
                          <div className="flex-1">
                            <div className="mb-3">
                              <p className="text-xs text-gray-500 uppercase tracking-wide">From</p>
                              <p className="font-semibold text-lg">{ride.origin_address}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">To</p>
                              <p className="font-semibold text-lg">{ride.destination_address}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                          <span className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full">
                            <Calendar className="h-4 w-4" />
                            {formatDateTime(ride.departure_time)}
                          </span>
                          <span className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full">
                            <Users className="h-4 w-4" />
                            {ride.seats_booked}/{ride.seats_available} seats filled
                          </span>
                          <span className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full">
                            <Clock className="h-4 w-4" />
                            Created {new Date(ride.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          <span
                            className={`inline-flex items-center gap-2 border px-3 py-1 rounded-full text-sm font-medium ${statusBadgeColor(ride.status)}`}
                          >
                            <ArrowRight className="h-4 w-4" />
                            {ride.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <p className="text-sm text-gray-600">
                          Total cost:{' '}
                          <span className="font-semibold text-gray-900">
                            {ride.suggested_total_cost} SEK
                          </span>
                        </p>
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="rounded-full border-2"
                            disabled={ride.status === 'cancelled'}
                          >
                            <Link href={`/rides/${ride.id}/edit`}>Edit ride</Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="rounded-full"
                            onClick={() => handleCancelRide(ride.id)}
                            disabled={ride.status === 'cancelled' || cancellingRideId === ride.id}
                          >
                            {cancellingRideId === ride.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Cancel'
                            )}
                          </Button>
                        </div>
                        <Button asChild variant="outline" className="rounded-full border-2">
                          <Link href={`/rides/${ride.id}`} className="flex items-center gap-2 text-sm">
                            View ride
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>

                    <div className="mt-6 border-t pt-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Approved riders ({approvedRiders.length})
                      </h3>
                      {approvedRiders.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          No confirmed riders yet. Pending requests will appear here once approved.
                        </p>
                      ) : (
                        <div className="flex flex-wrap items-center gap-3">
                          {approvedRiders.map((request) => {
                            const rider = request.rider
                            const name = getDisplayName(rider)
                            const avatarSrc = rider?.profile_picture_url || rider?.photo_url
                            const profileHref = rider?.id ? `/profile/${rider.id}` : undefined

                            const content = (
                              <div className="flex items-center gap-2 rounded-full border px-3 py-1">
                                {avatarSrc ? (
                                  <Image
                                    src={avatarSrc}
                                    alt={name}
                                    width={28}
                                    height={28}
                                    className="h-7 w-7 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="h-7 w-7 rounded-full bg-black text-white flex items-center justify-center text-xs font-semibold">
                                    {name.slice(0, 1).toUpperCase()}
                                  </div>
                                )}
                                <span className="text-sm font-medium">{name}</span>
                                {request.seats_requested > 1 && (
                                  <span className="text-xs text-gray-500">
                                    +{request.seats_requested - 1} seats
                                  </span>
                                )}
                              </div>
                            )

                            return profileHref ? (
                              <Link key={request.id} href={profileHref}>
                                {content}
                              </Link>
                            ) : (
                              <div key={request.id}>{content}</div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {pendingRequests.length > 0 && ride.status !== 'cancelled' && (
                      <div className="mt-6 border-t pt-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
                          Pending requests ({pendingRequests.length})
                        </h3>
                        <div className="space-y-3">
                          {pendingRequests.map((request) => {
                            const rider = request.rider
                            const name = getDisplayName(rider)
                            const avatarSrc = rider?.profile_picture_url || rider?.photo_url
                            const profileHref = rider?.id ? `/profile/${rider.id}` : undefined

                            return (
                              <div
                                key={request.id}
                                className="flex flex-col gap-3 rounded-2xl border px-4 py-3 md:flex-row md:items-center md:justify-between"
                              >
                                <div className="flex items-center gap-3">
                                  {profileHref ? (
                                    <Link href={profileHref}>
                                      {avatarSrc ? (
                                        <Image
                                          src={avatarSrc}
                                          alt={name}
                                          width={40}
                                          height={40}
                                          className="h-10 w-10 rounded-full object-cover"
                                        />
                                      ) : (
                                        <div className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold">
                                          {name.slice(0, 1).toUpperCase()}
                                        </div>
                                      )}
                                    </Link>
                                  ) : avatarSrc ? (
                                    <Image
                                      src={avatarSrc}
                                      alt={name}
                                      width={40}
                                      height={40}
                                      className="h-10 w-10 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold">
                                      {name.slice(0, 1).toUpperCase()}
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-semibold text-gray-900">{name}</p>
                                    <p className="text-xs text-gray-500">
                                      {request.seats_requested} seat
                                      {request.seats_requested > 1 ? 's' : ''} requested
                                    </p>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                  <div className="flex items-center gap-2">
                                    {profileHref && (
                                      <Button asChild variant="ghost" size="sm" className="rounded-full">
                                        <Link href={profileHref}>View profile</Link>
                                      </Button>
                                    )}
                                    <Button
                                      asChild
                                      variant="outline"
                                      size="sm"
                                      className="rounded-full border-2"
                                    >
                                      <Link href={`/messages?ride=${ride.id}`} className="flex items-center gap-1">
                                        <MessageCircle className="h-4 w-4" />
                                        Chat
                                      </Link>
                                    </Button>
                                  </div>
                                  <Button
                                    size="sm"
                                    className="rounded-full"
                                    onClick={() => handleApproveRequest(request.id, ride.id)}
                                    disabled={
                                      approvingRequestId === request.id ||
                                      ride.seats_available - ride.seats_booked <= 0
                                    }
                                  >
                                    {approvingRequestId === request.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                    )}
                                    Approve
                                  </Button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold">Rides I&apos;m joining</h2>
            <Link href="/rides/search" className="text-sm font-medium hover:underline">
              Find more rides
            </Link>
          </div>

          {activeRiderRequests.length === 0 ? (
            <Card className="p-8 text-center border-2 border-dashed">
              <p className="text-gray-600">
                You haven&apos;t requested to join any active rides yet. Explore available trips to get started.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeRiderRequests.map((request) => {
                if (!request.ride) return null
                const { ride } = request
                const driverName = getDisplayName(ride.driver ?? null)
                const driverAvatar = ride.driver?.profile_picture_url || ride.driver?.photo_url

                return (
                  <Card key={request.id} className="p-6 border-2">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center gap-1 mt-1">
                            <div className="w-2 h-2 rounded-full bg-black"></div>
                            <div className="w-0.5 h-6 bg-gray-300"></div>
                            <MapPin className="w-4 h-4 text-black" />
                          </div>
                          <div className="flex-1">
                            <div className="mb-3">
                              <p className="text-xs text-gray-500 uppercase tracking-wide">From</p>
                              <p className="font-semibold text-lg">{ride.origin_address}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">To</p>
                              <p className="font-semibold text-lg">{ride.destination_address}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                          <span className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full">
                            <Calendar className="h-4 w-4" />
                            {formatDateTime(ride.departure_time)}
                          </span>
                          <span className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full">
                            <Users className="h-4 w-4" />
                            {request.seats_requested} seat{request.seats_requested > 1 ? 's' : ''} requested
                          </span>
                          <span
                            className={`inline-flex items-center gap-2 border px-3 py-1 rounded-full text-sm font-medium ${statusBadgeColor(request.status)}`}
                          >
                            {request.status === 'approved' ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <AlertCircle className="h-4 w-4" />
                            )}
                            {request.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <div className="flex items-center gap-2">
                          {driverAvatar ? (
                            <Image
                              src={driverAvatar}
                              alt={driverName}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold">
                              {driverName.slice(0, 1).toUpperCase()}
                            </div>
                          )}
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Driver</p>
                            <p className="font-semibold text-gray-900">{driverName}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MessageCircle className="h-4 w-4" />
                          <Link href={`/messages?ride=${ride.id}`} className="font-medium hover:underline">
                            Open chat
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </section>

        {/* Completed Rides Section */}
        {(completedDriverRides.length > 0 || completedRiderRequests.length > 0) && (
          <section className="space-y-4">
            <h2 className="font-display text-2xl font-bold">Completed Rides</h2>

            {completedDriverRides.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-700">As Driver</h3>
                <div className="grid gap-4">
                  {completedDriverRides.map((ride) => (
                    <Link key={ride.id} href={`/rides/${ride.id}`}>
                      <Card className="p-6 border-2 hover:shadow-lg transition-all cursor-pointer bg-gray-50">
                        <div className="flex flex-col gap-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <MapPin className="h-4 w-4 text-green-600" />
                                <span className="text-xs text-gray-500">From</span>
                              </div>
                              <p className="font-semibold text-lg mb-3">{ride.origin_address}</p>
                              <div className="flex items-center gap-2 mb-2">
                                <MapPin className="h-4 w-4 text-emerald-600" />
                                <span className="text-xs text-gray-500">To</span>
                              </div>
                              <p className="font-semibold text-lg">{ride.destination_address}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                Completed
                              </span>
                              <span className="text-sm text-gray-500">
                                {formatDateTime(ride.departure_time)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {completedRiderRequests.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-700">As Rider</h3>
                <div className="grid gap-4">
                  {completedRiderRequests.map((request) => {
                    if (!request.ride) return null
                    const { ride } = request
                    return (
                      <Link key={request.id} href={`/rides/${ride.id}`}>
                        <Card className="p-6 border-2 hover:shadow-lg transition-all cursor-pointer bg-gray-50">
                          <div className="flex flex-col gap-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <MapPin className="h-4 w-4 text-green-600" />
                                  <span className="text-xs text-gray-500">From</span>
                                </div>
                                <p className="font-semibold text-lg mb-3">{ride.origin_address}</p>
                                <div className="flex items-center gap-2 mb-2">
                                  <MapPin className="h-4 w-4 text-emerald-600" />
                                  <span className="text-xs text-gray-500">To</span>
                                </div>
                                <p className="font-semibold text-lg">{ride.destination_address}</p>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                  Completed
                                </span>
                                <span className="text-sm text-gray-500">
                                  {formatDateTime(ride.departure_time)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
