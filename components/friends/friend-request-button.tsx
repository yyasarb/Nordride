'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { UserPlus, UserCheck, Clock } from 'lucide-react'
import { FriendRequestModal } from './friend-request-modal'
import { createClient } from '@/lib/supabase/client'

interface FriendRequestButtonProps {
  userId: string
  userName: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showIcon?: boolean
  className?: string
}

export function FriendRequestButton({
  userId,
  userName,
  variant = 'default',
  size = 'default',
  showIcon = true,
  className = '',
}: FriendRequestButtonProps) {
  const [status, setStatus] = useState<string>('loading')
  const [friendshipId, setFriendshipId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchFriendshipStatus()
  }, [userId])

  const fetchFriendshipStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setStatus('none')
        return
      }

      // Don't show button if viewing own profile
      if (user.id === userId) {
        setStatus('self')
        return
      }

      const response = await fetch(`/api/friends/status?user_id=${userId}`, {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStatus(data.status)
        setFriendshipId(data.friendship_id)
      }
    } catch (error) {
      console.error('Error fetching friendship status:', error)
      setStatus('none')
    }
  }

  const handleClick = () => {
    if (status === 'none') {
      setShowModal(true)
    }
  }

  const handleSuccess = () => {
    setShowModal(false)
    fetchFriendshipStatus()
  }

  if (status === 'loading') {
    return null // Hide button while loading to prevent flash
  }

  if (status === 'friends') {
    return (
      <Button variant="outline" size={size} disabled className={className}>
        {showIcon && <UserCheck className="h-4 w-4 mr-2" />}
        Friends
      </Button>
    )
  }

  if (status === 'pending_sent') {
    return (
      <Button variant="outline" size={size} disabled className={className}>
        {showIcon && <Clock className="h-4 w-4 mr-2" />}
        Request Pending
      </Button>
    )
  }

  if (status === 'pending_received') {
    return (
      <Button variant="outline" size={size} disabled className={className}>
        {showIcon && <Clock className="h-4 w-4 mr-2" />}
        Respond to Request
      </Button>
    )
  }

  if (status === 'blocked_by_you' || status === 'blocked_by_them' || status === 'self') {
    return null // Don't show button if blocked or viewing own profile
  }

  return (
    <>
      <Button variant={variant} size={size} onClick={handleClick} className={className}>
        {showIcon && <UserPlus className="h-4 w-4 mr-2" />}
        Add Friend
      </Button>

      {showModal && (
        <FriendRequestModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          recipientId={userId}
          recipientName={userName}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}
