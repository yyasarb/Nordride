'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X, Cookie } from 'lucide-react'

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      // Show banner after a short delay
      const timer = setTimeout(() => setIsVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    localStorage.setItem('cookie-consent-date', new Date().toISOString())
    closeModal()
  }

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined')
    localStorage.setItem('cookie-consent-date', new Date().toISOString())
    closeModal()
  }

  const closeModal = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsVisible(false)
      setIsClosing(false)
    }, 300)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-2xl">
        <Card
          className={`border-2 border-gray-300 shadow-2xl transition-all duration-300 ${
            isClosing ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'
          }`}
        >
          <div className="p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-start gap-4 mb-4">
              <div className="bg-black text-white p-3 rounded-full flex-shrink-0">
                <Cookie className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold mb-2">
                  We value your privacy
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We use cookies to improve your experience, keep you logged in, and analyze how you use our platform.
                  You can choose which types of cookies to allow.
                </p>
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                      Essential
                    </div>
                    <p className="text-gray-600 flex-1">
                      Required for authentication, security, and basic functionality. Always active.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                      Optional
                    </div>
                    <p className="text-gray-600 flex-1">
                      Analytics and functional cookies to improve your experience and help us make Nordride better.
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  Learn more in our{' '}
                  <Link href="/legal/cookies" className="text-black font-semibold hover:underline" target="_blank">
                    Cookie Policy
                  </Link>
                  {' '}and{' '}
                  <Link href="/legal/privacy" className="text-black font-semibold hover:underline" target="_blank">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleAccept}
                className="flex-1 rounded-full bg-black text-white hover:bg-gray-800"
              >
                Accept All Cookies
              </Button>
              <Button
                onClick={handleDecline}
                variant="outline"
                className="flex-1 rounded-full border-2"
              >
                Essential Only
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
