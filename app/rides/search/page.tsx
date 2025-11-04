'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Search, MapPin, Clock, Users, Car } from 'lucide-react'
import { LogoLink } from '@/components/layout/logo-link'

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
  const [allRides, setAllRides] = useState<Ride[]>([])
  const [showAllRides, setShowAllRides] = useState(false)

  const originRef = useRef<HTMLDivElement>(null)
  const destRef = useRef<HTMLDivElement>(null)
  const simplifiedLabel = (display: string) => display.split(',')[0]?.trim() ?? display

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
    setShowAllRides(false)

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
    setShowAllRides(true)
    setRouteInfo(null)
    setError('')

    try {
      const response = await fetch('/api/rides/list')
      if (!response.ok) throw new Error('Failed to fetch rides')
      const data = await response.json()
      setAllRides(data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching rides:', err)
      setError('Failed to load rides')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b bg-white">
        <div className="container mx-auto px-6 py-4">
          <LogoLink />
        </div>
      </div>
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <h1 className="font-display text-5xl font-bold mb-8">Find a ride</h1>

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

          <div className="flex gap-4 mt-6">
            <Button
              className="flex-1 rounded-full text-lg py-6"
              size="lg"
              onClick={handleSearch}
              disabled={loading}
            >
              <Search className="mr-2 h-5 w-5" />
              {loading ? 'Searching...' : 'Search rides'}
            </Button>
            <Button
              variant="outline"
              className="flex-1 rounded-full text-lg py-6 border-2"
              size="lg"
              onClick={fetchAllRides}
              disabled={loading}
            >
              <Car className="mr-2 h-5 w-5" />
              Show all rides
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
        {showAllRides && (
          <div className="space-y-4">
            <h2 className="font-display text-3xl font-bold">Available rides</h2>
            {allRides.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-600">No rides available yet. Be the first to offer one!</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {allRides.map((ride) => (
                  <Card key={ride.id} className="p-6 hover:shadow-xl transition-all border-2 hover:border-black">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Car className="h-5 w-5" />
                          <span className="font-bold">{ride.driver_name}</span>
                          {ride.vehicle_brand && (
                            <span className="text-sm text-gray-500">• {ride.vehicle_brand} {ride.vehicle_model}</span>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-green-600" />
                            <span className="text-sm">{ride.origin_address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-red-600" />
                            <span className="text-sm">{ride.destination_address}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {new Date(ride.departure_time).toLocaleString('sv-SE', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {ride.seats_available - ride.seats_booked} seats
                            </div>
                            <div className="font-bold">
                              {Math.round(ride.suggested_total_cost / (1 + (ride.seats_available - ride.seats_booked)))} SEK/person
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" className="rounded-full">View details</Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {!showAllRides && !routeInfo && !loading && (
          <Card className="p-12 text-center">
            <p className="text-xl text-gray-600">Enter your journey details or view all available rides</p>
          </Card>
        )}
      </div>
    </div>
  )
}
