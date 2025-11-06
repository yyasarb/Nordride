'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function SiteFooter() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [subscribing, setSubscribing] = useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setSubscribing(true)
    // Simulate API call - you can integrate with Resend or your email service
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSubscribed(true)
    setSubscribing(false)
    setEmail('')

    // Reset after 3 seconds
    setTimeout(() => setSubscribed(false), 3000)
  }

  return (
    <footer className="bg-black text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Newsletter Section */}
          <div>
            <h3 className="font-display text-2xl font-bold mb-4">
              Subscribe to our newsletter for more inspiration.
            </h3>
            <form onSubmit={handleSubscribe} className="flex gap-2 mb-2">
              <Input
                type="email"
                placeholder="your.mail@whatever.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white text-black rounded-full"
                disabled={subscribing || subscribed}
              />
              <Button
                type="submit"
                className="bg-white text-black hover:bg-gray-200 rounded-full px-6"
                disabled={subscribing || subscribed}
              >
                {subscribing ? 'Subscribing...' : subscribed ? 'Subscribed!' : 'Subscribe'}
              </Button>
            </form>
            <p className="text-sm text-gray-400">
              Receive premium updates and exclusive offers directly in your inbox.
            </p>
          </div>

          {/* Legal Links */}
          <div className="flex flex-col md:items-end justify-center">
            <div className="flex flex-wrap gap-4 text-sm mb-4">
              <Link href="/about" className="hover:underline">
                About
              </Link>
              <span className="text-gray-600">|</span>
              <Link href="/legal/terms" className="hover:underline">
                Terms & Conditions
              </Link>
              <span className="text-gray-600">|</span>
              <Link href="/legal/privacy" className="hover:underline">
                Privacy Policy
              </Link>
              <span className="text-gray-600">|</span>
              <Link href="/legal/cookies" className="hover:underline">
                Cookie Policy
              </Link>
              <span className="text-gray-600">|</span>
              <Link href="/legal/community" className="hover:underline">
                Community
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © 2025 Nordride. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 max-w-2xl text-center md:text-right">
            Nordride is a community-based carpooling platform for sharing travel costs — not for making profit.
          </p>
        </div>
      </div>
    </footer>
  )
}
