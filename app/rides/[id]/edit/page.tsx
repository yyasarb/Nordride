'use client'

import { useState, useEffect, useMemo, useRef, forwardRef, type ChangeEvent, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  MapPin,
  Calendar,
  Users,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Car,
  Clock,
  PawPrint,
  Cigarette,
  Backpack,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

const TIME_OPTIONS = Array.from({ length: 48 }, (_, index) => {
  const hours = Math.floor(index / 2).toString().padStart(2, '0')
  const minutes = index % 2 === 0 ? '00' : '30'
  return `${hours}:${minutes}`
})

const PRICE_STEP = 50

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  if (hours === 0) return `${remaining} min`
  if (remaining === 0) return `${hours} h`
  return `${hours} h ${remaining} min`
}

const estimateCost = (distanceKm: number) =>
  Math.max(PRICE_STEP, Math.ceil((distanceKm * 1.2) / PRICE_STEP) * PRICE_STEP)

type GeocodeResult = {
  display_name: string
  lat: number
  lon: number
}

type VehicleOption = {
  id: string
  brand: string
  model: string | null
  color?: string | null
  seats: number
  is_primary: boolean
  plate_number?: string
  year?: number | null
}

type RouteInfo = {
  distance_km: number
  duration_minutes: number
  polyline?: string
}

type RideFormState = {
  origin: string
  destination: string
  date: string
  time: string
  seats: number
  price: string
  vehicleId: string
  isRoundTrip: boolean
  returnDate: string
  returnTime: string
  specialRequest: string
  petsAllowed: boolean
  smokingAllowed: boolean
  luggageOptions: string[]
}

const INITIAL_FORM: RideFormState = {
  origin: '',
  destination: '',
  date: '',
  time: '08:00',
  seats: 1,
  price: '',
  vehicleId: '',
  isRoundTrip: false,
  returnDate: '',
  returnTime: '17:00',
  specialRequest: '',
  petsAllowed: false,
  smokingAllowed: false,
  luggageOptions: [],
}

function toDateInput(value: string | null) {
  if (!value) return ''
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10)
}

function toTimeInput(value: string | null) {
  if (!value) return '08:00'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '08:00'
  return d.toTimeString().slice(0, 5)
}

