'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'
import { VerificationBadge } from '@/components/badges/verification-badges'

interface MutualFriend {
  friend_id: string
  friend_first_name: string
  friend_last_name: string
  friend_avatar: string | null
  friend_tier: number
}

interface MutualFriendsModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  userName: string
}

export function MutualFriendsModal({
  isOpen,
  onClose,
  userId,
  userName,
}: MutualFriendsModalProps) {
  const [mutualFriends, setMutualFriends] = useState<MutualFriend[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      fetchMutualFriends()
    }
  }, [isOpen, userId])

  const fetchMutualFriends = async () => {
    setLoading(true)
    try {
      const session = await supabase.auth.getSession()
      const response = await fetch(`/api/friends/mutual?user_id=${userId}`, {
        headers: {
          Authorization: `Bearer ${session.data.session?.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setMutualFriends(data.mutual_friends || [])
      }
    } catch (error) {
      console.error('Error fetching mutual friends:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[600px]">
        <DialogHeader>
          <DialogTitle>
            Mutual Friends with {userName} ({mutualFriends.length})
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[450px] -mx-6 px-6">
          {loading ? (
            <div className="py-8 text-center text-gray-500">Loading...</div>
          ) : mutualFriends.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No mutual friends
            </div>
          ) : (
            <div className="space-y-3">
              {mutualFriends.map((friend) => (
                <Link
                  key={friend.friend_id}
                  href={`/profile/${friend.friend_id}`}
                  onClick={onClose}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                    {friend.friend_avatar ? (
                      <Image
                        src={friend.friend_avatar}
                        alt={`${friend.friend_first_name} ${friend.friend_last_name}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br from-purple-600 to-blue-600">
                        {friend.friend_first_name?.[0]}{friend.friend_last_name?.[0]}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">
                        {friend.friend_first_name} {friend.friend_last_name}
                      </p>
                      {friend.friend_tier && friend.friend_tier >= 2 && (
                        <VerificationBadge tier={friend.friend_tier} />
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
