'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Search, MapPin, Clock, Users, ArrowRight, DollarSign, CheckCircle, Bell, ChevronDown, Music2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'
import { TierBadge } from '@/components/badges/verification-badges'
import { FriendIconButton } from '@/components/friends/friend-icon-button'

interface GeocodeResult {
  display_name: string
  lat: number
  lon: number
}

interface RouteInfo {
  distance_km: number
  duration_minutes: number
}

interface ProximityResult {
  distanceKm: number
  closestPoint: {
    lat: number
    lon: number
  }
}

interface RouteProximityMatch {
  departureProximity: ProximityResult
  destinationProximity: ProximityResult
  isMatch: boolean
  matchQuality: 'perfect' | 'nearby' | 'none'
}

interface Ride {
  id: string
  driver_id: string
  driver_name: string
  driver_photo?: string | null
  driver_first_name?: string | null
  driver_username?: string | null
  driver_tier?: number
  origin_address: string
  destination_address: string
  departure_time: string
  seats_available: number
  seats_booked: number
  route_km: number
  suggested_total_cost: number
  vehicle_brand?: string
  vehicle_model?: string
  is_round_trip: boolean
  is_return_leg: boolean
  return_departure_time?: string | null
  female_only: boolean
  pets_allowed: boolean
  smoking_allowed: boolean
  luggage_capacity: string[]
  talkativeness?: 'silent' | 'low' | 'medium' | 'high' | null
  eating_allowed?: boolean | null
  payment_method?: 'swish' | 'cash' | 'both' | null
  created_at: string
  proximity?: RouteProximityMatch
}