export default function EditRidePage({ params }: { params: { id: string } }) {
  const rideId = params.id
  const router = useRouter()
  const [formData, setFormData] = useState<RideFormState>(INITIAL_FORM)
  const [user, setUser] = useState<User | null>(null)
  const [requirements, setRequirements] = useState({
    emailVerified: false,
    hasVehicle: false,
    hasProfilePicture: false,
    hasBio: false,
    hasLanguages: false,
    hasInterests: false,
    profileCompleted: false
  })
  const [vehicles, setVehicles] = useState<VehicleOption[]>([])
  const [checkingRequirements, setCheckingRequirements] = useState(true)
  const [loadingRide, setLoadingRide] = useState(true)
  const [existingRide, setExistingRide] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const [originSuggestions, setOriginSuggestions] = useState<GeocodeResult[]>([])
  const [destinationSuggestions, setDestinationSuggestions] = useState<GeocodeResult[]>([])
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false)
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false)
  const originRef = useRef<HTMLDivElement>(null)
  const destinationRef = useRef<HTMLDivElement>(null)

  const [originLocation, setOriginLocation] = useState<GeocodeResult | null>(null)
  const [destinationLocation, setDestinationLocation] = useState<GeocodeResult | null>(null)
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null)
  const [existingPolyline, setExistingPolyline] = useState<string | null>(null)
  const [existingDistance, setExistingDistance] = useState<number | null>(null)
  const [routeCalculating, setRouteCalculating] = useState(false)
  const [routeError, setRouteError] = useState('')
  const [suggestedCost, setSuggestedCost] = useState<number | null>(null)
  const [priceManuallyEdited, setPriceManuallyEdited] = useState(false)

  const [showVehicleForm, setShowVehicleForm] = useState(false)
  const [vehicleForm, setVehicleForm] = useState({ brand: '', model: '', color: '', plateNumber: '' })
  const [vehicleError, setVehicleError] = useState('')
  const [addingVehicle, setAddingVehicle] = useState(false)

  useEffect(() => {
    const loadRide = async (userId: string, fetchedVehicles: VehicleOption[]) => {
      setLoadingRide(true)
      try {
        const { data: rideData, error: rideError } = await supabase
          .from('rides')
          .select(`
            id,
            driver_id,
            vehicle_id,
            origin_address,
            destination_address,
            departure_time,
            return_departure_time,
            route_polyline,
            route_km,
            seats_available,
            seats_booked,
            suggested_total_cost,
            return_suggested_total_cost,
            is_round_trip,
            pets_allowed,
            smoking_allowed,
            luggage_capacity,
            route_description,
            status
          `)
          .eq('id', rideId)
          .single()

        if (rideError || !rideData) {
          throw rideError || new Error('Ride not found')
        }

        if (rideData.driver_id !== userId) {
          router.push(`/rides/${rideId}`)
          return
        }

        if (rideData.status === 'cancelled') {
          setFeedback({ type: 'error', message: 'This ride has been cancelled and cannot be edited.' })
          setExistingRide(rideData)
          return
        }

        setExistingRide(rideData)
        setFormData({
          origin: rideData.origin_address,
          destination: rideData.destination_address,
          date: toDateInput(rideData.departure_time),
          time: toTimeInput(rideData.departure_time),
          seats: rideData.seats_available,
          price: rideData.suggested_total_cost?.toString() ?? '',
          vehicleId: rideData.vehicle_id ?? fetchedVehicles[0]?.id ?? '',
          isRoundTrip: rideData.is_round_trip ?? false,
          returnDate: rideData.is_round_trip ? toDateInput(rideData.return_departure_time) : '',
          returnTime: rideData.is_round_trip ? toTimeInput(rideData.return_departure_time) : '17:00',
          specialRequest: rideData.route_description ?? '',
          petsAllowed: rideData.pets_allowed ?? false,
          smokingAllowed: rideData.smoking_allowed ?? false,
          luggageOptions: rideData.luggage_capacity ?? []
        })

        setSuggestedCost(rideData.return_suggested_total_cost ?? rideData.suggested_total_cost ?? null)
        setPriceManuallyEdited(true)
        setExistingPolyline(rideData.route_polyline ?? null)
        setExistingDistance(Number(rideData.route_km ?? 0))
        setRouteInfo({
          distance_km: Number(rideData.route_km ?? 0),
          duration_minutes: 0,
          polyline: rideData.route_polyline ?? undefined
        })

        await preloadLocations(rideData.origin_address, rideData.destination_address)
      } catch (error: any) {
        console.error('Failed to load ride:', error)
        setFeedback({ type: 'error', message: error?.message || 'Unable to load this ride.' })
      } finally {
        setLoadingRide(false)
      }
    }

    const preloadLocations = async (origin: string, destination: string) => {
      try {
        const [originData, destinationData] = await Promise.all([
          geocodeAddress(origin),
          geocodeAddress(destination)
        ])

        if (originData) setOriginLocation(originData)
        if (destinationData) setDestinationLocation(destinationData)
      } catch (err) {
        console.warn('Unable to preload coordinates for ride:', err)
      }
    }

    const init = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user ?? null)

      if (!data.user) {
        router.push(`/auth/login?redirect=/rides/${rideId}/edit`)
        return
      }

      try {
        const [{ data: profile }, { data: vehiclesData }] = await Promise.all([
          supabase
            .from('users')
            .select('email_verified, photo_url, profile_picture_url, bio, languages, interests, profile_completed')
            .eq('id', data.user.id)
            .single(),
          supabase
            .from('vehicles')
            .select('*')
            .eq('user_id', data.user.id)
            .order('is_primary', { ascending: false }),
        ])

        const fetchedVehicles = vehiclesData ? [...vehiclesData] : []
        setVehicles(fetchedVehicles)

        const hasPhoto = !!(profile?.photo_url || profile?.profile_picture_url)
        const hasBio = !!(profile?.bio && profile.bio.trim() !== '')
        const hasLangs = !!(profile?.languages && profile.languages.length > 0)
        const hasInterests = !!(profile?.interests && profile.interests.length > 0)
        const profileReady = hasPhoto && hasBio && hasLangs && hasInterests

        setRequirements({
          emailVerified: true,
          hasVehicle: fetchedVehicles.length > 0,
          hasProfilePicture: hasPhoto,
          hasBio: hasBio,
          hasLanguages: hasLangs,
          hasInterests: hasInterests,
          profileCompleted: profileReady
        })

        await loadRide(data.user.id, fetchedVehicles)
      } catch (error) {
        console.error('Failed to load profile or vehicles:', error)
        setFeedback({ type: 'error', message: 'Unable to load your ride. Please try again.' })
      } finally {
        setCheckingRequirements(false)
      }
    }

    init()
  }, [rideId, router])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(event.target as Node)) {
        setShowOriginSuggestions(false)
      }
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setShowDestinationSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (formData.origin.length < 2) {
        setOriginSuggestions([])
        return
      }

      try {
        const response = await fetch(`/api/geocoding?address=${encodeURIComponent(formData.origin)}`)
        if (response.ok) {
          const data = await response.json()
          setOriginSuggestions(data.slice(0, 5))
          setShowOriginSuggestions(true)
        }
      } catch (err) {
        console.error('Autocomplete error:', err)
      }
    }

    const timer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(timer)
  }, [formData.origin])

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (formData.destination.length < 2) {
        setDestinationSuggestions([])
        return
      }

      try {
        const response = await fetch(`/api/geocoding?address=${encodeURIComponent(formData.destination)}`)
        if (response.ok) {
          const data = await response.json()
          setDestinationSuggestions(data.slice(0, 5))
          setShowDestinationSuggestions(true)
        }
      } catch (err) {
        console.error('Autocomplete error:', err)
      }
    }

    const timer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(timer)
  }, [formData.destination])

  const parseLocationLabel = (display: string) => display.split(',')[0]?.trim() ?? display

  useEffect(() => {
    if (!originLocation || !destinationLocation) return

    let cancelled = false
    const calculateRoute = async () => {
      setRouteCalculating(true)
      setRouteError('')
      try {
        const response = await fetch('/api/routing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            start: { lat: originLocation.lat, lon: originLocation.lon },
            end: { lat: destinationLocation.lat, lon: destinationLocation.lon }
          })
        })

        if (!response.ok) {
          throw new Error('Unable to calculate the route. Please adjust the locations and try again.')
        }

        if (cancelled) return

        const data = await response.json()
        setRouteInfo(data)
        setExistingPolyline(data.polyline)
        setExistingDistance(Number(data.distance_km ?? 0))

        if (!priceManuallyEdited && data.distance_km) {
          const suggested = estimateCost(Number(data.distance_km))
          setFormData((prev) => ({ ...prev, price: suggested.toString() }))
          setSuggestedCost(suggested)
        }
      } catch (error: any) {
        console.error('Route calculation failed', error)
        setRouteError(error?.message || 'Unable to calculate route. Please try again.')
      } finally {
        if (!cancelled) setRouteCalculating(false)
      }
    }

    calculateRoute()
    return () => {
      cancelled = true
    }
  }, [originLocation, destinationLocation, priceManuallyEdited])

  const timeOptions = useMemo(() => TIME_OPTIONS, [])

  const minSeats = existingRide?.seats_booked ?? 0
  const canPublish = useMemo(() => {
    const routeReady = routeInfo || (existingPolyline ? { polyline: existingPolyline } : null)
    if (!user || checkingRequirements || loadingRide) return false
    if (!requirements.profileCompleted) return false
    if (!formData.origin || !formData.destination || !formData.date || !formData.time || !formData.vehicleId) return false
    if (Number(formData.price) <= 0) return false
    if (formData.seats < minSeats) return false
    if (!routeReady) return false
    if (formData.isRoundTrip && (!formData.returnDate || !formData.returnTime)) return false
    return true
  }, [user, checkingRequirements, loadingRide, requirements, formData, minSeats, routeInfo, existingPolyline])

  const resetVehicleForm = () => {
    setVehicleForm({ brand: '', model: '', color: '', plateNumber: '' })
    setVehicleError('')
  }

  const handleVehicleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user) return

    const { brand, model, color, plateNumber } = vehicleForm
    if (!brand.trim() || !plateNumber.trim()) {
      setVehicleError('Brand and plate number are required')
      return
    }

    setAddingVehicle(true)
    setVehicleError('')

    try {
      const { data: inserted, error } = await supabase
        .from('vehicles')
        .insert({
          user_id: user.id,
          brand: brand.trim(),
          model: model.trim() || null,
          color: color.trim() || null,
          plate_number: plateNumber.trim().toUpperCase(),
          seats: 4,
          is_primary: vehicles.length === 0,
        })
        .select('*')

      if (error) throw error

      if (inserted) {
        const updatedVehicles = [inserted[0], ...vehicles]
        setVehicles(updatedVehicles)
        setFormData((prev) => ({ ...prev, vehicleId: inserted[0].id }))
        setShowVehicleForm(false)
        setFeedback({ type: 'success', message: 'Vehicle added successfully.' })
      }
    } catch (error) {
      console.error('Failed to add vehicle:', error)
      setVehicleError('Could not add vehicle. Please double-check the details and try again.')
    } finally {
      setAddingVehicle(false)
    }
  }

  const geocodeAddress = async (address: string) => {
    const response = await fetch(`/api/geocoding?address=${encodeURIComponent(address)}`)
    if (!response.ok) return null
    const data = await response.json()
    return data?.[0] ?? null
  }

  const handleUpdate = async () => {
    if (!user || !canPublish || !existingRide) return

    if (formData.seats < minSeats) {
      setFeedback({
        type: 'error',
        message: `You already have ${minSeats} seat${minSeats === 1 ? '' : 's'} booked. Increase available seats or decline riders before saving.`,
      })
      return
    }

    setSubmitting(true)
    setFeedback(null)

    try {
      if (!originLocation || !destinationLocation) {
        throw new Error('Please select both departure and arrival locations from the suggestions.')
      }

      let currentRoute = routeInfo
      if (!currentRoute) {
        if (existingPolyline && existingDistance !== null) {
          currentRoute = {
            distance_km: existingDistance,
            duration_minutes: routeInfo?.duration_minutes ?? 0,
            polyline: existingPolyline
          }
        } else {
          const response = await fetch('/api/routing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              start: { lat: originLocation.lat, lon: originLocation.lon },
              end: { lat: destinationLocation.lat, lon: destinationLocation.lon },
            }),
          })
          if (!response.ok) {
            throw new Error('Unable to validate the route right now.')
          }
          currentRoute = await response.json()
          setExistingPolyline(currentRoute?.polyline ?? null)
          setExistingDistance(Number(currentRoute?.distance_km ?? 0))
        }
      }

      if (!currentRoute || !currentRoute.polyline) {
        throw new Error('Unable to determine route for this journey.')
      }

      const departure = new Date(`${formData.date}T${formData.time}`)
      if (Number.isNaN(departure.getTime())) {
        throw new Error('Invalid departure date or time.')
      }

      let returnDeparture: Date | null = null
      if (formData.isRoundTrip) {
        returnDeparture = new Date(`${formData.returnDate}T${formData.returnTime}`)
        if (Number.isNaN(returnDeparture.getTime())) {
          throw new Error('Invalid return date or time.')
        }
      }

      const { error: updateError } = await supabase
        .from('rides')
        .update({
          vehicle_id: formData.vehicleId,
          origin_address: formData.origin,
          origin_coords: `POINT(${originLocation.lon} ${originLocation.lat})`,
          destination_address: formData.destination,
          destination_coords: `POINT(${destinationLocation.lon} ${destinationLocation.lat})`,
          route_polyline: currentRoute.polyline,
          route_km: Number(currentRoute.distance_km),
          departure_time: departure.toISOString(),
          seats_available: formData.seats,
          suggested_total_cost: Number(formData.price),
          is_round_trip: formData.isRoundTrip,
          return_departure_time: formData.isRoundTrip && returnDeparture ? returnDeparture.toISOString() : null,
          return_suggested_total_cost: formData.isRoundTrip && suggestedCost ? suggestedCost : null,
          route_description: formData.specialRequest.trim() || null,
          pets_allowed: formData.petsAllowed,
          smoking_allowed: formData.smokingAllowed,
          luggage_capacity: formData.luggageOptions.length > 0 ? formData.luggageOptions : null,
        })
        .eq('id', rideId)

      if (updateError) throw updateError

      setFeedback({ type: 'success', message: 'Ride updated successfully. Redirecting...' })
      setTimeout(() => {
        router.push(`/rides/${rideId}`)
      }, 1000)
    } catch (error: any) {
      console.error('Update ride error:', error)
      setFeedback({
        type: 'error',
        message: error?.message || 'Could not update the ride. Please try again.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingRide) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ride details...</p>
        </div>
      </div>
    )
  }

  if (existingRide?.status === 'cancelled') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md p-8 text-center border-2 border-amber-200 bg-amber-50">
          <h1 className="text-xl font-semibold mb-3">Ride cancelled</h1>
          <p className="text-sm text-amber-800">
            This ride has been cancelled and can no longer be edited. Create a new ride if you would like to schedule a fresh trip.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button asChild className="rounded-full">
              <Link href="/rides/create">Offer a new ride</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-2">
              <Link href="/rides/my">Go to My rides</Link>
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="text-4xl font-bold mb-2">Edit ride</h1>
        <p className="text-gray-600 mb-8">Update the details of your trip. Riders will be notified about important changes.</p>

        <Card className="p-6">
          <div className="space-y-6">
            {!checkingRequirements && !requirements.profileCompleted && (
              <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Complete your profile before editing
                </h3>
                <p className="text-sm text-amber-700">
                  Please visit your <Link href="/profile" className="underline font-medium">profile page</Link> to complete the missing sections.
                </p>
              </div>
            )}

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

            {/* Locations */}
            <div className="grid md:grid-cols-2 gap-4">
              <LocationInput
                ref={originRef}
                label="From"
                value={formData.origin}
                placeholder="e.g., Stockholm"
                onChange={(value) => setFormData((prev) => ({ ...prev, origin: value }))}
                onFocus={() => formData.origin.length >= 2 && setShowOriginSuggestions(true)}
                suggestions={originSuggestions}
                showSuggestions={showOriginSuggestions}
                onSelectSuggestion={(suggestion) => {
                  setFormData((prev) => ({ ...prev, origin: suggestion.display_name }))
                  setOriginLocation(suggestion)
                  setShowOriginSuggestions(false)
                }}
              />

              <LocationInput
                ref={destinationRef}
                label="To"
                value={formData.destination}
                placeholder="e.g., Gothenburg"
                onChange={(value) => setFormData((prev) => ({ ...prev, destination: value }))}
                onFocus={() => formData.destination.length >= 2 && setShowDestinationSuggestions(true)}
                suggestions={destinationSuggestions}
                showSuggestions={showDestinationSuggestions}
                onSelectSuggestion={(suggestion) => {
                  setFormData((prev) => ({ ...prev, destination: suggestion.display_name }))
                  setDestinationLocation(suggestion)
                  setShowDestinationSuggestions(false)
                }}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Departure date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(event) => setFormData((prev) => ({ ...prev, date: event.target.value }))}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Departure time
                </label>
                <select
                  value={formData.time}
                  onChange={(event) => setFormData((prev) => ({ ...prev, time: event.target.value }))}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                >
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Available seats
                </label>
                <input
                  type="number"
                  min={minSeats || 1}
                  max={8}
                  value={formData.seats}
                  onChange={(event) => setFormData((prev) => ({ ...prev, seats: Number(event.target.value) }))}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                />
                {minSeats > 0 && (
                  <p className="text-xs text-gray-500">Minimum {minSeats} seat{minSeats === 1 ? '' : 's'} required for already approved riders.</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total price (SEK)
                </label>
                <input
                  type="number"
                  min={PRICE_STEP}
                  step={PRICE_STEP}
                  value={formData.price}
                  onChange={(event) => {
                    setFormData((prev) => ({ ...prev, price: event.target.value }))
                    setPriceManuallyEdited(true)
                  }}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                />
                {suggestedCost && (
                  <p className="text-xs text-gray-500">Suggested based on distance: {suggestedCost} SEK</p>
                )}
              </div>
            </div>

            {/* Vehicle */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Car className="h-4 w-4" />
                Choose vehicle
              </label>
              <select
                value={formData.vehicleId}
                onChange={(event) => setFormData((prev) => ({ ...prev, vehicleId: event.target.value }))}
                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
              >
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.brand} {vehicle.model ?? ''} • {vehicle.color ?? 'Color TBD'} • {vehicle.plate_number ?? 'Plate TBD'}
                  </option>
                ))}
              </select>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full"
                onClick={() => {
                  resetVehicleForm()
                  setShowVehicleForm((prev) => !prev)
                }}
              >
                {showVehicleForm ? 'Hide vehicle form' : 'Add a new vehicle'}
              </Button>

              {showVehicleForm && (
                <form className="grid gap-4 mt-4" onSubmit={handleVehicleSubmit}>
                  <div className="grid gap-1">
                    <label className="text-sm font-medium">Brand</label>
                    <input
                      type="text"
                      value={vehicleForm.brand}
                      onChange={(event) => setVehicleForm((prev) => ({ ...prev, brand: event.target.value }))}
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      required
                      disabled={addingVehicle}
                    />
                  </div>
                  <div className="grid gap-1">
                    <label className="text-sm font-medium">Model</label>
                    <input
                      type="text"
                      value={vehicleForm.model}
                      onChange={(event) => setVehicleForm((prev) => ({ ...prev, model: event.target.value }))}
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      disabled={addingVehicle}
                    />
                  </div>
                  <div className="grid gap-1">
                    <label className="text-sm font-medium">Color</label>
                    <input
                      type="text"
                      value={vehicleForm.color}
                      onChange={(event) => setVehicleForm((prev) => ({ ...prev, color: event.target.value }))}
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      disabled={addingVehicle}
                    />
                  </div>
                  <div className="grid gap-1">
                    <label className="text-sm font-medium">Plate number</label>
                    <input
                      type="text"
                      value={vehicleForm.plateNumber}
                      onChange={(event) => setVehicleForm((prev) => ({ ...prev, plateNumber: event.target.value }))}
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      required
                      disabled={addingVehicle}
                    />
                  </div>
                  {vehicleError && <p className="text-sm text-red-600">{vehicleError}</p>}
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="rounded-full"
                      onClick={() => {
                        setShowVehicleForm(false)
                        resetVehicleForm()
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" className="rounded-full" disabled={addingVehicle}>
                      {addingVehicle ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save vehicle'}
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* Round-trip toggle */}
            <div className="flex items-center justify-between rounded-xl border-2 px-4 py-3 bg-gray-50">
              <div className="space-y-1">
                <p className="text-sm font-medium">Round trip</p>
                <p className="text-xs text-gray-500">Add a return journey for the same passengers</p>
              </div>
              <input
                type="checkbox"
                checked={formData.isRoundTrip}
                onChange={(event) => setFormData((prev) => ({ ...prev, isRoundTrip: event.target.checked }))}
                className="h-5 w-5"
              />
            </div>

            {formData.isRoundTrip && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Return date
                  </label>
                  <input
                    type="date"
                    value={formData.returnDate}
                    onChange={(event) => setFormData((prev) => ({ ...prev, returnDate: event.target.value }))}
                    className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Return time
                  </label>
                  <select
                    value={formData.returnTime}
                    onChange={(event) => setFormData((prev) => ({ ...prev, returnTime: event.target.value }))}
                    className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                  >
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Preferences */}
            <div className="grid md:grid-cols-3 gap-4">
              <PreferenceToggle
                label="Pets allowed"
                icon={<PawPrint className="h-4 w-4" />}
                value={formData.petsAllowed}
                onChange={(value) => setFormData((prev) => ({ ...prev, petsAllowed: value }))}
              />
              <PreferenceToggle
                label="Smoking allowed"
                icon={<Cigarette className="h-4 w-4" />}
                value={formData.smokingAllowed}
                onChange={(value) => setFormData((prev) => ({ ...prev, smokingAllowed: value }))}
              />
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Backpack className="h-4 w-4" />
                  Luggage options
                </label>
                <div className="flex flex-wrap gap-2">
                  {['small', 'carry_on', 'large'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => {
                          const exists = prev.luggageOptions.includes(option)
                          return {
                            ...prev,
                            luggageOptions: exists
                              ? prev.luggageOptions.filter((item) => item !== option)
                              : [...prev.luggageOptions, option]
                          }
                        })
                      }}
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${
                        formData.luggageOptions.includes(option)
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-gray-700'
                      }`}
                    >
                      {option === 'carry_on' ? 'Carry-on' : option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Special requests */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Driver notes</label>
              <textarea
                placeholder="Share pickup instructions, planned stops, or preferences for riders."
                value={formData.specialRequest}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData((prev) => ({ ...prev, specialRequest: event.target.value }))
                }
                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all min-h-[120px] resize-y"
                maxLength={500}
              />
              <p className="text-xs text-gray-500">{formData.specialRequest.length}/500 characters</p>
            </div>

            {/* Route summary */}
            {routeInfo && (
              <Card className="p-4 bg-green-50 border-2 border-green-200">
                <h3 className="text-sm font-semibold text-green-800 mb-2">Route summary</h3>
                <p className="text-sm text-green-700">
                  Distance: {routeInfo.distance_km} km · Estimated duration: {formatDuration(routeInfo.duration_minutes)}
                </p>
              </Card>
            )}
            {routeError && (
              <Card className="p-4 bg-red-50 border-2 border-red-200">
                <p className="text-sm text-red-700">{routeError}</p>
              </Card>
            )}

            <div className="flex flex-wrap gap-4">
              <Button
                className="flex-1 min-w-[200px] rounded-full"
                onClick={handleUpdate}
                disabled={!canPublish || submitting}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save changes'}
              </Button>
              <Button asChild variant="outline" className="flex-1 min-w-[200px] rounded-full border-2">
                <Link href={`/rides/${rideId}`}>Cancel</Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

type PreferenceToggleProps = {
  label: string
  icon: React.ReactNode
  value: boolean
  onChange: (value: boolean) => void
}

function PreferenceToggle({ label, icon, value, onChange }: PreferenceToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`rounded-xl border-2 px-4 py-3 flex items-center gap-2 justify-between ${
        value ? 'bg-black text-white border-black' : 'bg-white text-gray-700'
      }`}
    >
      <span className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </span>
      <span className="text-xs font-semibold uppercase">{value ? 'Yes' : 'No'}</span>
    </button>
  )
}

type LocationInputProps = {
  label: string
  value: string
  placeholder: string
  onChange: (value: string) => void
  onFocus: () => void
  suggestions: GeocodeResult[]
  showSuggestions: boolean
  onSelectSuggestion: (suggestion: GeocodeResult) => void
}

const LocationInput = forwardRef<HTMLDivElement, LocationInputProps>(
  ({ label, value, placeholder, onChange, onFocus, suggestions, showSuggestions, onSelectSuggestion }, ref) => (
    <div className="space-y-2 relative" ref={ref}>
      <label className="text-sm font-medium flex items-center gap-2">
        <MapPin className="h-4 w-4" />
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full bg-white border-2 border-black rounded-xl shadow-xl mt-1 max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.display_name}-${index}`}
              className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => onSelectSuggestion(suggestion)}
            >
              <div className="font-medium">{suggestion.display_name.split(',')[0]}</div>
              <div className="text-xs text-gray-500">{suggestion.display_name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
)

LocationInput.displayName = 'LocationInput'
