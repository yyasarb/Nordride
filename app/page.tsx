'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, MapPin, ArrowRight, Check } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'

const POPULAR_ROUTES = [
  { from: 'Stockholm', to: 'Gothenburg', price: '280 kr', time: '5h 30m' },
  { from: 'Stockholm', to: 'Malmö', price: '350 kr', time: '6h 45m' },
  { from: 'Stockholm', to: 'Uppsala', price: '75 kr', time: '1h' },
  { from: 'Gothenburg', to: 'Malmö', price: '180 kr', time: '3h 15m' },
]

const STATS = [
  {
    number: '12.4M',
    label: 'Rides shared',
    description: 'Connecting travelers across Sweden'
  },
  {
    number: '98%',
    label: 'Satisfaction rate',
    description: 'Happy riders and drivers'
  },
  {
    number: '2.8M kg',
    label: 'CO₂ saved',
    description: 'Together for a greener future'
  },
]

export default function HomePage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const user = useAuthStore((state) => state.user)

  const handleSearch = () => {
    if (from || to) {
      const params = new URLSearchParams()
      if (from) params.set('from', from)
      if (to) params.set('to', to)
      window.location.href = `/rides/search?${params.toString()}`
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Go anywhere with Nordride
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Share rides across Sweden. Split costs, meet travelers, reduce emissions.
              </p>

              {/* Search Box */}
              <div className="bg-white border-2 border-gray-200 rounded-lg p-4 shadow-lg">
                <div className="space-y-3">
                  {/* From Input */}
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                    <div className="flex items-center justify-center w-3 h-3 rounded-full bg-gray-900" />
                    <input
                      type="text"
                      placeholder="From (e.g., Stockholm)"
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      className="flex-1 text-lg outline-none placeholder:text-gray-400"
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>

                  {/* To Input */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-3 h-3 rounded-full bg-gray-900" />
                    <input
                      type="text"
                      placeholder="To (e.g., Gothenburg)"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      className="flex-1 text-lg outline-none placeholder:text-gray-400"
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                </div>

                {/* Search Button */}
                <button
                  onClick={handleSearch}
                  className="w-full mt-4 bg-black text-white py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  Search rides
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-6 mt-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Verified profiles</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Secure platform</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>100% free</span>
                </div>
              </div>
            </div>

            {/* Right Column - Image Placeholder */}
            <div className="hidden lg:block">
              <div className="bg-gray-100 rounded-2xl aspect-square flex items-center justify-center">
                <div className="text-center">
                  <div className="text-8xl mb-4">🚗</div>
                  <p className="text-gray-600 font-medium">Travel together</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Popular routes</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {POPULAR_ROUTES.map((route, index) => (
              <Link
                key={index}
                href={`/rides/search?from=${route.from}&to=${route.to}`}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-900 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-gray-900">{route.from}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-900">{route.to}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{route.time}</span>
                  <span className="font-semibold text-gray-900">{route.price}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why choose Nordride</h2>
            <p className="text-xl text-gray-600">Join thousands of travelers making smarter journeys</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {STATS.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-lg font-semibold text-gray-900 mb-2">{stat.label}</div>
                <p className="text-gray-600">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to get started?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of travelers sharing rides across Sweden
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="bg-black text-white px-8 py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Sign up
              </Link>
              <Link
                href="/rides/search"
                className="border-2 border-gray-200 text-gray-900 px-8 py-4 rounded-lg font-medium hover:border-gray-900 transition-colors"
              >
                Browse rides
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
