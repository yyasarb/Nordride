'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TierBadge } from '@/components/badges/verification-badges'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { X } from 'lucide-react'

interface SentRequestCardProps {
  request: {
    friendship_id: string
    id: string
    first_name: string
    last_name: string
    profile_picture_url?: string
    photo_url?: string
    current_tier?: number
    message?: string
    requested_at: string
  }
  onUpdate: () => void
}

export function SentRequestCard({ request, onUpdate }: SentRequestCardProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays === 1) return 'yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  const handleCancel = async () => {
    setLoading(true)
    try {
      const session = await supabase.auth.getSession()
      const response = await fetch(`/api/friends/cancel?friendship_id=${request.friendship_id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.data.session?.access_token}`,
        },
      })

      if (response.ok) {
        toast({
          title: 'Request cancelled',
          description: 'Friend request cancelled successfully',
        })
        onUpdate()
      } else {
        const data = await response.json()
        toast({
          title: 'Error',
          description: data.error || 'Failed to cancel request',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error cancelling request:', error)
      toast({
        title: 'Error',
        description: 'Failed to cancel request',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      <Link href={`/profile/${request.id}`}>
        <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 cursor-pointer">
          {(request.profile_picture_url || request.photo_url) ? (
            <Image
              src={request.profile_picture_url || request.photo_url || ''}
              alt={`${request.first_name} ${request.last_name}`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl bg-gradient-to-br from-purple-600 to-blue-600">
              {request.first_name?.[0]}{request.last_name?.[0]}
            </div>
          )}
        </div>
      </Link>

      <div className="flex-1 min-w-0">
        <Link href={`/profile/${request.id}`} className="hover:underline">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-lg">
              {request.first_name} {request.last_name}
            </p>
            {request.current_tier && request.current_tier >= 2 && (
              <TierBadge tier={request.current_tier} size="sm" />
            )}
          </div>
        </Link>

        {request.message && (
          <p className="text-gray-700 mt-2 text-sm italic">
            &quot;{request.message}&quot;
          </p>
        )}

        <p className="text-sm text-gray-500 mt-2">
          Sent {getRelativeTime(request.requested_at)}
        </p>

        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={loading}
          className="mt-4"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel Request
        </Button>
      </div>
    </div>
  )
}
