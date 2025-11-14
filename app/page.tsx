'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Search, MapPin, ArrowRight, Check, ChevronDown, Users, Shield, MessageCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { TypingAnimation } from '@/components/typing-animation'

interface GeocodeResult {
  display_name: string
  lat: number
  lon: number
}

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

const FEATURES = [
  {
    icon: Users,
    title: 'Built by travelers, for travelers',
    description: 'No corporate middleman. Just real people sharing journeys across Sweden and beyond. Every ride strengthens our community.'
  },
  {
    icon: MessageCircle,
    title: 'Share more than just the ride',
    description: 'Every journey is a chance for good conversation. Meet fellow travelers, share stories, maybe find a friend. Connection makes the kilometers disappear.'
  },
  {
    icon: Shield,
    title: 'Verified profiles, real reviews',
    description: 'Email verification, transparent reviews, and secure messaging. Travel with people who are exactly who they say they are. Trust built through transparency.'
  },
]

const FAQ_DATA = [
  {
    question: "What makes NordRide different from other platforms?",
    answer: "We're built for connection, not just transportation. NordRide prioritizes the human side of travel—shared conversations, cultural exchange, and genuine companionship. We're a community platform, not a corporate service, with 100% free membership and no commissions. Every ride makes our Swedish travel community stronger."
  },
  {
    question: "Is this legal in Sweden?",
    answer: "Absolutely. Cost-sharing rides (samåkning) is legal in Sweden as long as you're genuinely sharing travel costs, not making profit. NordRide ensures pricing stays within legal limits—we cap costs at 80% of the maximum legal rate calculated by distance. You're simply splitting expenses with fellow travelers."
  },
  {
    question: "How does pricing work?",
    answer: "Drivers set prices based on actual costs: fuel, wear, tolls, and parking. Our system suggests fair prices (80% of legal maximum) and prevents overcharging. For passengers, you see the total cost upfront—no hidden fees, no commissions, no surprises. Just honest cost-sharing."
  },
  {
    question: "Who can see my profile and messages?",
    answer: "Your profile is visible to other verified NordRide members. Private messages are encrypted and only visible to you and the person you're chatting with. We never share your data with third parties. You control your information and can delete your account anytime—full GDPR compliance."
  },
  {
    question: "What if I need to cancel?",
    answer: "Life happens. Drivers can cancel rides anytime (though frequent cancellations affect your rating). Passengers can cancel approved bookings—the seat becomes available again immediately. Communication is key: let your travel companions know as early as possible through our messaging system."
  },
  {
    question: "How do I know who I'm riding with?",
    answer: "Every member verifies their email. You can see profiles with photos, languages spoken, ride history, and reviews from other travelers. Read what others say about potential travel companions. Our review system is transparent and honest—building trust through community feedback."
  },
  {
    question: "What about safety?",
    answer: "Your safety matters. We require email verification, transparent profiles, and authentic reviews. All messages stay within our platform until you approve a ride. Report any concerning behavior immediately—we take violations seriously and act quickly. Trust your instincts, read reviews, and communicate clearly."
  },
  {
    question: "Can I bring luggage or pets?",
    answer: "Each driver sets their own preferences. When creating a ride, drivers specify luggage allowance (small, carry-on, or large bags) and whether pets are welcome (yes, no, or maybe). Filter search results to find rides that match your needs. Always confirm details through messaging before departure."
  },
  {
    question: "What happens after the ride?",
    answer: "After arrival, both driver and passengers confirm trip completion in the system. Then you can leave honest reviews about your experience. Reviews help build community trust and guide other travelers. Share what made the journey memorable—the conversation, the playlist, the coffee stops."
  }
]

