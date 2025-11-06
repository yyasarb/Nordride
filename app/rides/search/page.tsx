'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Search, MapPin, Clock, Users, ArrowRight, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/stores/auth-store'

interface GeocodeResult {
  display_name: string
  lat: number
  lon: number
}

interface RouteInfo {
  distance_km: number
  duration_minutes: number
}

interface Ride {
  id: string
  driver_id: string
  driver_name: string
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
  created_at: string
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
    if (!user) return rawRides
    return rawRides.filter((ride) => ride.driver_id !== user.id)
  }, [rawRides, user])

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

  useEffect(() => {
    fetchAllRides()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-4">Find a ride</h1>
          <p className="text-xl text-gray-600">
            Track the rides you&apos;re offering and the trips you&apos;re joining
          </p>
        </div>

        <Card className="p-6 mb-8 shadow-lg border-2">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Origin with autocomplete */}
            <div className="space-y-2 relative" ref={originRef}>
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                From
              </label>
              <input
                type="text"
                placeholder="e.g., Stockholm"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                onFocus={() => origin.length >= 2 && setShowOriginSuggestions(true)}
                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
              />
              {showOriginSuggestions && originSuggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-white border-2 border-black rounded-xl shadow-xl mt-1 max-h-60 overflow-auto">
                  {originSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => {
                        setOrigin(simplifiedLabel(suggestion.display_name))
                        setShowOriginSuggestions(false)
                      }}
                    >
                      <div className="font-medium">{suggestion.display_name.split(',')[0]}</div>
                      <div className="text-xs text-gray-500">{suggestion.display_name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Destination with autocomplete */}
            <div className="space-y-2 relative" ref={destRef}>
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                To
              </label>
              <input
                type="text"
                placeholder="e.g., Gothenburg"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onFocus={() => destination.length >= 2 && setShowDestSuggestions(true)}
                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
              />
              {showDestSuggestions && destSuggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-white border-2 border-black rounded-xl shadow-xl mt-1 max-h-60 overflow-auto">
                  {destSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => {
                        setDestination(simplifiedLabel(suggestion.display_name))
                        setShowDestSuggestions(false)
                      }}
                    >
                      <div className="font-medium">{suggestion.display_name.split(',')[0]}</div>
                      <div className="text-xs text-gray-500">{suggestion.display_name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <Button
              className="w-full rounded-full text-lg py-6 text-white"
              size="lg"
              onClick={handleSearch}
              disabled={loading}
            >
              <Search className="mr-2 h-5 w-5" />
              {loading ? 'Searching...' : 'Search rides'}
            </Button>
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
            <h3 className="text-lg font-bold mb-4">Route information</h3>
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
          <h2 className="font-display text-3xl font-bold">Available rides</h2>
          {filteredRides.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-600">No rides available yet. Be the first to offer one!</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredRides.map((ride) => {
                const key = ride.id + (ride.is_return_leg ? '-return' : '')
                return (
                  <Link key={key} href={`/rides/${ride.id}`}>
                    <Card className="p-6 hover:shadow-xl transition-all border-2 hover:border-black cursor-pointer">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 space-y-3">
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
                                <p className="font-semibold">{ride.origin_address}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">To</p>
                                <p className="font-semibold">{ride.destination_address}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Trip info */}
                          <div className="flex flex-wrap items-center gap-4 text-sm">
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
                          <div className="flex items-center gap-1 text-gray-600">
                            <Users className="h-4 w-4" />
                            <span>{ride.seats_available - ride.seats_booked} seats available</span>
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
