'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Check, MapPin, ArrowRight, Users, Shield, MessageCircle, ChevronDown, Rocket } from 'lucide-react'
import { WaitlistForm } from '@/components/waitlist/waitlist-form'
import { createClient } from '@/lib/supabase/client'

const POPULAR_ROUTES = [
  { from: 'Stockholm', to: 'Gothenburg', price: '280 kr', time: '5h 30m' },
  { from: 'Stockholm', to: 'Malmö', price: '350 kr', time: '6h 45m' },
  { from: 'Stockholm', to: 'Uppsala', price: '75 kr', time: '1h' },
  { from: 'Gothenburg', to: 'Malmö', price: '180 kr', time: '3h 15m' },
]

const FEATURES = [
  {
    icon: Users,
    title: 'Built by travelers, for travelers',
    description: 'No corporate middleman. Just real people sharing journeys across Sweden and beyond. We\'re launching in January 2026 with a community-first approach.'
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
    question: "When does Nordride launch?",
    answer: "We're launching in January 2026. Founding members (first 1,000 on waitlist OR first 30 days after launch) get early access 24 hours before public launch, plus 2 months free and 75% off for the first year."
  },
  {
    question: "What happens after I join the waitlist?",
    answer: "You'll receive: 1. Immediate confirmation email with your waitlist number 2. Weekly updates on launch progress (Nov-Dec 2025) 3. Early access invite 24 hours before public launch 4. First chance to claim Founding Member pricing. No spam, no selling your email. Just launch updates."
  },
  {
    question: "What do I get as a founding member?",
    answer: "Founding members receive: • 2 months completely free (vs 1 week for regular members) • 59 SEK/year pricing (70% off regular 199 SEK/year) • Exclusive \"Founding Member\" badge on your profile • Price locked until January 2027"
  },
  {
    question: "Is this legal in Sweden?",
    answer: "Yes! Nordride operates as a cost-sharing platform under Swedish law (Transportstyrelsens rules). Drivers can only charge for actual costs (fuel, tolls) — no profit allowed. This keeps it legal and affordable. We'll provide full guidance when you sign up."
  },
  {
    question: "How does pricing work?",
    answer: "Drivers set prices based on actual costs: fuel, wear, tolls, and parking. Our system suggests fair prices (80% of legal maximum) and prevents overcharging. For passengers, you see the total cost upfront—no hidden fees, no commissions, no surprises. Just honest cost-sharing."
  },
  {
    question: "Will Nordride be free to use?",
    answer: "The platform requires a subscription (59 SEK/year for Founding Members, 199 SEK/year for Regular members). This small fee keeps the platform sustainable, ad-free, and commission-free. Drivers and riders pay the same — everyone contributes equally to the community."
  },
  {
    question: "Can I join the waitlist if I'm not in Stockholm?",
    answer: "Absolutely! Nordride covers all of Sweden — from Malmö to Kiruna. No matter where you live or travel, there's a spot for you."
  },
  {
    question: "What about safety?",
    answer: "Your safety matters. We require email verification, transparent profiles, and authentic reviews. All messages stay within our platform until you approve a ride. Report any concerning behavior immediately—we take violations seriously and act quickly. Trust your instincts, read reviews, and communicate clearly."
  },
  {
    question: "Can I bring luggage or pets?",
    answer: "Each driver sets their own preferences. When creating a ride, drivers specify luggage allowance (small, carry-on, or large bags) and whether pets are welcome (yes, no, or maybe). Filter search results to find rides that match your needs. Always confirm details through messaging before departure."
  },
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
        <p className="text-gray-600 leading-relaxed whitespace-pre-line">{answer}</p>
      </div>
    </div>
  )
}