function FAQItem({ question, answer, isOpen, onClick }: {
  question: string
  answer: string
  isOpen: boolean
  onClick: () => void
}) {
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        className="w-full py-6 flex items-center justify-between text-left hover:text-gray-600 transition-colors"
        onClick={onClick}
      >
        <span className="text-lg font-semibold text-gray-900 pr-8">{question}</span>
        <ChevronDown className={`w-5 h-5 text-gray-600 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-6' : 'max-h-0'}`}>
        <p className="text-gray-600 leading-relaxed">{answer}</p>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [fromSuggestions, setFromSuggestions] = useState<GeocodeResult[]>([])
  const [toSuggestions, setToSuggestions] = useState<GeocodeResult[]>([])
  const [showFromSuggestions, setShowFromSuggestions] = useState(false)
  const [showToSuggestions, setShowToSuggestions] = useState(false)
  const fromRef = useRef<HTMLDivElement>(null)
  const toRef = useRef<HTMLDivElement>(null)
  const fromInputRef = useRef<HTMLInputElement>(null)
  const toInputRef = useRef<HTMLInputElement>(null)
  const [fromFocusedIndex, setFromFocusedIndex] = useState(-1)
  const [toFocusedIndex, setToFocusedIndex] = useState(-1)
  const [fromLastSelectedValue, setFromLastSelectedValue] = useState('')
  const [toLastSelectedValue, setToLastSelectedValue] = useState('')
  const abortControllerRef = useRef<AbortController | null>(null)
  const user = useAuthStore((state) => state.user)

  const simplifiedLabel = (display: string) => {
    const parts = display.split(',').map(p => p.trim())
    if (parts.length >= 2) {
      // Return "City, Country" format (first and last parts)
      return `${parts[0]}, ${parts[parts.length - 1]}`
    }
    return display
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fromRef.current && !fromRef.current.contains(event.target as Node)) {
        setShowFromSuggestions(false)
      }
      if (toRef.current && !toRef.current.contains(event.target as Node)) {
        setShowToSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Autocomplete for from
  useEffect(() => {
    // Only fetch if value changed (not just after selection)
    if (from === fromLastSelectedValue) {
      return
    }

    const fetchSuggestions = async () => {
      if (from.length < 2) {
        setFromSuggestions([])
        setShowFromSuggestions(false)
        return
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()

      try {
        const response = await fetch(`/api/geocoding?address=${encodeURIComponent(from)}`, {
          signal: abortControllerRef.current.signal
        })
        if (response.ok) {
          const data = await response.json()
          setFromSuggestions(data.slice(0, 5))
          setShowFromSuggestions(true)
          setFromFocusedIndex(-1)
        }
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Autocomplete error:', err)
        }
      }
    }

    const timer = setTimeout(fetchSuggestions, 250)
    return () => clearTimeout(timer)
  }, [from, fromLastSelectedValue])

  // Autocomplete for to
  useEffect(() => {
    // Only fetch if value changed (not just after selection)
    if (to === toLastSelectedValue) {
      return
    }

    const fetchSuggestions = async () => {
      if (to.length < 2) {
        setToSuggestions([])
        setShowToSuggestions(false)
        return
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()

      try {
        const response = await fetch(`/api/geocoding?address=${encodeURIComponent(to)}`, {
          signal: abortControllerRef.current.signal
        })
        if (response.ok) {
          const data = await response.json()
          setToSuggestions(data.slice(0, 5))
          setShowToSuggestions(true)
          setToFocusedIndex(-1)
        }
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Autocomplete error:', err)
        }
      }
    }

    const timer = setTimeout(fetchSuggestions, 250)
    return () => clearTimeout(timer)
  }, [to, toLastSelectedValue])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    // Always redirect to search page, even with empty params (shows all rides)
    window.location.href = `/rides/search${params.toString() ? `?${params.toString()}` : ''}`
  }

  // Keyboard handlers for from autocomplete
  const handleFromKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showFromSuggestions || fromSuggestions.length === 0) {
      if (e.key === 'Escape') {
        setShowFromSuggestions(false)
      } else if (e.key === 'Enter') {
        handleSearch()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFromFocusedIndex((prev) =>
          prev < fromSuggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setFromFocusedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (fromFocusedIndex >= 0 && fromFocusedIndex < fromSuggestions.length) {
          const selected = fromSuggestions[fromFocusedIndex]
          const formattedValue = simplifiedLabel(selected.display_name)
          setFrom(formattedValue)
          setFromLastSelectedValue(formattedValue)
          setShowFromSuggestions(false)
          setFromFocusedIndex(-1)
        } else {
          handleSearch()
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowFromSuggestions(false)
        setFromFocusedIndex(-1)
        break
    }
  }

  // Keyboard handlers for to autocomplete
  const handleToKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showToSuggestions || toSuggestions.length === 0) {
      if (e.key === 'Escape') {
        setShowToSuggestions(false)
      } else if (e.key === 'Enter') {
        handleSearch()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setToFocusedIndex((prev) =>
          prev < toSuggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setToFocusedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (toFocusedIndex >= 0 && toFocusedIndex < toSuggestions.length) {
          const selected = toSuggestions[toFocusedIndex]
          const formattedValue = simplifiedLabel(selected.display_name)
          setTo(formattedValue)
          setToLastSelectedValue(formattedValue)
          setShowToSuggestions(false)
          setToFocusedIndex(-1)
        } else {
          handleSearch()
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowToSuggestions(false)
        setToFocusedIndex(-1)
        break
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 lg:px-20">
        <div className="max-w-container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="lg:pr-8">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-6 leading-tight max-w-2xl">
                Good <TypingAnimation /> makes every journey better
              </h1>
              <p className="text-lg lg:text-xl text-gray-600 mb-8 leading-relaxed">
                Find rides across Sweden. Share costs, stories, and maybe a coffee stop. Real people, real conversations, real connections.
              </p>

              {/* Search Box */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow duration-fast">
                <div className="space-y-3">
                  {/* From Input */}
                  <div className="relative" ref={fromRef}>
                    <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                      <div className="flex items-center justify-center w-3 h-3 rounded-full bg-gray-900" />
                      <input
                        ref={fromInputRef}
                        type="text"
                        placeholder="From (e.g., Stockholm)"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        onFocus={() => {
                          // Only show suggestions if value changed since selection
                          if (from !== fromLastSelectedValue && from.length >= 2) {
                            setShowFromSuggestions(true)
                          }
                        }}
                        onKeyDown={handleFromKeyDown}
                        role="combobox"
                        aria-expanded={showFromSuggestions}
                        aria-controls="from-home-listbox"
                        aria-autocomplete="list"
                        aria-activedescendant={fromFocusedIndex >= 0 ? `from-home-option-${fromFocusedIndex}` : undefined}
                        className="flex-1 text-lg outline-none placeholder:text-gray-400 bg-transparent text-gray-900"
                      />
                    </div>
                    {showFromSuggestions && fromSuggestions.length > 0 && (
                      <div
                        id="from-home-listbox"
                        role="listbox"
                        className="absolute z-10 w-full bg-white border-2 border-gray-900 rounded-xl shadow-xl mt-1 max-h-60 overflow-auto"
                      >
                        {fromSuggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            id={`from-home-option-${index}`}
                            role="option"
                            aria-selected={index === fromFocusedIndex}
                            className={`px-4 py-3 cursor-pointer transition-colors ${
                              index === fromFocusedIndex ? 'bg-gray-200' : 'hover:bg-gray-100'
                            }`}
                            onClick={() => {
                              const formattedValue = simplifiedLabel(suggestion.display_name)
                              setFrom(formattedValue)
                              setFromLastSelectedValue(formattedValue)
                              setShowFromSuggestions(false)
                              setFromFocusedIndex(-1)
                            }}
                          >
                            <div className="font-medium text-gray-900">{suggestion.display_name.split(',')[0]}</div>
                            <div className="text-xs text-gray-500">{simplifiedLabel(suggestion.display_name)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* To Input */}
                  <div className="relative" ref={toRef}>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-3 h-3 rounded-full bg-gray-900" />
                      <input
                        ref={toInputRef}
                        type="text"
                        placeholder="To (e.g., Gothenburg)"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        onFocus={() => {
                          // Only show suggestions if value changed since selection
                          if (to !== toLastSelectedValue && to.length >= 2) {
                            setShowToSuggestions(true)
                          }
                        }}
                        onKeyDown={handleToKeyDown}
                        role="combobox"
                        aria-expanded={showToSuggestions}
                        aria-controls="to-home-listbox"
                        aria-autocomplete="list"
                        aria-activedescendant={toFocusedIndex >= 0 ? `to-home-option-${toFocusedIndex}` : undefined}
                        className="flex-1 text-lg outline-none placeholder:text-gray-400 bg-transparent text-gray-900"
                      />
                    </div>
                    {showToSuggestions && toSuggestions.length > 0 && (
                      <div
                        id="to-home-listbox"
                        role="listbox"
                        className="absolute z-10 w-full bg-white border-2 border-gray-900 rounded-xl shadow-xl mt-1 max-h-60 overflow-auto"
                      >
                        {toSuggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            id={`to-home-option-${index}`}
                            role="option"
                            aria-selected={index === toFocusedIndex}
                            className={`px-4 py-3 cursor-pointer transition-colors ${
                              index === toFocusedIndex ? 'bg-gray-200' : 'hover:bg-gray-100'
                            }`}
                            onClick={() => {
                              const formattedValue = simplifiedLabel(suggestion.display_name)
                              setTo(formattedValue)
                              setToLastSelectedValue(formattedValue)
                              setShowToSuggestions(false)
                              setToFocusedIndex(-1)
                            }}
                          >
                            <div className="font-medium text-gray-900">{suggestion.display_name.split(',')[0]}</div>
                            <div className="text-xs text-gray-500">{simplifiedLabel(suggestion.display_name)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Search Button */}
                <button
                  onClick={handleSearch}
                  className="w-full mt-4 rounded-full py-3.5 font-semibold text-white transition-all duration-fast flex items-center justify-center gap-2 bg-black hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] shadow-sm focus:outline-none focus:ring-2 focus:ring-black/50 focus:ring-offset-2"
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

            {/* Right Column - Hero Illustration */}
            <div className="hidden lg:block">
              <div className="rounded-2xl overflow-hidden">
                <img
                  src="/images/hero-illustration.png"
                  alt="Two travelers sharing a ride through Swedish forests"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="py-16 px-6 lg:px-20 bg-gray-50">
        <div className="max-w-container mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">Popular routes</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {POPULAR_ROUTES.map((route, index) => (
              <Link
                key={index}
                href={`/rides/search?from=${route.from}&to=${route.to}`}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:border-black hover:shadow-md transition-all duration-fast group"
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

      {/* Features */}
      <section className="py-16 px-6 lg:px-20">
        <div className="max-w-container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                  <feature.icon className="w-6 h-6 text-gray-900" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 lg:px-20 bg-gray-50">
        <div className="max-w-container mx-auto">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            {STATS.map((stat, index) => (
              <div key={index}>
                <div className="text-5xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-lg font-semibold text-gray-900 mb-2">{stat.label}</div>
                <p className="text-gray-600">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Questions? We&apos;ve got answers</h2>
          </div>
          <div className="bg-white border-2 border-gray-200 rounded-xl shadow-sm">
            <div className="divide-y divide-gray-200">
              {FAQ_DATA.map((faq, index) => (
                <div key={index} className="px-6">
                  <FAQItem
                    question={faq.question}
                    answer={faq.answer}
                    isOpen={openFAQ === index}
                    onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      {!user && (
        <section className="py-20 px-6 lg:px-20 bg-gray-900 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-lg lg:text-xl text-gray-300 mb-8">
              Join thousands of travelers sharing costs, stories, and Sweden&apos;s roads
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="bg-white text-gray-900 px-8 py-3.5 rounded-full font-semibold hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-fast shadow-md"
              >
                Sign up
              </Link>
              <Link
                href="/rides/search"
                className="border-2 border-white text-white px-8 py-3.5 rounded-full font-semibold hover:bg-white hover:text-gray-900 hover:scale-[1.02] active:scale-[0.98] transition-all duration-fast"
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
