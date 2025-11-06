'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, MapPin, ArrowRight, Check, ChevronDown, Users, Shield, MessageCircle } from 'lucide-react'
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
                Good company makes every journey better
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Find rides across Sweden. Share costs, stories, and maybe a coffee stop. Real people, real conversations, real connections.
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

            {/* Right Column - Hero Illustration */}
            <div className="hidden lg:block">
              <div className="rounded-2xl overflow-hidden">
                <Image
                  src="/images/hero-illustration.png"
                  alt="Two travelers sharing a ride through Swedish forests"
                  width={800}
                  height={800}
                  className="w-full h-auto"
                  priority
                />
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

      {/* Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
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
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
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
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Questions? We&apos;ve got answers</h2>
          </div>
          <div className="bg-white border-2 border-gray-200 rounded-lg">
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
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of travelers sharing costs, stories, and Sweden&apos;s roads
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="bg-white text-gray-900 px-8 py-4 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Sign up
              </Link>
              <Link
                href="/rides/search"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-medium hover:bg-white hover:text-gray-900 transition-colors"
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
