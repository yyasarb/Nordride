'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  Check
} from 'lucide-react'
import Link from 'next/link'
import { LogoLink } from '@/components/layout/logo-link'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

type RideDetails = {
  id: string
  driver_id: string
  vehicle_id: string
  origin_address: string
  destination_address: string
  route_km: number
  departure_time: string
  seats_available: number
  seats_booked: number
  suggested_total_cost: number
  status: string
  is_round_trip: boolean
  return_departure_time: string | null
  return_suggested_total_cost: number | null
  description: string | null
  pets_allowed: boolean
  smoking_allowed: boolean
  luggage_capacity: string[] | null
  created_at: string
  driver: {
    id: string
    full_name: string
    first_name: string
    last_name: string
    profile_picture_url: string | null
    trust_score: number
    total_rides_driver: number
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
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

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
              total_rides_driver
            ),
            vehicle:vehicles!rides_vehicle_id_fkey(
              brand,
              model,
              color,
              plate_number
            )
          `)
          .eq('id', params.id)
          .single()

        if (error) throw error
        setRide(rideData as RideDetails)
      } catch (error) {
        console.error('Failed to load ride:', error)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [params.id])

  const handleRequestRide = async () => {
    if (!user || !ride) {
      setFeedback({ type: 'error', message: 'Please log in to request a ride.' })
      return
    }

    if (user.id === ride.driver_id) {
      setFeedback({ type: 'error', message: 'You cannot request your own ride.' })
      return
    }

    setRequesting(true)
    setFeedback(null)

    try {
      // Create a ride request
      const { error: requestError } = await supabase
        .from('ride_requests')
        .insert({
          ride_id: ride.id,
          rider_id: user.id,
          status: 'pending',
          seats_requested: 1,
        })

      if (requestError) {
        // Check if request already exists
        if (requestError.code === '23505') {
          setFeedback({ type: 'error', message: 'You have already requested this ride.' })
        } else {
          throw requestError
        }
        return
      }

      // TODO: Send notification to driver
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

  const handleContactDriver = () => {
    if (!user) {
      setFeedback({ type: 'error', message: 'Please log in to contact the driver.' })
      return
    }

    if (!ride) return

    // Navigate to messages/chat page with the driver
    router.push(`/messages?ride=${ride.id}&driver=${ride.driver_id}`)
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Ride not found</h1>
          <Button asChild>
            <Link href="/rides/search">Back to search</Link>
          </Button>
        </div>
      </div>
    )
  }

  const isDriver = user?.id === ride.driver_id
  const seatsRemaining = ride.seats_available - ride.seats_booked

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <LogoLink />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back button */}
        <Button variant="outline" asChild className="mb-6 rounded-full">
          <Link href="/rides/search">← Back to rides</Link>
        </Button>

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
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <Users className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Available Seats</p>
                  <p className="font-semibold">
                    {seatsRemaining} of {ride.seats_available} seats remaining
                  </p>
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
              {ride.description && (
                <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 mb-1">Driver&apos;s Notes</p>
                      <p className="text-sm text-amber-700">{ride.description}</p>
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
                <img
                  src={ride.driver.profile_picture_url}
                  alt={ride.driver.full_name}
                  className="w-16 h-16 rounded-full object-cover"
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
                <p className="text-sm text-gray-600">
                  Trust score: {ride.driver.trust_score}/100
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
          </Card>

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
                className="flex-1 rounded-full text-lg py-6"
                size="lg"
                onClick={handleRequestRide}
                disabled={requesting || seatsRemaining === 0}
              >
                <Users className="h-5 w-5 mr-2" />
                {requesting ? 'Sending request...' : seatsRemaining === 0 ? 'Ride Full' : 'Request to Join'}
              </Button>

              <Button
                variant="outline"
                className="flex-1 rounded-full text-lg py-6 border-2"
                size="lg"
                onClick={handleContactDriver}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Contact Driver
              </Button>
            </div>
          )}

          {/* Driver view message */}
          {isDriver && (
            <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl text-center">
              <p className="text-blue-800 font-medium">
                This is your ride. Riders can request to join from this page.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
