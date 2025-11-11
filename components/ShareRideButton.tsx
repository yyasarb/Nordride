'use client'

import { useState } from 'react'
import { Share2, Facebook, MessageCircle, Link as LinkIcon, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ShareRideButtonProps {
  rideId: string
  rideTitle: string
  rideDescription?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export default function ShareRideButton({
  rideId,
  rideTitle,
  rideDescription,
  variant = 'outline',
  size = 'default',
  className = '',
}: ShareRideButtonProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [copied, setCopied] = useState(false)

  const rideUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/rides/${rideId}`
  const shareText = `Check out this ride on Nordride: ${rideTitle}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(rideUrl)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
        setShowMenu(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(rideUrl)}`
    window.open(facebookUrl, '_blank', 'width=600,height=400')
    setShowMenu(false)
  }

  const handleWhatsAppShare = () => {
    const whatsappText = encodeURIComponent(`${shareText}\n${rideUrl}`)
    const whatsappUrl = `https://wa.me/?text=${whatsappText}`
    window.open(whatsappUrl, '_blank')
    setShowMenu(false)
  }

  const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  return (
    <div className="relative">
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowMenu(!showMenu)}
        className={`flex items-center gap-2 ${className}`}
      >
        <Share2 className="h-4 w-4" />
        Share
      </Button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border-2 border-gray-200 z-50 overflow-hidden">
            <div className="p-2 space-y-1">
              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors text-left"
              >
                {copied ? (
                  <>
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-green-600">Link copied!</span>
                  </>
                ) : (
                  <>
                    <LinkIcon className="h-5 w-5 text-gray-700 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900">Copy link</span>
                  </>
                )}
              </button>

              {/* Facebook */}
              <button
                onClick={handleFacebookShare}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 rounded-lg transition-colors text-left"
              >
                <Facebook className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-900">Share on Facebook</span>
              </button>

              {/* WhatsApp (mobile only) */}
              {isMobile && (
                <button
                  onClick={handleWhatsAppShare}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 rounded-lg transition-colors text-left"
                >
                  <MessageCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-900">Share on WhatsApp</span>
                </button>
              )}

              {/* WhatsApp (desktop) */}
              {!isMobile && (
                <button
                  onClick={handleWhatsAppShare}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 rounded-lg transition-colors text-left"
                >
                  <MessageCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-900">Share on WhatsApp</span>
                </button>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-600 text-center">
                Share this ride to help fill seats
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
