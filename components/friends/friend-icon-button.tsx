'use client'

import { useState, useEffect } from 'react'
import { UserPlus, UserCheck, Clock, UserX } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { FriendRequestModal } from '@/components/friends/friend-request-modal'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'

interface FriendIconButtonProps {
  userId: string
  userName: string
  className?: string
}

export function FriendIconButton({ userId, userName, className }: FriendIconButtonProps) {
  const [status, setStatus] = useState<string>('loading')
  const [showModal, setShowModal] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchFriendshipStatus()
  }, [userId])

  const fetchFriendshipStatus = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        setStatus('none')
        return
      }

      if (currentUser.id === userId) {
        setStatus('self')
        return
      }

      const session = await supabase.auth.getSession()
      const response = await fetch(`/api/friends/status?user_id=${userId}`, {
        headers: {
          Authorization: `Bearer ${session.data.session?.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStatus(data.status)
      } else {
        setStatus('none')
      }
    } catch (error) {
      console.error('Error fetching friendship status:', error)
      setStatus('none')
    }
  }

  const handleRequestSuccess = () => {
    setShowModal(false)
    toast({
      title: 'Friend request sent',
      description: `Your friend request has been sent to ${userName}`,
    })
    fetchFriendshipStatus()
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (status === 'none') {
      setShowModal(true)
    } else if (status === 'pending_received') {
      router.push('/profile/friends?tab=requests')
    }
  }

  if (status === 'loading' || status === 'self') {
    return null
  }

  const getIcon = () => {
    switch (status) {
      case 'friends':
        return <UserCheck className="h-4 w-4 text-green-600" />
      case 'pending_sent':
        return <Clock className="h-4 w-4 text-gray-400" />
      case 'pending_received':
        return <UserPlus className="h-4 w-4 text-blue-600" />
      case 'blocked_by_you':
      case 'blocked_by_them':
        return null
      default:
        return <UserPlus className="h-4 w-4 text-gray-600" />
    }
  }

  const getTitle = () => {
    switch (status) {
      case 'friends':
        return 'Already friends'
      case 'pending_sent':
        return 'Friend request pending'
      case 'pending_received':
        return 'Respond to friend request'
      case 'blocked_by_you':
      case 'blocked_by_them':
        return ''
      default:
        return 'Add friend'
    }
  }

  const icon = getIcon()
  if (!icon) return null

  return (
    <>
      <button
        onClick={handleClick}
        disabled={status === 'friends' || status === 'pending_sent'}
        title={getTitle()}
        className={`p-2 rounded-full transition-all ${
          status === 'friends'
            ? 'bg-green-100 cursor-default'
            : status === 'pending_sent'
            ? 'bg-gray-100 cursor-default'
            : status === 'pending_received'
            ? 'bg-blue-100 hover:bg-blue-200'
            : 'bg-gray-100 hover:bg-gray-200'
        } ${className}`}
      >
        {icon}
      </button>

      <FriendRequestModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        recipientId={userId}
        recipientName={userName}
        onSuccess={handleRequestSuccess}
      />
    </>
  )
}
