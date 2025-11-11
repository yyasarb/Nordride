'use client'

import { useState } from 'react'
import { Bell, CheckCircle, XCircle, MessageSquare, ArrowRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useRealtime } from '@/contexts/realtime-context'

export function NotificationDropdown() {
  const router = useRouter()
  const { notifications, unreadNotificationsCount, markNotificationAsRead, markAllNotificationsAsRead } = useRealtime()
  const [isOpen, setIsOpen] = useState(false)

  // Only show first 5 notifications in dropdown
  const displayedNotifications = notifications.slice(0, 5)

  const handleNotificationClick = async (notification: any) => {
    // Mark as read
    if (!notification.is_read) {
      await markNotificationAsRead(notification.id)
    }

    // Navigate to related resource
    if (notification.ride_id) {
      setIsOpen(false)
      router.push(`/rides/${notification.ride_id}`)
    }
  }

  const getNotificationIcon = (type: string) => {
    if (type.includes('approved') || type.includes('completed')) {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    } else if (type.includes('rejected') || type.includes('cancelled') || type.includes('denied')) {
      return <XCircle className="h-4 w-4 text-red-600" />
    } else if (type.includes('request')) {
      return <Bell className="h-4 w-4 text-blue-600" />
    } else {
      return <MessageSquare className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <DropdownMenuTrigger className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors focus:outline-none">
        <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        {unreadNotificationsCount > 0 && (
          <span className="absolute top-0 right-0 h-4 w-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 max-h-[500px] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadNotificationsCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllNotificationsAsRead()}
              className="text-xs h-auto py-1 px-2"
            >
              Mark all as read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        {displayedNotifications.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">No notifications yet</p>
          </div>
        ) : (
          <div className="py-1">
            {displayedNotifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b last:border-b-0 ${
                  !notification.is_read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-0.5">
                      {notification.body}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div className="flex-shrink-0">
                      <div className="h-2 w-2 bg-red-600 rounded-full"></div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        <DropdownMenuSeparator />

        {/* View All Link */}
        <div className="px-4 py-2">
          <Link
            href="/notifications"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            View all notifications
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
