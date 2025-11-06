'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRight, Leaf, Users, Shield, Sparkles, Car, MapPin, Smile, TrendingUp } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-12 pb-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                100% Free • No Commissions
              </div>
              <h1 className="font-display text-6xl lg:text-7xl font-bold leading-tight">
                Share the ride,
                <br />
                <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                  share the planet
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Join Sweden&apos;s community-driven ride-sharing platform. Connect with travelers, split costs, and reduce your carbon footprint.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="rounded-full text-lg px-8 py-6 group">
                  <Link href="/rides/search" className="flex items-center gap-2">
                    Find a ride
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full text-lg px-8 py-6">
                  <Link href="/rides/create">Offer a ride</Link>
                </Button>
              </div>
            </div>

            <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              <div className="relative h-[500px] rounded-3xl bg-gradient-to-br from-emerald-50 to-emerald-100 overflow-hidden border border-emerald-200 shadow-xl flex items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-100 via-emerald-50 to-white opacity-70"></div>
                <div className="relative z-10 flex flex-col items-center justify-center gap-8">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-green-500/20 rounded-full blur-2xl"></div>
                    <Car className="h-32 w-32 text-green-600 relative" strokeWidth={1.5} />
                  </div>
                  <div className="flex items-center gap-8">
                    <MapPin className="h-12 w-12 text-green-600" />
                    <div className="flex gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                    <MapPin className="h-12 w-12 text-emerald-600" />
                  </div>
                  <p className="text-green-700 font-medium text-lg">Travel Together, Save Together</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl lg:text-5xl font-bold mb-4">
              Why choose Nordride?
            </h2>
            <p className="text-xl text-gray-600">
              The sustainable way to travel across the Nordics
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="h-8 w-8" />,
                title: 'Community-driven',
                description: 'Built by and for the Nordic community. No corporate middleman taking a cut.'
              },
              {
                icon: <Leaf className="h-8 w-8" />,
                title: 'Eco-friendly',
                description: 'Reduce CO₂ emissions by sharing rides. Every journey makes a difference.'
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: 'Safe & trusted',
                description: 'Verified profiles, community reviews, and secure messaging built-in.'
              }
            ].map((feature, index) => (
              <Card
                key={index}
                className="p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-0 shadow-md"
              >
                <div className="bg-black text-white w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="font-display text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights Section - Impact Metrics */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl lg:text-5xl font-bold mb-4">
              Shared Rides. Shared Impact.
            </h2>
            <p className="text-xl text-gray-600">
              Together, we&apos;re making a real difference
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                metric: '12.4M',
                icon: <TrendingUp className="h-10 w-10" />,
                headline: 'Rides shared — and counting.',
                subtext: 'Every trip means fewer cars and new connections.',
                color: 'from-blue-500 to-blue-600',
                delay: 'delay-0'
              },
              {
                metric: '98%',
                icon: <Smile className="h-10 w-10" />,
                headline: 'Riders arrive with a smile.',
                subtext: 'Because sharing the journey makes it better.',
                color: 'from-yellow-500 to-yellow-600',
                delay: 'delay-150'
              },
              {
                metric: '1 day',
                icon: <Leaf className="h-10 w-10" />,
                headline: 'Stockholm\'s air, saved for a day.',
                subtext: 'We\'ve prevented enough CO₂ to clear the city\'s skies.',
                color: 'from-green-500 to-green-600',
                delay: 'delay-300'
              }
            ].map((highlight, index) => (
              <div
                key={index}
                className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'} ${highlight.delay}`}
              >
                <Card className="p-8 text-center hover:shadow-2xl transition-all duration-300 border-2 h-full">
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${highlight.color} text-white flex items-center justify-center mx-auto mb-6`}>
                    {highlight.icon}
                  </div>
                  <div className="mb-4">
                    <p className="font-display text-5xl font-bold mb-2">{highlight.metric}</p>
                  </div>
                  <h3 className="font-semibold text-xl mb-3 text-gray-900">
                    {highlight.headline}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {highlight.subtext}
                  </p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl lg:text-5xl font-bold mb-4">
              Popular routes
            </h2>
            <p className="text-xl text-gray-600">
              Frequently traveled destinations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { from: 'Stockholm', to: 'Gothenburg' },
              { from: 'Stockholm', to: 'Malmö' },
              { from: 'Stockholm', to: 'Uppsala' },
              { from: 'Gothenburg', to: 'Malmö' },
              { from: 'Malmö', to: 'Copenhagen' },
              { from: 'Uppsala', to: 'Linköping' }
            ].map((route, index) => (
              <Link
                key={index}
                href={`/rides/search?from=${route.from}&to=${route.to}`}
                className="group"
              >
                <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-black">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-lg tracking-tight">{route.from}</div>
                      <div className="text-sm text-gray-500 uppercase tracking-wide">to {route.to}</div>
                    </div>
                    <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl lg:text-5xl font-bold mb-4">
              Frequently Asked (and sometimes funny) Questions 😄
            </h2>
            <p className="text-xl text-gray-600">Everything you need to know about Nordride</p>
          </div>

          <div className="space-y-6">
            <Card className="p-6 border-2 hover:border-green-500 transition-colors">
              <h3 className="font-bold text-xl mb-2">Can I make money on Nordride?</h3>
              <p className="text-gray-700">
                Nope! Nordride is about sharing, not earning. You can split fuel costs — but profit isn&apos;t allowed (that&apos;d make you a taxi 😉).
              </p>
            </Card>

            <Card className="p-6 border-2 hover:border-green-500 transition-colors">
              <h3 className="font-bold text-xl mb-2">Is Nordride legal in Sweden?</h3>
              <p className="text-gray-700">
                Yes — as long as rides are cost-shared and non-commercial. We follow Transportstyrelsen&apos;s rules carefully.
              </p>
            </Card>

            <Card className="p-6 border-2 hover:border-green-500 transition-colors">
              <h3 className="font-bold text-xl mb-2">Who&apos;s responsible if something goes wrong?</h3>
              <p className="text-gray-700">
                Each ride is arranged privately between users. Nordride just connects you — we&apos;re the digital matchmaker, not the driver. 🚗💨
              </p>
            </Card>

            <Card className="p-6 border-2 hover:border-green-500 transition-colors">
              <h3 className="font-bold text-xl mb-2">How is my data protected?</h3>
              <p className="text-gray-700">
                We&apos;re GDPR-compliant. You can view, export, or delete your data anytime from <em>Settings → Privacy & Data</em>.
              </p>
            </Card>

            <Card className="p-6 border-2 hover:border-green-500 transition-colors">
              <h3 className="font-bold text-xl mb-2">Can anyone see my chats?</h3>
              <p className="text-gray-700">
                Nope. Chats are encrypted and visible only to you and your travel partner. 🔒
              </p>
            </Card>

            <Card className="p-6 border-2 hover:border-green-500 transition-colors">
              <h3 className="font-bold text-xl mb-2">Do I need a special license to drive?</h3>
              <p className="text-gray-700">
                If you&apos;re insured and not charging profit, you&apos;re good to go. Just drive safely and share kindly.
              </p>
            </Card>

            <Card className="p-6 border-2 hover:border-green-500 transition-colors">
              <h3 className="font-bold text-xl mb-2">Can I bring my dog or luggage?</h3>
              <p className="text-gray-700">
                If the driver allows it! You can filter rides by &quot;pets allowed&quot; or &quot;luggage options&quot; before booking. 🐶🧳
              </p>
            </Card>

            <Card className="p-6 border-2 hover:border-green-500 transition-colors">
              <h3 className="font-bold text-xl mb-2">What if I need to cancel?</h3>
              <p className="text-gray-700">
                Easy — cancel from the ride page. Just try to give your travel mates a little notice.
              </p>
            </Card>

            <Card className="p-6 border-2 hover:border-green-500 transition-colors">
              <h3 className="font-bold text-xl mb-2">How do reviews work?</h3>
              <p className="text-gray-700">
                After each trip, both driver and rider can leave a review (no stars, just nice words). Reviews appear on your profile.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section - Only show when user is not logged in */}
      {!user && (
        <section className="py-20 px-6 bg-black text-white">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="font-display text-4xl lg:text-5xl font-bold mb-6">
              Ready to start your journey?
            </h2>
            <p className="text-xl text-gray-300 mb-10">
              Join thousands already sharing rides and reducing their carbon footprint
            </p>
            <Button asChild size="lg" className="rounded-full text-lg px-8 py-6 bg-white text-black hover:bg-gray-100">
              <Link href="/auth/signup">Get started for free</Link>
            </Button>
          </div>
        </section>
      )}
    </div>
  )
}
