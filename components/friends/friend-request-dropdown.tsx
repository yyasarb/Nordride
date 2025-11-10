'use client'

import { useState, useEffect } from 'react'
import { Users, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface FriendRequest {
  friendship_id: string
  id: string
  first_name: string
  last_name: string
  profile_picture_url?: string
  photo_url?: string
  message?: string
  requested_at: string
}

export function FriendRequestDropdown() {
  const [requests, setRequests] = useState<FriendRequest[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchRequests()
    setupRealtimeSubscription()
  }, [])

  const fetchRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const session = await supabase.auth.getSession()
      const response = await fetch('/api/friends/requests?type=incoming&limit=2', {
        headers: {
          Authorization: `Bearer ${session.data.session?.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests || [])
        setCount(data.pagination?.total || 0)
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    const { data: { user } } = supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return

      const channel = supabase
        .channel('friend-requests')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'friendships',
            filter: `friend_id=eq.${data.user.id}`,
          },
          () => {
            fetchRequests()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    })
  }

  const handleAccept = async (friendshipId: string, userName: string) => {
    try {
      const session = await supabase.auth.getSession()
      const response = await fetch('/api/friends/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.data.session?.access_token}`,
        },
        body: JSON.stringify({ friendship_id: friendshipId }),
      })

      if (response.ok) {
        toast({
          title: 'Friend request accepted',
          description: `You and ${userName} are now friends`,
        })
        fetchRequests()
      } else {
        const data = await response.json()
        toast({
          title: 'Error',
          description: data.error || 'Failed to accept request',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error accepting request:', error)
      toast({
        title: 'Error',
        description: 'Failed to accept request',
        variant: 'destructive',
      })
    }
  }

  const handleDecline = async (friendshipId: string) => {
    try {
      const session = await supabase.auth.getSession()
      const response = await fetch('/api/friends/decline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.data.session?.access_token}`,
        },
        body: JSON.stringify({ friendship_id: friendshipId, block_user: false }),
      })

      if (response.ok) {
        toast({
          title: 'Friend request declined',
        })
        fetchRequests()
      } else {
        const data = await response.json()
        toast({
          title: 'Error',
          description: data.error || 'Failed to decline request',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error declining request:', error)
      toast({
        title: 'Error',
        description: 'Failed to decline request',
        variant: 'destructive',
      })
    }
  }

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Users className="h-5 w-5" />
          {count > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {count > 9 ? '9+' : count}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="px-3 py-2 font-semibold text-sm">Friend Requests</div>
        <DropdownMenuSeparator />

        {loading ? (
          <div className="px-3 py-4 text-center text-sm text-gray-500">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="px-3 py-4 text-center text-sm text-gray-500">
            No pending friend requests
          </div>
        ) : (
          <>
            {requests.map((request) => (
              <div key={request.friendship_id} className="px-3 py-2 border-b last:border-0">
                <div className="flex items-start gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                    {(request.profile_picture_url || request.photo_url) ? (
                      <Image
                        src={request.profile_picture_url || request.photo_url || ''}
                        alt={`${request.first_name} ${request.last_name}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold bg-gradient-to-br from-purple-600 to-blue-600">
                        {request.first_name?.[0]}{request.last_name?.[0]}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {request.first_name} {request.last_name}
                    </p>
                    {request.message && (
                      <p className="text-xs text-gray-600 truncate mt-0.5">
                        {request.message}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {getRelativeTime(request.requested_at)}
                    </p>

                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        onClick={() => handleAccept(request.friendship_id, `${request.first_name} ${request.last_name}`)}
                        className="h-7 text-xs flex-1"
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDecline(request.friendship_id)}
                        className="h-7 text-xs flex-1"
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {count > 2 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push('/profile/friends?tab=requests')}
                  className="cursor-pointer justify-center"
                >
                  View All {count} Requests
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
