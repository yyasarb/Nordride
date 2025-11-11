'use client'

import { Bell, CheckCircle, XCircle, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useRealtime } from '@/contexts/realtime-context'

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
}

export default function NotificationsPage() {
  const router = useRouter()
  const { notifications, unreadNotificationsCount, markNotificationAsRead, markAllNotificationsAsRead } = useRealtime()

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already
    if (!notification.is_read) {
      await markNotificationAsRead(notification.id)
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            {unreadNotificationsCount > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                You have {unreadNotificationsCount} unread notification{unreadNotificationsCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          {unreadNotificationsCount > 0 && (
            <Button
              onClick={markAllNotificationsAsRead}
              variant="outline"
              size="sm"
              className="rounded-full"
            >
              Mark all as read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => {
              const hasLink = notification.ride_id
              const Component = hasLink ? 'button' : 'div'

              return (
                <Component
                  key={notification.id}
                  onClick={hasLink ? () => {
                    handleNotificationClick(notification)
                    router.push(`/rides/${notification.ride_id}`)
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
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{notification.body}</p>
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
