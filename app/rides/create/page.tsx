'use client'

import { useState, useEffect, useMemo, useRef, forwardRef, type ChangeEvent, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MapPin, Calendar, Users, DollarSign, AlertCircle, CheckCircle, Car, Clock, PawPrint, Cigarette, Backpack } from 'lucide-react'
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

// Calculate maximum allowed cost: (distance/100) * 16 * 10
const calculateMaxCost = (distanceKm: number) => Math.ceil((distanceKm / 100) * 16 * 10)

// Calculate suggested cost: 80% of max
const calculateSuggestedCost = (distanceKm: number) => {
  const maxCost = calculateMaxCost(distanceKm)
  const suggested = Math.ceil(maxCost * 0.8)
  return Math.max(PRICE_STEP, Math.ceil(suggested / PRICE_STEP) * PRICE_STEP)
}

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
  polyline: string
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

export default function CreateRidePage() {
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
  const [routeCalculating, setRouteCalculating] = useState(false)
  const [routeError, setRouteError] = useState('')
  const [suggestedCost, setSuggestedCost] = useState<number | null>(null)
  const [maxCost, setMaxCost] = useState<number | null>(null)
  const [priceManuallyEdited, setPriceManuallyEdited] = useState(false)

  const [showVehicleForm, setShowVehicleForm] = useState(false)
  const [vehicleForm, setVehicleForm] = useState({ brand: '', model: '', color: '', plateNumber: '' })
  const [vehicleError, setVehicleError] = useState('')
  const [addingVehicle, setAddingVehicle] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user ?? null)

      if (!data.user) {
        setRequirements({
          emailVerified: false,
          hasVehicle: false,
          hasProfilePicture: false,
          hasBio: false,
          hasLanguages: false,
          hasInterests: false,
          profileCompleted: false
        })
        setCheckingRequirements(false)
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

        if (!profile?.email_verified) {
          try {
            await supabase
              .from('users')
              .update({ email_verified: true })
              .eq('id', data.user.id)
          } catch (error) {
            console.warn('Failed to auto-set email verification:', error)
          }
        }

        const fetchedVehicles = vehiclesData ? [...vehiclesData] : []
        setVehicles(fetchedVehicles)
        setFormData((prev) => ({
          ...prev,
          vehicleId: prev.vehicleId || (fetchedVehicles[0]?.id ?? ''),
        }))

        const hasPhoto = !!(profile?.photo_url || profile?.profile_picture_url)
        const hasBio = !!(profile?.bio && profile.bio.trim() !== '')
        const hasLangs = !!(profile?.languages && profile.languages.length > 0)
        const hasInterests = !!(profile?.interests && profile.interests.length > 0)
        // Tier 3 requirements: photo + bio + language (interests are optional)
        const profileReady = hasPhoto && hasBio && hasLangs

        setRequirements({
          emailVerified: true,
          hasVehicle: fetchedVehicles.length > 0,
          hasProfilePicture: hasPhoto,
          hasBio: hasBio,
          hasLanguages: hasLangs,
          hasInterests: hasInterests,
          profileCompleted: profileReady
        })
      } catch (error) {
        console.error('Failed to load requirements:', error)
      } finally {
        setCheckingRequirements(false)
      }
    }

    init()
  }, [])

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
      if (formData.origin.trim().length < 2) {
        setOriginSuggestions([])
        return
      }

      try {
        const response = await fetch(`/api/geocoding?address=${encodeURIComponent(formData.origin)}`)
        if (!response.ok) return
        const results: GeocodeResult[] = await response.json()
        setOriginSuggestions(results.slice(0, 5))
        setShowOriginSuggestions(true)
      } catch (error) {
        console.error('Origin autocomplete failed:', error)
      }
    }

    const debounce = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounce)
  }, [formData.origin])

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (formData.destination.trim().length < 2) {
        setDestinationSuggestions([])
        return
      }

      try {
        const response = await fetch(`/api/geocoding?address=${encodeURIComponent(formData.destination)}`)
        if (!response.ok) return
        const results: GeocodeResult[] = await response.json()
        setDestinationSuggestions(results.slice(0, 5))
        setShowDestinationSuggestions(true)
      } catch (error) {
        console.error('Destination autocomplete failed:', error)
      }
    }

    const debounce = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounce)
  }, [formData.destination])

  useEffect(() => {
    if (!originLocation || !destinationLocation) {
      setRouteInfo(null)
      setRouteError('')
      setSuggestedCost(null)
      return
    }

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
            end: { lat: destinationLocation.lat, lon: destinationLocation.lon },
          }),
        })

        if (!response.ok) {
          throw new Error('Routing API error')
        }

        const data: RouteInfo = await response.json()
        if (cancelled) return

        setRouteInfo(data)
        const max = calculateMaxCost(data.distance_km)
        const suggested = calculateSuggestedCost(data.distance_km)
        setMaxCost(max)
        setSuggestedCost(suggested)

        if (!priceManuallyEdited) {
          setFormData((prev) => ({ ...prev, price: suggested.toString() }))
        }
      } catch (error) {
        if (cancelled) return
        console.error('Failed to calculate route:', error)
        setRouteInfo(null)
        setSuggestedCost(null)
        setRouteError('Unable to calculate the route right now. Please refine the addresses and try again.')
      } finally {
        if (!cancelled) {
          setRouteCalculating(false)
        }
      }
    }

    calculateRoute()

    return () => {
      cancelled = true
    }
  }, [originLocation, destinationLocation, priceManuallyEdited])

  const timeOptions = useMemo(() => TIME_OPTIONS, [])

  const profileReady = useMemo(
    () =>
      requirements.hasProfilePicture &&
      requirements.hasBio &&
      requirements.hasLanguages,
    [
      requirements.hasProfilePicture,
      requirements.hasBio,
      requirements.hasLanguages,
    ]
  )

  const missingProfileItems = useMemo(() => {
    const missing: string[] = []
    if (!requirements.hasProfilePicture) missing.push('Profile picture')
    if (!requirements.hasBio) missing.push('Bio (minimum 50 characters)')
    if (!requirements.hasLanguages) missing.push('At least one language')
    return missing
  }, [
    requirements.hasProfilePicture,
    requirements.hasBio,
    requirements.hasLanguages,
  ])

  const shouldShowRequirements = !checkingRequirements && (!profileReady || !requirements.hasVehicle)

  const canPublish = useMemo(() => {
    if (!user || checkingRequirements) return false
    if (!profileReady || !requirements.hasVehicle) return false
    if (!formData.origin || !formData.destination || !formData.date || !formData.time || !formData.vehicleId) return false
    if (Number(formData.price) <= 0) return false
    if (!routeInfo) return false
    if (formData.isRoundTrip && (!formData.returnDate || !formData.returnTime)) return false
    return true
  }, [user, checkingRequirements, profileReady, requirements.hasVehicle, formData, routeInfo])

  const simplifiedLabel = (displayName: string) => {
    const parts = displayName.split(',').map(p => p.trim())
    if (parts.length >= 2) {
      // Return "City, Country" format (first and last parts)
      return `${parts[0]}, ${parts[parts.length - 1]}`
    }
    return displayName
  }

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

      const refreshed = inserted as VehicleOption[]
      setVehicles((prev) => [...prev, ...refreshed])
      setFormData((prev) => ({
        ...prev,
        vehicleId: prev.vehicleId || refreshed[0]?.id || prev.vehicleId,
      }))
      setRequirements((prev) => ({ ...prev, hasVehicle: true }))
      resetVehicleForm()
      setShowVehicleForm(false)
      setFeedback({ type: 'success', message: 'Vehicle added successfully.' })
    } catch (error) {
      console.error('Failed to add vehicle:', error)
      setVehicleError('Could not add vehicle. Please double-check the details and try again.')
    } finally {
      setAddingVehicle(false)
    }
  }

  const handlePublish = async () => {
    if (!user || !canPublish) return

    setSubmitting(true)
    setFeedback(null)

    try {
      if (!originLocation || !destinationLocation) {
        throw new Error('Please select both departure and arrival locations from the suggestions.')
      }

      let currentRoute = routeInfo
      if (!currentRoute) {
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
    }

      if (!currentRoute) {
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

      // Validate cost against maximum allowed
      const calculatedMaxCost = calculateMaxCost(currentRoute.distance_km)
      const requestedCost = Number(formData.price)
      if (requestedCost > calculatedMaxCost) {
        throw new Error(`Cost cannot exceed ${calculatedMaxCost} SEK. We don't allow drivers to profit from rides.`)
      }

      const { data: insertedRide, error: insertError } = await supabase.from('rides').insert({
        driver_id: user.id,
        vehicle_id: formData.vehicleId,
        origin_address: formData.origin,
        origin_coords: `POINT(${originLocation.lon} ${originLocation.lat})`,
        destination_address: formData.destination,
        destination_coords: `POINT(${destinationLocation.lon} ${destinationLocation.lat})`,
        route_polyline: currentRoute.polyline,
        route_km: Number(currentRoute.distance_km),
        departure_time: departure.toISOString(),
        seats_available: formData.seats,
        seats_booked: 0,
        suggested_total_cost: Number(formData.price),
        status: 'published',
        is_round_trip: formData.isRoundTrip,
        return_departure_time: formData.isRoundTrip && returnDeparture ? returnDeparture.toISOString() : null,
        return_suggested_total_cost: formData.isRoundTrip && suggestedCost ? suggestedCost : null,
        route_description: formData.specialRequest.trim() || null,
        pets_allowed: formData.petsAllowed,
        smoking_allowed: formData.smokingAllowed,
        luggage_capacity: formData.luggageOptions.length > 0 ? formData.luggageOptions : null,
      }).select('id').single()

      if (insertError) throw insertError

      setFeedback({ type: 'success', message: 'Ride published successfully. Redirecting...' })

      // Redirect to the ride detail page after 1 second
      setTimeout(() => {
        if (insertedRide?.id) {
          window.location.href = `/rides/${insertedRide.id}`
        }
      }, 1000)
    } catch (error: any) {
      console.error('Publish ride error:', error)
      setFeedback({
        type: 'error',
        message: error?.message || 'Could not publish the ride. Please try again.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Offer a Ride</h1>

        <Card className="p-6 bg-white border-gray-200">
          <div className="space-y-6">
            {shouldShowRequirements && (
              <>
                <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                  <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Complete Your Profile to Offer Rides
                  </h3>
                  {missingProfileItems.length > 0 && (
                    <div className="mb-4 space-y-2">
                      <p className="text-sm font-medium text-amber-900">
                        You still need to complete:
                      </p>
                      <ul className="space-y-1">
                        {missingProfileItems.map((item) => (
                          <li key={item} className="flex items-center gap-2 text-sm text-amber-800">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="grid gap-3 md:grid-cols-2">
                    <RequirementBadge
                      label="Profile picture"
                      satisfied={requirements.hasProfilePicture}
                      checking={checkingRequirements}
                    />
                    <RequirementBadge
                      label="Bio"
                      satisfied={requirements.hasBio}
                      checking={checkingRequirements}
                    />
                    <RequirementBadge
                      label="Languages"
                      satisfied={requirements.hasLanguages}
                      checking={checkingRequirements}
                    />
                    <RequirementBadge
                      label="Vehicle"
                      satisfied={requirements.hasVehicle}
                      checking={checkingRequirements}
                    />
                  </div>
                  {requirements.hasInterests && (
                    <p className="text-xs text-green-600 mt-2">
                      ✓ Bonus: Interests added (helps other users connect with you)
                    </p>
                  )}
                  {!requirements.hasVehicle && (
                    <p className="text-sm text-amber-700 mt-3">
                      Add a vehicle to your profile before publishing a ride.
                    </p>
                  )}
                  <p className="text-sm text-amber-700 mt-4">
                    Please visit your <Link href="/profile" className="underline font-medium">profile page</Link> to complete these requirements.
                  </p>
                </div>
              </>
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

            {requirements.hasVehicle && (
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-gray-900">
                  <Car className="h-4 w-4" />
                  Choose Vehicle
                </label>
                <select
                  value={formData.vehicleId}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, vehicleId: event.target.value }))
                  }
                  className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all bg-white text-gray-900 border-gray-200"
                >
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.brand} {vehicle.model ?? ''} • {vehicle.color ?? 'Color TBD'} • {vehicle.plate_number ?? 'Plate TBD'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Button
              variant="outline"
              className="rounded-full border-2"
              type="button"
              onClick={() => {
                resetVehicleForm()
                setShowVehicleForm((prev) => !prev)
              }}
            >
              {showVehicleForm ? 'Cancel vehicle form' : 'Add a vehicle'}
            </Button>

            {showVehicleForm && (
              <form className="grid gap-4" onSubmit={handleVehicleSubmit}>
                <div className="grid gap-1">
                  <label className="text-sm font-medium text-gray-900">Brand</label>
                  <input
                    type="text"
                    value={vehicleForm.brand}
                    onChange={(event) =>
                      setVehicleForm((prev) => ({ ...prev, brand: event.target.value }))
                    }
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    required
                    disabled={addingVehicle}
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-sm font-medium text-gray-900">Model</label>
                  <input
                    type="text"
                    value={vehicleForm.model}
                    onChange={(event) =>
                      setVehicleForm((prev) => ({ ...prev, model: event.target.value }))
                    }
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    disabled={addingVehicle}
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-sm font-medium text-gray-900">Color</label>
                  <input
                    type="text"
                    value={vehicleForm.color}
                    onChange={(event) =>
                      setVehicleForm((prev) => ({ ...prev, color: event.target.value }))
                    }
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    disabled={addingVehicle}
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-sm font-medium text-gray-900">Plate number</label>
                  <input
                    type="text"
                    value={vehicleForm.plateNumber}
                    onChange={(event) =>
                      setVehicleForm((prev) => ({ ...prev, plateNumber: event.target.value }))
                    }
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    required
                    disabled={addingVehicle}
                    autoCapitalize="characters"
                  />
                </div>
                {vehicleError && <p className="text-sm text-red-600">{vehicleError}</p>}
                <div className="flex gap-2">
                  <Button type="submit" disabled={addingVehicle}>
                    {addingVehicle ? 'Saving...' : 'Save vehicle'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetVehicleForm()
                      setShowVehicleForm(false)
                    }}
                    disabled={addingVehicle}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            <LocationInput
              ref={originRef}
              label="Departure Location"
              value={formData.origin}
              placeholder="e.g., Stockholm Central Station"
              suggestions={originSuggestions}
              showSuggestions={showOriginSuggestions}
              onFocus={() => formData.origin.trim().length >= 2 && setShowOriginSuggestions(true)}
              onChange={(value) => {
                setFormData((prev) => ({ ...prev, origin: value }))
                setOriginLocation(null)
                setRouteInfo(null)
                setSuggestedCost(null)
                setRouteError('')
                setPriceManuallyEdited(false)
              }}
              onSelectSuggestion={(suggestion) => {
                setFormData((prev) => ({ ...prev, origin: simplifiedLabel(suggestion.display_name) }))
                setOriginLocation(suggestion)
                setShowOriginSuggestions(false)
                setPriceManuallyEdited(false)
              }}
            />

            <LocationInput
              ref={destinationRef}
              label="Arrival Location"
              value={formData.destination}
              placeholder="e.g., Gothenburg Central"
              suggestions={destinationSuggestions}
              showSuggestions={showDestinationSuggestions}
              onFocus={() => formData.destination.trim().length >= 2 && setShowDestinationSuggestions(true)}
              onChange={(value) => {
                setFormData((prev) => ({ ...prev, destination: value }))
                setDestinationLocation(null)
                setRouteInfo(null)
                setSuggestedCost(null)
                setRouteError('')
                setPriceManuallyEdited(false)
              }}
              onSelectSuggestion={(suggestion) => {
                setFormData((prev) => ({ ...prev, destination: simplifiedLabel(suggestion.display_name) }))
                setDestinationLocation(suggestion)
                setShowDestinationSuggestions(false)
                setPriceManuallyEdited(false)
              }}
            />

            {routeCalculating && (
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <Clock className="h-4 w-4" /> Calculating route…
              </p>
            )}

            {routeInfo && (
              <div className="grid gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 md:grid-cols-2">
                <div className="flex items-center gap-3 text-emerald-800">
                  <MapPin className="h-5 w-5" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-emerald-600">Distance</p>
                    <p className="font-semibold text-lg">{routeInfo.distance_km.toFixed(1)} km</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-emerald-800">
                  <Clock className="h-5 w-5" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-emerald-600">Estimated time</p>
                    <p className="font-semibold text-lg">{formatDuration(routeInfo.duration_minutes)}</p>
                  </div>
                </div>
              </div>
            )}

            {routeError && <p className="text-sm text-red-600">{routeError}</p>}

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant={formData.isRoundTrip ? 'outline' : 'default'}
                className="rounded-full"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    isRoundTrip: false,
                    returnDate: '',
                    returnTime: '17:00',
                  }))
                }
              >
                One-way
              </Button>
              <Button
                type="button"
                variant={formData.isRoundTrip ? 'default' : 'outline'}
                className="rounded-full"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    isRoundTrip: true,
                  }))
                }
              >
                Round trip
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-gray-900">
                  <Calendar className="h-4 w-4" />
                  Departure date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev) => ({ ...prev, date: event.target.value }))
                  }
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Departure time</label>
                <select
                  value={formData.time}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, time: event.target.value }))
                  }
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {timeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formData.isRoundTrip && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2 text-gray-900">
                    <Calendar className="h-4 w-4" />
                    Return date
                  </label>
                  <input
                    type="date"
                    value={formData.returnDate}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev) => ({ ...prev, returnDate: event.target.value }))
                    }
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">Return time</label>
                  <select
                    value={formData.returnTime}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, returnTime: event.target.value }))
                    }
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {timeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-gray-900">
                <Users className="h-4 w-4" />
                Available seats
              </label>
              <select
                value={formData.seats}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, seats: parseInt(event.target.value, 10) }))
                }
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((seat) => (
                  <option key={seat} value={seat}>
                    {seat} seat{seat > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-gray-900">
                <DollarSign className="h-4 w-4" />
                Total Cost (SEK) per trip
              </label>
              <input
                type="number"
                min={0}
                max={maxCost || undefined}
                step={PRICE_STEP}
                value={formData.price}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  const value = event.target.value
                  const numValue = Number(value)
                  if (maxCost && numValue > maxCost) {
                    setFormData((prev) => ({ ...prev, price: maxCost.toString() }))
                  } else {
                    setFormData((prev) => ({ ...prev, price: value }))
                  }
                  setPriceManuallyEdited(true)
                }}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                  maxCost && Number(formData.price) > maxCost ? 'border-red-500' : ''
                }`}
              />
              {suggestedCost && maxCost && (
                <p className="text-xs text-muted-foreground">
                  Suggested: {suggestedCost} SEK (80% of max). Maximum allowed: {maxCost} SEK based on distance. We don&apos;t allow drivers to profit from rides.
                </p>
              )}
              {/* Cost-Sharing Reminder */}
              <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <p className="text-xs text-blue-900 font-semibold mb-1">
                  ℹ️ Cost-Sharing Only
                </p>
                <p className="text-xs text-blue-800">
                  Nordride is for sharing travel costs, not making profit. Only charge what covers fuel and tolls. Riders split the total cost with you.
                </p>
              </div>
            </div>

            {/* Trip Preferences */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-xl border-2">
              <h3 className="font-semibold text-sm">Trip Preferences</h3>

              {/* Pets Allowed */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2 text-gray-900">
                  <PawPrint className="h-4 w-4" />
                  Pets allowed
                </label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={formData.petsAllowed ? 'default' : 'outline'}
                    className="rounded-full"
                    onClick={() => setFormData((prev) => ({ ...prev, petsAllowed: true }))}
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={!formData.petsAllowed ? 'default' : 'outline'}
                    className="rounded-full"
                    onClick={() => setFormData((prev) => ({ ...prev, petsAllowed: false }))}
                  >
                    No
                  </Button>
                </div>
              </div>

              {/* Smoking Allowed */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2 text-gray-900">
                  <Cigarette className="h-4 w-4" />
                  Smoking allowed
                </label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={formData.smokingAllowed ? 'default' : 'outline'}
                    className="rounded-full"
                    onClick={() => setFormData((prev) => ({ ...prev, smokingAllowed: true }))}
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={!formData.smokingAllowed ? 'default' : 'outline'}
                    className="rounded-full"
                    onClick={() => setFormData((prev) => ({ ...prev, smokingAllowed: false }))}
                  >
                    No
                  </Button>
                </div>
              </div>

              {/* Luggage Options */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-gray-900">
                  <Backpack className="h-4 w-4" />
                  Luggage options
                </label>
                <div className="flex flex-wrap gap-2">
                  {['small', 'carry_on', 'large'].map((size) => (
                    <Button
                      key={size}
                      type="button"
                      size="sm"
                      variant={formData.luggageOptions.includes(size) ? 'default' : 'outline'}
                      className="rounded-full"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          luggageOptions: prev.luggageOptions.includes(size)
                            ? prev.luggageOptions.filter((s) => s !== size)
                            : [...prev.luggageOptions, size]
                        }))
                      }}
                    >
                      {size === 'carry_on' ? 'Carry-on' : size.charAt(0).toUpperCase() + size.slice(1)}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Select all luggage sizes you can accommodate
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-gray-900">
                <AlertCircle className="h-4 w-4" />
                Special Request (Optional)
              </label>
              <textarea
                placeholder="Add any special conditions or notes for riders (e.g., meeting point details, specific rules, etc.)"
                value={formData.specialRequest}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData((prev) => ({ ...prev, specialRequest: event.target.value }))
                }
                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all min-h-[100px] resize-y bg-white text-gray-900 border-gray-200 placeholder:text-gray-400"
                maxLength={500}
              />
              <p className="text-xs text-gray-500">
                {formData.specialRequest.length}/500 characters
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                className="flex-1"
                size="lg"
                onClick={handlePublish}
                disabled={!canPublish || submitting}
              >
                {submitting ? 'Publishing...' : 'Publish Ride'}
              </Button>
              <Button variant="outline" size="lg" asChild disabled={submitting}>
                <Link href="/">Cancel</Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

type RequirementBadgeProps = {
  label: string
  satisfied: boolean
  checking: boolean
}

function RequirementBadge({ label, satisfied, checking }: RequirementBadgeProps) {
  const statusText = checking
    ? 'Checking...'
    : satisfied
      ? `${label} ready`
      : `Add ${label.toLowerCase()}`

  return (
    <div
      className={`flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-sm ${
        satisfied
          ? 'bg-green-50 border-green-200 text-green-700'
          : 'bg-amber-50 border-amber-200 text-amber-700'
      }`}
    >
      {satisfied ? (
        <CheckCircle className="h-4 w-4 flex-shrink-0" />
      ) : (
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
      )}
      <span>{statusText}</span>
    </div>
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
  ({ label, value, placeholder, onChange, onFocus, suggestions, showSuggestions, onSelectSuggestion }, ref) => {
    return (
      <div className="space-y-2 relative" ref={ref}>
        <label className="text-sm font-medium flex items-center gap-2 text-gray-900">
          <MapPin className="h-4 w-4" />
          {label}
        </label>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={onFocus}
          className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all bg-white text-gray-900 border-gray-200 placeholder:text-gray-400"
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-20 w-full bg-white border-2 border-black rounded-xl shadow-xl mt-1 max-h-60 overflow-auto">
            {suggestions.map((suggestion, index) => (
              <button
                type="button"
                key={`${suggestion.display_name}-${index}`}
                className="w-full px-4 py-3 text-left hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => onSelectSuggestion(suggestion)}
              >
                <div className="font-medium text-gray-900">{suggestion.display_name.split(',')[0]}</div>
                <div className="text-xs text-gray-500">{suggestion.display_name}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }
)

LocationInput.displayName = 'LocationInput'
