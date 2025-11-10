'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'
import { Bell, CheckCircle, XCircle, Calendar, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

type Notification = {
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
  // Legacy fields for backwards compatibility
  message?: string
  related_ride_id?: string | null
  related_user_id?: string | null
}

export default function NotificationsPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error fetching notifications:', error)
      } else {
        setNotifications(data || [])
      }
      setLoading(false)
    }

    fetchNotifications()

    // Subscribe to notifications changes (insert and update)
    const channel = supabase
      .channel('notifications-page')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) =>
            prev.map((n) => (n.id === payload.new.id ? payload.new as Notification : n))
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      )
    }
  }

  const markAllAsRead = async () => {
    if (!user) return

    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: now })
      .eq('user_id', user.id)
      .eq('is_read', false)
      .select()

    if (error) {
      console.error('Error marking all as read:', error)
    } else {
      console.log('Marked all as read, updated rows:', data?.length)
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true, read_at: n.is_read ? n.read_at : now })))
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already
    if (!notification.is_read) {
      const now = new Date().toISOString()
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: now })
        .eq('id', notification.id)
        .select()

      if (error) {
        console.error('Error marking notification as read:', error)
      } else {
        console.log('Marked notification as read:', data)
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, is_read: true, read_at: now } : n))
        )
      }
    }
  }

  const getNotificationIcon = (type: string) => {
    if (type.includes('approved') || type.includes('completed')) {
      return <CheckCircle className="h-5 w-5 text-green-600" />
    } else if (type.includes('rejected') || type.includes('cancelled') || type.includes('denied')) {
      return <XCircle className="h-5 w-5 text-red-600" />
    } else if (type.includes('request')) {
      return <Bell className="h-5 w-5 text-blue-600" />
    } else {
      return <MessageSquare className="h-5 w-5 text-gray-600" />
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view notifications</p>
          <Link href="/auth/login" className="text-black underline mt-2 inline-block">
            Log in
          </Link>
        </div>
      </div>
    )
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="outline"
              size="sm"
              className="rounded-full"
            >
              Mark all as read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => {
              const hasLink = notification.ride_id || notification.related_ride_id
              const Component = hasLink ? 'button' : 'div'

              return (
                <Component
                  key={notification.id}
                  onClick={hasLink ? () => {
                    handleNotificationClick(notification)
                    router.push(`/rides/${notification.ride_id || notification.related_ride_id}`)
                  } : undefined}
                  className={`w-full text-left bg-white dark:bg-gray-800 rounded-lg p-4 border transition-all ${
                    notification.is_read
                      ? 'border-gray-200 dark:border-gray-700'
                      : 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  } ${hasLink ? 'cursor-pointer hover:shadow-md hover:border-blue-600 dark:hover:border-blue-300' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{notification.title || notification.message}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{notification.body || notification.message}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.is_read && (
                        <div className="h-2 w-2 bg-red-600 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                  </div>
                </Component>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
