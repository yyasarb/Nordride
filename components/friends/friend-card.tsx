'use client'

import Image from 'next/image'
import Link from 'next/link'
import { TierBadge } from '@/components/badges/verification-badges'

interface FriendCardProps {
  friend: {
    friendship_id: string
    id: string
    first_name: string
    last_name: string
    profile_picture_url?: string
    photo_url?: string
    current_tier?: number
    accepted_at: string
  }
  onUpdate: () => void
}

export function FriendCard({ friend, onUpdate }: FriendCardProps) {
  const getFriendsSince = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return `Friends since ${date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}`
    } catch {
      return 'Friends'
    }
  }

  return (
    <Link
      href={`/profile/${friend.id}`}
      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
    >
      <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
        {(friend.profile_picture_url || friend.photo_url) ? (
          <Image
            src={friend.profile_picture_url || friend.photo_url || ''}
            alt={`${friend.first_name} ${friend.last_name}`}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br from-purple-600 to-blue-600">
            {friend.first_name?.[0]}{friend.last_name?.[0]}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold truncate">
            {friend.first_name} {friend.last_name}
          </p>
          {friend.current_tier && friend.current_tier >= 2 && (
            <TierBadge tier={friend.current_tier} size="sm" />
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {getFriendsSince(friend.accepted_at)}
        </p>
      </div>
    </Link>
  )
}
