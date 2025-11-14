'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth-store'

interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  body: string
  is_read: boolean
  ride_id: string | null
  booking_request_id: string | null
  metadata: any
  created_at: string
  read_at: string | null
}

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

interface RealtimeContextType {
  // Notifications
  notifications: Notification[]
  unreadNotificationsCount: number
  refreshNotifications: () => Promise<void>
  markNotificationAsRead: (id: string) => Promise<void>
  markAllNotificationsAsRead: () => Promise<void>

  // Friend Requests
  friendRequests: FriendRequest[]
  friendRequestsCount: number
  refreshFriendRequests: () => Promise<void>

  // Unread Messages Count
  unreadMessagesCount: number
  refreshUnreadMessages: () => Promise<void>
}

const RealtimeContext = createContext<RealtimeContextType | null>(null)

export function useRealtime() {
  const context = useContext(RealtimeContext)
  if (!context) {
    throw new Error('useRealtime must be used within RealtimeProvider')
  }
  return context
}

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user)
  const supabase = createClient()

  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0)

  // Friend requests state
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [friendRequestsCount, setFriendRequestsCount] = useState(0)

  // Messages state
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0)

  // Fetch notifications
  const refreshNotifications = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (!error && data) {
        setNotifications(data)
        setUnreadNotificationsCount(data.filter((n) => !n.is_read).length)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  // Fetch friend requests
  const refreshFriendRequests = async () => {
    if (!user) return

    try {
      const session = await supabase.auth.getSession()
      const response = await fetch('/api/friends/requests?type=incoming&limit=50', {
        headers: {
          Authorization: `Bearer ${session.data.session?.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setFriendRequests(data.requests || [])
        setFriendRequestsCount(data.pagination?.total || 0)
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error)
    }
  }

  // Fetch unread messages count
  const refreshUnreadMessages = async () => {
    if (!user) return

    try {
      // Count unread messages where user is not the sender
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .neq('sender_id', user.id)
        .eq('is_read', false)
        .eq('system_generated', false) // Exclude system messages from count

      if (!error && count !== null) {
        setUnreadMessagesCount(count)
      }
    } catch (error) {
      console.error('Error fetching unread messages:', error)
    }
  }

  // Mark notification as read
  const markNotificationAsRead = async (id: string) => {
    if (!user) return

    const now = new Date().toISOString()
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: now })
      .eq('id', id)

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true, read_at: now } : n))
      )
      setUnreadNotificationsCount((prev) => Math.max(0, prev - 1))
    }
  }

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    if (!user) return

    const now = new Date().toISOString()
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: now })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, read_at: n.is_read ? n.read_at : now }))
      )
      setUnreadNotificationsCount(0)
    }
  }

  // Initial data fetch
  useEffect(() => {
    if (!user) {
      setNotifications([])
      setUnreadNotificationsCount(0)
      setFriendRequests([])
      setFriendRequestsCount(0)
      setUnreadMessagesCount(0)
      return
    }

    // Fetch all data on mount
    refreshNotifications()
    refreshFriendRequests()
    refreshUnreadMessages()
  }, [user?.id])

  // Single Realtime subscription for all tables
  useEffect(() => {
    if (!user) return

    // Create ONE channel with multiple postgres_changes listeners
    const channel = supabase
      .channel('unified-realtime')
      // Listen to notifications
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotifications((prev) => [payload.new as Notification, ...prev])
            if (!(payload.new as Notification).is_read) {
              setUnreadNotificationsCount((prev) => prev + 1)
            }
          } else if (payload.eventType === 'UPDATE') {
            setNotifications((prev) =>
              prev.map((n) => (n.id === payload.new.id ? (payload.new as Notification) : n))
            )
            // Recalculate unread count
            refreshNotifications()
          }
        }
      )
      // Listen to friendships
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
          filter: `friend_id=eq.${user.id}`,
        },
        () => {
          refreshFriendRequests()
        }
      )
      // Listen to messages - refresh when any message is inserted/updated
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          refreshUnreadMessages()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  const value: RealtimeContextType = {
    notifications,
    unreadNotificationsCount,
    refreshNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    friendRequests,
    friendRequestsCount,
    refreshFriendRequests,
    unreadMessagesCount,
    refreshUnreadMessages,
  }

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>
}
