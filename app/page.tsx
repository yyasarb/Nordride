'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRight, Leaf, Users, Shield, Sparkles } from 'lucide-react'
import { HeroInteractiveScene } from '@/components/home/hero-map'

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false)

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
              <HeroInteractiveScene />
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

      {/* Popular Routes */}
      <section className="py-20 px-6">
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

      {/* CTA Section */}
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

      {/* Footer */}
      <footer className="py-12 px-6 border-t">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="font-display text-xl font-bold">Nordride</div>
            <div className="text-sm text-gray-600">
              © 2025 Nordride. Made with ❤️ for sustainable travel.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