export default function WaitlistPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [waitlistCount, setWaitlistCount] = useState<number>(357)
  const [daysUntilLaunch, setDaysUntilLaunch] = useState<number>(0)

  // Calculate days until launch (January 1, 2026)
  useEffect(() => {
    const launchDate = new Date('2026-01-01')
    const today = new Date()
    const diffTime = launchDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    setDaysUntilLaunch(diffDays)
  }, [])

  // Real-time waitlist counter
  useEffect(() => {
    const supabase = createClient()

    // Initial fetch
    const fetchCount = async () => {
      const { count } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })

      if (count !== null) {
        setWaitlistCount(357 + count) // Start from 357
      }
    }

    fetchCount()

    // Subscribe to real-time changes
    const channel = supabase
      .channel('waitlist-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'waitlist'
        },
        () => {
          fetchCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const foundingSpotsRemaining = Math.max(0, 1000 - waitlistCount)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="max-w-2xl">
              {/* Announcement Badge with Countdown */}
              <div className="inline-block mb-6">
                <div className="text-xs font-semibold text-gray-600 tracking-wide uppercase mb-2">
                  Launching January 2026
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-600 tracking-wide uppercase">
                    {daysUntilLaunch} days to go
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-xs font-semibold text-red-500 tracking-wide uppercase">Live</span>
                  </div>
                </div>
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Join Sweden&apos;s Ride-Sharing Community
              </h1>

              {/* Subheadline */}
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Share costs, reduce emissions, build connections. Zero fees. Zero corporate middleman. Just real people traveling together.
              </p>

              {/* CTA Button */}
              <div className="mb-6">
                <button
                  onClick={() => {
                    const element = document.getElementById('join-waitlist')
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  }}
                  className="inline-block bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Join now
                </button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-lg">
                    👤
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-lg">
                    👤
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-lg">
                    👤
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{waitlistCount.toLocaleString()}+</span> travelers have already joined
                </p>
              </div>
            </div>

            {/* Right Column - Hero Image */}
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

      {/* What Happens When You Join the Waitlist */}
      <section className="py-16 px-6 lg:px-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">What Happens When You Join the Waitlist</h2>
            <p className="text-lg text-gray-600">
              Get exclusive updates and first access to Founding Member pricing
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">24-hour early access before public launch</h3>
                  <p className="text-sm text-gray-600">Be first to claim Founding Member pricing in January 2026</p>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Weekly progress updates (Nov-Dec 2025)</h3>
                  <p className="text-sm text-gray-600">Behind-the-scenes development, feature announcements, launch prep</p>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Exclusive sneak peeks</h3>
                  <p className="text-sm text-gray-600">See the platform before it goes public — screenshots, demos, new features</p>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Help shape the platform</h3>
                  <p className="text-sm text-gray-600">Your survey responses influence which routes we prioritize</p>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">First shot at Founding Member pricing</h3>
                  <p className="text-sm text-gray-600">Lock in 59 SEK/year (70% off) before spots fill up</p>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <span className="text-lg">💳</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">No payment required now</h3>
                  <p className="text-sm text-gray-600">🔒 Choose to join (or not) when we launch</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers Section */}
      <section className="py-16 px-6 lg:px-20 bg-gray-50">
        <div className="max-w-container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Don&apos;t Miss Founding Member Pricing</h2>
            <p className="text-lg text-gray-600">
              Waitlist members get first access to 59 SEK/year (70% off) before it opens to the public
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Regular Member Card */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-8 flex flex-col">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">REGULAR MEMBER</h3>
                <p className="text-sm text-gray-600">Available anytime after launch</p>
              </div>

              <div className="mb-6 flex-grow">
                <h4 className="font-semibold text-gray-900 mb-3">What You Get:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-900">Full platform access</span>
                      <p className="text-sm text-gray-600">(Find rides, offer rides, book rides, messaging)</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-900">1 week free trial</span>
                      <p className="text-sm text-gray-600">(7 days to try the platform)</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 opacity-50">
                    <span className="text-gray-400 flex-shrink-0 mt-0.5">✗</span>
                    <span className="text-gray-500">No founding member badge</span>
                  </li>
                  <li className="flex items-start gap-2 opacity-50">
                    <span className="text-gray-400 flex-shrink-0 mt-0.5">✗</span>
                    <span className="text-gray-500">No price lock (Price may increase in future)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mt-auto">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">Price:</span>
                  <span className="text-2xl font-bold text-gray-900">199 SEK/year</span>
                </div>
              </div>
            </div>

            {/* Founding Member Card */}
            <div className="bg-white border-2 border-black rounded-xl p-8 relative shadow-lg flex flex-col">
              {/* Save 70% Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-black text-white px-4 py-1.5 rounded-full text-sm font-semibold">
                  Save 70%
                </div>
              </div>

              <div className="text-center mb-6 mt-2">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">FOUNDING MEMBER ⭐</h3>
                <p className="text-sm text-gray-600">Limited to first 1,000 members</p>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">What You Get:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-900">Full platform access</span>
                      <p className="text-sm text-gray-600">(Find rides, offer rides, book rides, messaging)</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-900">2 months completely free</span>
                      <p className="text-sm text-gray-600">(No charge until March 2026)</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-900">59 SEK/year after free period</span>
                      <p className="text-sm text-gray-600">(Only 5 SEK/month)</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-900">Exclusive &quot;Founding Member&quot; badge</span>
                      <p className="text-sm text-gray-600">(Permanent on your profile)</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-900">Price locked until January 2027</span>
                      <p className="text-sm text-gray-600">(Guaranteed pricing for one year)</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Regular Price:</span>
                  <span className="text-sm line-through text-gray-500">199 SEK/year</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900">Founding Price:</span>
                  <span className="text-2xl font-bold text-gray-900">59 SEK/year</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-green-700">You Save:</span>
                  <span className="text-sm font-semibold text-green-700">140 SEK/year (70% off)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Form Section */}
      <section id="join-waitlist" className="py-16 px-6 lg:px-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Join the Nordride Waitlist</h2>
            {foundingSpotsRemaining > 0 && (
              <p className="text-sm text-orange-700 font-semibold bg-orange-50 border border-orange-200 rounded-full px-4 py-2 inline-block mb-4">
                ⚠️ Only {foundingSpotsRemaining} founding member spots available in waitlist pool
              </p>
            )}
          </div>

          <WaitlistForm />

          {/* Reassurance */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              💳 No payment required • 🔒 Unsubscribe anytime
            </p>
          </div>

          {/* Mini Testimonial */}
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
            <p className="text-gray-900 italic mb-2">&quot;I&apos;ve been waiting for this in Sweden!&quot;</p>
            <p className="text-sm text-gray-600">— Emma K., Stockholm</p>
          </div>
        </div>
      </section>

      {/* Popular Routes Section */}
      <section className="py-16 px-6 lg:px-20 bg-gray-50">
        <div className="max-w-container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Most Requested Routes</h2>
            <p className="text-lg text-gray-600">
              These are the routes our waitlist members travel most. Be first to find rides when we launch.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {POPULAR_ROUTES.map((route, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:border-black hover:shadow-md transition-all duration-fast"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-gray-900">{route.from}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-900">{route.to}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{route.time}</span>
                  <span className="font-semibold text-gray-900">{route.price}</span>
                </div>
              </div>
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
    </div>
  )
}