export default function SearchRidesPage() {
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null)
  const [originResults, setOriginResults] = useState<GeocodeResult[]>([])
  const [destResults, setDestResults] = useState<GeocodeResult[]>([])
  const [originSuggestions, setOriginSuggestions] = useState<GeocodeResult[]>([])
  const [destSuggestions, setDestSuggestions] = useState<GeocodeResult[]>([])
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false)
  const [showDestSuggestions, setShowDestSuggestions] = useState(false)
  const [rawRides, setRawRides] = useState<Ride[]>([])

  // Filter states
  const [filtersExpanded, setFiltersExpanded] = useState(true)
  const [friendsOnlyFilter, setFriendsOnlyFilter] = useState(false)
  const [femaleOnlyFilter, setFemaleOnlyFilter] = useState(false)
  const [petsAllowedFilter, setPetsAllowedFilter] = useState(false)
  const [smokingAllowedFilter, setSmokingAllowedFilter] = useState(false)
  const [luggageFilter, setLuggageFilter] = useState<string | null>(null)
  const [talkativenessFilter, setTalkativenessFilter] = useState<'silent' | 'low' | 'medium' | 'high' | null>(null)
  const [eatingAllowedFilter, setEatingAllowedFilter] = useState(false)
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<'swish' | 'cash' | 'both' | null>(null)
  const [proximityMax, setProximityMax] = useState(20) // Default 20km
  const [departureTimeBuckets, setDepartureTimeBuckets] = useState<string[]>([])
  const [seatsFilter, setSeatsFilter] = useState<number | null>(null)
  const [friendIds, setFriendIds] = useState<string[]>([])

  const originRef = useRef<HTMLDivElement>(null)
  const destRef = useRef<HTMLDivElement>(null)
  const simplifiedLabel = (display: string) => {
    const parts = display.split(',').map(p => p.trim())
    if (parts.length >= 2) {
      // Return "City, Country" format (first and last parts)
      return `${parts[0]}, ${parts[parts.length - 1]}`
    }
    return display
  }
  const user = useAuthStore((state) => state.user)
  const filteredRides = useMemo(() => {
    let rides = rawRides

    // Filter out user's own rides
    if (user) {
      rides = rides.filter((ride) => ride.driver_id !== user.id)
    }

    // Apply friends-only filter
    if (friendsOnlyFilter && friendIds.length > 0) {
      rides = rides.filter((ride) => friendIds.includes(ride.driver_id))
    }

    // Apply female-only filter
    if (femaleOnlyFilter) {
      rides = rides.filter((ride) => ride.female_only === true)
    }

    // Apply pets allowed filter
    if (petsAllowedFilter) {
      rides = rides.filter((ride) => ride.pets_allowed === true)
    }

    // Apply smoking allowed filter
    if (smokingAllowedFilter) {
      rides = rides.filter((ride) => ride.smoking_allowed === true)
    }

    // Apply luggage filter (must have at least the selected size)
    if (luggageFilter) {
      const luggageSizes = ['small', 'carry_on', 'large']
      const requiredIndex = luggageSizes.indexOf(luggageFilter)
      rides = rides.filter((ride) => {
        if (!ride.luggage_capacity || ride.luggage_capacity.length === 0) return false
        // Check if ride has the required size or larger
        return ride.luggage_capacity.some(size => {
          const sizeIndex = luggageSizes.indexOf(size)
          return sizeIndex >= requiredIndex
        })
      })
    }

    // Apply proximity filter (check if proximity data exists and is within range)
    if (proximityMax < 50) { // Only apply if not at max
      rides = rides.filter((ride) => {
        if (!ride.proximity) return true // Include rides without proximity data
        const { departureProximity, destinationProximity } = ride.proximity
        return departureProximity.distanceKm <= proximityMax &&
               destinationProximity.distanceKm <= proximityMax
      })
    }

    // Apply departure time buckets filter
    if (departureTimeBuckets.length > 0) {
      rides = rides.filter((ride) => {
        const departureDate = new Date(ride.departure_time)
        const hours = departureDate.getHours()

        return departureTimeBuckets.some(bucket => {
          if (bucket === 'morning' && hours >= 4 && hours < 12) return true
          if (bucket === 'afternoon' && hours >= 12 && hours < 18) return true
          if (bucket === 'evening' && (hours >= 18 || hours < 4)) return true
          return false
        })
      })
    }

    // Apply talkativeness filter
    if (talkativenessFilter) {
      rides = rides.filter((ride) => ride.talkativeness === talkativenessFilter)
    }

    // Apply eating allowed filter
    if (eatingAllowedFilter) {
      rides = rides.filter((ride) => ride.eating_allowed === true)
    }

    // Apply payment method filter
    if (paymentMethodFilter) {
      rides = rides.filter((ride) => {
        if (!ride.payment_method) return false
        if (paymentMethodFilter === 'both') return ride.payment_method === 'both'
        // If user wants swish or cash, accept 'both' or the specific method
        return ride.payment_method === paymentMethodFilter || ride.payment_method === 'both'
      })
    }

    // Apply seats filter
    if (seatsFilter !== null) {
      rides = rides.filter((ride) => {
        const availableSeats = ride.seats_available - ride.seats_booked
        return availableSeats >= seatsFilter
      })
    }

    return rides
  }, [rawRides, user, friendsOnlyFilter, friendIds, femaleOnlyFilter, petsAllowedFilter, smokingAllowedFilter, luggageFilter, talkativenessFilter, eatingAllowedFilter, paymentMethodFilter, proximityMax, departureTimeBuckets, seatsFilter])

  // Fetch user's friends for friends filter
  useEffect(() => {
    const fetchFriends = async () => {
      if (!user) {
        setFriendIds([])
        return
      }

      try {
        const { data, error } = await supabase
          .from('friendships')
          .select('user_id, friend_id')
          .eq('status', 'accepted')
          .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)

        if (error) throw error

        // Extract friend IDs (the other user in each friendship)
        const ids = data?.map(f =>
          f.user_id === user.id ? f.friend_id : f.user_id
        ) || []

        setFriendIds(ids)
      } catch (error) {
        console.error('Error fetching friends:', error)
        setFriendIds([])
      }
    }

    fetchFriends()
  }, [user])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(event.target as Node)) {
        setShowOriginSuggestions(false)
      }
      if (destRef.current && !destRef.current.contains(event.target as Node)) {
        setShowDestSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Autocomplete for origin
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (origin.length < 2) {
        setOriginSuggestions([])
        return
      }

      try {
        const response = await fetch(`/api/geocoding?address=${encodeURIComponent(origin)}`)
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
  }, [origin])

  // Autocomplete for destination
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (destination.length < 2) {
        setDestSuggestions([])
        return
      }

      try {
        const response = await fetch(`/api/geocoding?address=${encodeURIComponent(destination)}`)
        if (response.ok) {
          const data = await response.json()
          setDestSuggestions(data.slice(0, 5))
          setShowDestSuggestions(true)
        }
      } catch (err) {
        console.error('Autocomplete error:', err)
      }
    }

    const timer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(timer)
  }, [destination])

  const handleSearch = async () => {
    if (!origin || !destination) {
      setError('Please enter both origin and destination')
      return
    }

    setLoading(true)
    setError('')
    setRouteInfo(null)

    try {
      const originResponse = await fetch(`/api/geocoding?address=${encodeURIComponent(origin)}`)
      if (!originResponse.ok) throw new Error('Failed to geocode origin')
      const originData: GeocodeResult[] = await originResponse.json()

      if (originData.length === 0) {
        setError('Could not find origin location')
        setLoading(false)
        return
      }

      const destResponse = await fetch(`/api/geocoding?address=${encodeURIComponent(destination)}`)
      if (!destResponse.ok) throw new Error('Failed to geocode destination')
      const destData: GeocodeResult[] = await destResponse.json()

      if (destData.length === 0) {
        setError('Could not find destination location')
        setLoading(false)
        return
      }

      setOriginResults(originData.slice(0, 1))
      setDestResults(destData.slice(0, 1))

      const routeResponse = await fetch('/api/routing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start: { lat: originData[0].lat, lon: originData[0].lon },
          end: { lat: destData[0].lat, lon: destData[0].lon }
        })
      })

      if (!routeResponse.ok) throw new Error('Failed to calculate route')
      const routeData: RouteInfo = await routeResponse.json()

      setRouteInfo(routeData)

      // Fetch proximity-based rides
      const proximityResponse = await fetch('/api/rides/search-proximity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departure: { lat: originData[0].lat, lon: originData[0].lon },
          destination: { lat: destData[0].lat, lon: destData[0].lon },
          maxDistanceKm: 20
        })
      })

      if (!proximityResponse.ok) throw new Error('Failed to search for rides')
      const proximityRides: Ride[] = await proximityResponse.json()

      setRawRides(proximityRides)
      setLoading(false)
    } catch (err) {
      console.error('Search error:', err)
      setError('Failed to search for rides. Please try again.')
      setLoading(false)
    }
  }

  const fetchAllRides = async () => {
    setLoading(true)
    setRouteInfo(null)
    setError('')

    try {
      const response = await fetch('/api/rides/list')
      if (!response.ok) throw new Error('Failed to fetch rides')
      const data: Ride[] = await response.json()
      // API already returns rides sorted by departure_time (ascending)
      setRawRides(data)
    } catch (err) {
      console.error('Error fetching rides:', err)
      setError('Failed to load rides')
    } finally {
      setLoading(false)
    }
  }

  // Initialize from URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const fromParam = params.get('from')
    const toParam = params.get('to')

    if (fromParam) setOrigin(fromParam)
    if (toParam) setDestination(toParam)

    // If both params exist, we'll trigger search after state updates
    if (fromParam && toParam) {
      // Use a small delay to ensure state is updated
      const timer = setTimeout(async () => {
        // Trigger the search with the params
        try {
          const originResponse = await fetch(`/api/geocoding?address=${encodeURIComponent(fromParam)}`)
          if (!originResponse.ok) return
          const originData: GeocodeResult[] = await originResponse.json()

          if (originData.length === 0) return

          const destResponse = await fetch(`/api/geocoding?address=${encodeURIComponent(toParam)}`)
          if (!destResponse.ok) return
          const destData: GeocodeResult[] = await destResponse.json()

          if (destData.length === 0) return

          setOriginResults(originData.slice(0, 1))
          setDestResults(destData.slice(0, 1))

          const routeResponse = await fetch('/api/routing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              start: { lat: originData[0].lat, lon: originData[0].lon },
              end: { lat: destData[0].lat, lon: destData[0].lon }
            })
          })

          if (routeResponse.ok) {
            const routeData: RouteInfo = await routeResponse.json()
            setRouteInfo(routeData)

            // Fetch proximity-based rides
            const proximityResponse = await fetch('/api/rides/search-proximity', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                departure: { lat: originData[0].lat, lon: originData[0].lon },
                destination: { lat: destData[0].lat, lon: destData[0].lon },
                maxDistanceKm: 20
              })
            })

            if (proximityResponse.ok) {
              const proximityRides: Ride[] = await proximityResponse.json()
              setRawRides(proximityRides)
            }
          }
        } catch (err) {
          console.error('Auto-search error:', err)
        }
      }, 100)
      return () => clearTimeout(timer)
    } else {
      // No params or partial params, show all rides
      fetchAllRides()
    }
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-4 text-gray-900">Find a ride</h1>
          <p className="text-xl text-gray-600">
            Track the rides you&apos;re offering and the trips you&apos;re joining
          </p>
        </div>

        <Card className="p-6 mb-8 shadow-lg border-2 bg-white border-gray-200">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Origin with autocomplete */}
            <div className="space-y-2 relative" ref={originRef}>
              <label className="text-sm font-medium flex items-center gap-2 text-gray-900">
                <MapPin className="h-4 w-4" />
                From
              </label>
              <input
                type="text"
                placeholder="e.g., Stockholm"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                onFocus={() => origin.length >= 2 && setShowOriginSuggestions(true)}
                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all bg-white text-gray-900 border-gray-200 placeholder:text-gray-400"
              />
              {showOriginSuggestions && originSuggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-white border-2 border-black rounded-xl shadow-xl mt-1 max-h-60 overflow-auto">
                  {originSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => {
                        setOrigin(simplifiedLabel(suggestion.display_name))
                        setOriginResults([suggestion])
                        setShowOriginSuggestions(false)
                      }}
                    >
                      <div className="font-medium text-gray-900">{suggestion.display_name.split(',')[0]}</div>
                      <div className="text-xs text-gray-500">{suggestion.display_name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Destination with autocomplete */}
            <div className="space-y-2 relative" ref={destRef}>
              <label className="text-sm font-medium flex items-center gap-2 text-gray-900">
                <MapPin className="h-4 w-4" />
                To
              </label>
              <input
                type="text"
                placeholder="e.g., Gothenburg"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onFocus={() => destination.length >= 2 && setShowDestSuggestions(true)}
                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all bg-white text-gray-900 border-gray-200 placeholder:text-gray-400"
              />
              {showDestSuggestions && destSuggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-white border-2 border-black rounded-xl shadow-xl mt-1 max-h-60 overflow-auto">
                  {destSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => {
                        setDestination(simplifiedLabel(suggestion.display_name))
                        setDestResults([suggestion])
                        setShowDestSuggestions(false)
                      }}
                    >
                      <div className="font-medium text-gray-900">{suggestion.display_name.split(',')[0]}</div>
                      <div className="text-xs text-gray-500">{suggestion.display_name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Filters Section */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setFiltersExpanded(!filtersExpanded)}
                className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Filters
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${filtersExpanded ? 'rotate-180' : ''}`}
                />
              </button>
              {filtersExpanded && (
                <button
                  onClick={() => {
                    setFriendsOnlyFilter(false)
                    setFemaleOnlyFilter(false)
                    setPetsAllowedFilter(false)
                    setSmokingAllowedFilter(false)
                    setLuggageFilter(null)
                    setProximityMax(20)
                    setDepartureTimeBuckets([])
                    setSeatsFilter(null)
                  }}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white underline"
                >
                  Clear all
                </button>
              )}
            </div>

            {filtersExpanded && (
              <div className="space-y-4">
              {/* Friends only */}
              {user && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={friendsOnlyFilter}
                    onChange={(e) => setFriendsOnlyFilter(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    👥 Friends only {friendIds.length > 0 && `(${friendIds.length} friends)`}
                  </span>
                </label>
              )}

              {/* Female-only */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={femaleOnlyFilter}
                  onChange={(e) => setFemaleOnlyFilter(e.target.checked)}
                  className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-pink-600">♀</span> Female-only
                </span>
              </label>

              {/* Pets allowed */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={petsAllowedFilter}
                  onChange={(e) => setPetsAllowedFilter(e.target.checked)}
                  className="w-4 h-4 text-black bg-gray-100 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">🐾 Pets allowed</span>
              </label>

              {/* Smoking allowed */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={smokingAllowedFilter}
                  onChange={(e) => setSmokingAllowedFilter(e.target.checked)}
                  className="w-4 h-4 text-black bg-gray-100 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">🚬 Smoking allowed</span>
              </label>

              {/* Luggage */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  🧳 Minimum luggage size
                </label>
                <div className="flex gap-2">
                  {[
                    { value: null, label: 'Any' },
                    { value: 'small', label: 'Small' },
                    { value: 'carry_on', label: 'Medium' },
                    { value: 'large', label: 'Large' }
                  ].map((option) => (
                    <button
                      key={option.label}
                      onClick={() => setLuggageFilter(option.value)}
                      className={`px-3 py-1.5 text-xs rounded-full border-2 transition-colors ${
                        luggageFilter === option.value
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conversation Level */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  💬 Conversation level
                </label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { value: null, label: 'Any' },
                    { value: 'silent', label: 'Silent' },
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' }
                  ].map((option) => (
                    <button
                      key={option.label}
                      onClick={() => setTalkativenessFilter(option.value as any)}
                      className={`px-3 py-1.5 text-xs rounded-full border-2 transition-colors ${
                        talkativenessFilter === option.value
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Eating allowed */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={eatingAllowedFilter}
                  onChange={(e) => setEatingAllowedFilter(e.target.checked)}
                  className="w-4 h-4 text-black bg-gray-100 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">🍔 Eating allowed</span>
              </label>

              {/* Payment Method */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  💳 Payment method
                </label>
                <div className="flex gap-2">
                  {[
                    { value: null, label: 'Any' },
                    { value: 'swish', label: 'Swish' },
                    { value: 'cash', label: 'Cash' },
                    { value: 'both', label: 'Both' }
                  ].map((option) => (
                    <button
                      key={option.label}
                      onClick={() => setPaymentMethodFilter(option.value as any)}
                      className={`px-3 py-1.5 text-xs rounded-full border-2 transition-colors ${
                        paymentMethodFilter === option.value
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Proximity slider */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  📍 Max distance from route: <span className="font-bold text-gray-900">{proximityMax} km</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={proximityMax}
                  onChange={(e) => setProximityMax(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 km</span>
                  <span>50 km</span>
                </div>
              </div>

              {/* Departure time */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  ⏰ Departure time
                </label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { value: 'morning', label: 'Morning (4AM-12PM)' },
                    { value: 'afternoon', label: 'Afternoon (12PM-6PM)' },
                    { value: 'evening', label: 'Evening (6PM-4AM)' }
                  ].map((bucket) => (
                    <button
                      key={bucket.value}
                      onClick={() => {
                        setDepartureTimeBuckets(prev =>
                          prev.includes(bucket.value)
                            ? prev.filter(b => b !== bucket.value)
                            : [...prev, bucket.value]
                        )
                      }}
                      className={`px-3 py-1.5 text-xs rounded-full border-2 transition-colors ${
                        departureTimeBuckets.includes(bucket.value)
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {bucket.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seats */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  💺 Minimum seats
                </label>
                <div className="flex gap-2">
                  {[
                    { value: null, label: 'Any' },
                    { value: 1, label: '1' },
                    { value: 2, label: '2' },
                    { value: 3, label: '3+' }
                  ].map((option) => (
                    <button
                      key={option.label}
                      onClick={() => setSeatsFilter(option.value)}
                      className={`px-4 py-2 text-sm rounded-full border-2 transition-colors ${
                        seatsFilter === option.value
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              </div>
            )}
          </div>

          <div className="mt-6 space-y-3">
            <Button
              className="w-full rounded-full text-lg py-6 text-white"
              size="lg"
              onClick={handleSearch}
              disabled={loading}
            >
              <Search className="mr-2 h-5 w-5" />
              {loading ? 'Searching...' : 'Search rides'}
            </Button>

            {/* Create Alert Button - shown when both fields are filled */}
            {origin && destination && originResults.length > 0 && destResults.length > 0 && user && (
              <Button
                variant="outline"
                className="w-full rounded-full text-lg py-6 border-2"
                size="lg"
                onClick={async () => {
                  try {
                    const { data: session } = await supabase.auth.getSession()
                    const token = session?.session?.access_token

                    // Create alert with pre-filled data
                    const response = await fetch('/api/alerts', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        departure_address: origin,
                        departure_lat: originResults[0].lat,
                        departure_lon: originResults[0].lon,
                        destination_address: destination,
                        destination_lat: destResults[0].lat,
                        destination_lon: destResults[0].lon,
                        proximity_km: proximityMax,
                      }),
                    })

                    if (response.ok) {
                      alert('Alert created! You will be notified when rides match this route.')
                    } else {
                      const error = await response.json()
                      alert(error.error || 'Failed to create alert')
                    }
                  } catch (error) {
                    console.error('Create alert error:', error)
                    alert('Failed to create alert')
                  }
                }}
              >
                <Bell className="mr-2 h-5 w-5" />
                Create Alert for This Route
              </Button>
            )}
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700">
              {error}
            </div>
          )}
        </Card>

        {/* Route Info */}
        {routeInfo && (
          <Card className="p-6 mb-8 bg-green-50 border-2 border-green-200">
            <h3 className="text-lg font-bold mb-4 text-gray-900">Route information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-green-700" />
                <div>
                  <p className="text-sm text-green-600">Distance</p>
                  <p className="font-bold text-green-900">{routeInfo.distance_km} km</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-green-700" />
                <div>
                  <p className="text-sm text-green-600">Duration</p>
                  <p className="font-bold text-green-900">
                    {Math.floor(routeInfo.duration_minutes / 60)}h {routeInfo.duration_minutes % 60}m
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* All Rides List */}
        <div className="space-y-4">
          <h2 className="font-display text-3xl font-bold text-gray-900">
            Available rides {filteredRides.length > 0 && `(${filteredRides.length})`}
          </h2>
          {filteredRides.length === 0 ? (
            <Card className="p-8 text-center bg-white border-gray-200">
              <div className="max-w-md mx-auto">
                <p className="text-xl font-semibold text-gray-900 mb-2">No rides found</p>
                <p className="text-gray-600 mb-4">
                  {rawRides.length > 0
                    ? "Try adjusting your filters to see more rides."
                    : "No rides available yet. Be the first to offer one!"}
                </p>
                {rawRides.length > 0 && (
                  <button
                    onClick={() => {
                      setFemaleOnlyFilter(false)
                      setPetsAllowedFilter(false)
                      setSmokingAllowedFilter(false)
                      setLuggageFilter(null)
                      setProximityMax(20)
                      setDepartureTimeBuckets([])
                      setSeatsFilter(null)
                    }}
                    className="mt-2 px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredRides.map((ride) => {
                const key = ride.id + (ride.is_return_leg ? '-return' : '')
                // Build URL with proximity data if available
                const rideUrl = ride.proximity
                  ? `/rides/${ride.id}?departureDistance=${ride.proximity.departureProximity.distanceKm.toFixed(1)}&destinationDistance=${ride.proximity.destinationProximity.distanceKm.toFixed(1)}&matchQuality=${ride.proximity.matchQuality}`
                  : `/rides/${ride.id}`

                return (
                  <Link key={key} href={rideUrl}>
                    <Card className="p-6 hover:shadow-xl transition-all border-2 hover:border-black cursor-pointer bg-white border-gray-200 relative">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 space-y-3">
                        {/* Driver info */}
                        <div className="flex items-center gap-2 mb-2">
                          {ride.driver_photo ? (
                            <Image
                              src={ride.driver_photo}
                              alt={ride.driver_first_name || ride.driver_name}
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded-full object-cover"
                              sizes="32px"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-xs font-semibold text-gray-600">
                                {ride.driver_first_name?.[0] || ride.driver_name?.[0] || '?'}
                              </span>
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-600">
                              {user ? ride.driver_name : (ride.driver_first_name || 'Driver')}
                            </span>
                            {ride.driver_username && (
                              <span className="text-xs text-gray-400">@{ride.driver_username}</span>
                            )}
                          </div>
                          {ride.driver_tier && ride.driver_tier >= 2 && (
                            <TierBadge tier={ride.driver_tier} size="sm" showTooltip />
                          )}
                        </div>

                        {/* Route */}
                        <div className="space-y-2">
                          <div className="flex items-start gap-3">
                            <div className="flex flex-col items-center gap-1 mt-1">
                              <div className="w-2 h-2 rounded-full bg-black"></div>
                              <div className="w-0.5 h-6 bg-gray-300"></div>
                              <MapPin className="w-4 h-4 text-black" />
                            </div>
                            <div className="flex-1">
                              <div className="mb-2">
                                <p className="text-xs text-gray-500">From</p>
                                <p className="font-semibold text-gray-900">{ride.origin_address}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">To</p>
                                <p className="font-semibold text-gray-900">{ride.destination_address}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Trip info */}
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                          {/* Proximity badge (if search was performed) */}
                          {ride.proximity && (
                            <div className="flex items-center gap-1">
                              {ride.proximity.matchQuality === 'perfect' ? (
                                <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                  <CheckCircle className="h-3 w-3" />
                                  <span className="text-xs font-medium">Perfect route match</span>
                                </div>
                              ) : ride.proximity.matchQuality === 'nearby' ? (
                                <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                  <MapPin className="h-3 w-3" />
                                  <span className="text-xs font-medium">Nearby route (within 20 km)</span>
                                </div>
                              ) : null}
                            </div>
                          )}

                          {/* Trip type */}
                          <div className="flex items-center gap-1">
                            {ride.is_return_leg ? (
                              <div className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                <ArrowRight className="h-3 w-3 transform rotate-180" />
                                <span className="text-xs font-medium">Second Leg</span>
                              </div>
                            ) : ride.is_round_trip ? (
                              <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                <ArrowRight className="h-3 w-3" />
                                <span className="text-xs font-medium">First Leg</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                <ArrowRight className="h-3 w-3" />
                                <span className="text-xs font-medium">One-Way</span>
                              </div>
                            )}
                          </div>

                          {/* Female-only badge */}
                          {ride.female_only && (
                            <div className="flex items-center gap-1 bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
                              <span className="text-xs font-medium">♀ Female-only</span>
                            </div>
                          )}

                          {/* Spotify Playlist badge - shows for all rides */}
                          <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-200">
                            <Music2 className="h-3 w-3" />
                            <span className="text-xs font-medium">Playlist for this trip</span>
                          </div>

                          {/* Departure date */}
                          <div className="flex items-center gap-1 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>
                              {new Date(ride.departure_time).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}{' '}
                              at{' '}
                              {new Date(ride.departure_time).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>

                          {/* Available seats */}
                          <div className="flex items-center gap-1">
                            {ride.seats_available - ride.seats_booked === 0 ? (
                              <div className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                <Users className="h-3 w-3" />
                                <span className="text-xs font-medium">This ride is full</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-gray-600">
                                <Users className="h-4 w-4" />
                                <span>{ride.seats_available - ride.seats_booked} seats available</span>
                              </div>
                            )}
                          </div>

                          {/* Price */}
                          <div className="flex items-center gap-1 font-semibold text-green-700">
                            <DollarSign className="h-4 w-4" />
                            <span>{ride.suggested_total_cost} SEK</span>
                          </div>
                        </div>
                      </div>

                      {/* Arrow indicator */}
                      <div className="flex items-center">
                        <ArrowRight className="h-6 w-6 text-gray-400" />
                      </div>
                    </div>

                    {/* Friend icon button - positioned at bottom-right */}
                    {user && ride.driver_id !== user.id && (
                      <div className="absolute bottom-4 right-4">
                        <FriendIconButton
                          userId={ride.driver_id}
                          userName={user ? ride.driver_name : (ride.driver_first_name || 'Driver')}
                        />
                      </div>
                    )}
                  </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
