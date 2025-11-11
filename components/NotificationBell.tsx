'use client'

import { useState } from 'react'
import { Bell, X, Check, Clock, AlertCircle, Users } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { useRealtime } from '@/contexts/realtime-context'

interface Notification {
  id: string
  type: string
  title: string
  body: string
  is_read: boolean
  created_at: string
  ride_id?: string
  booking_request_id?: string
  metadata?: any
}

export default function NotificationBell({ userId }: { userId: string }) {
  const { notifications, unreadNotificationsCount, markNotificationAsRead, markAllNotificationsAsRead } = useRealtime()
  const [showDropdown, setShowDropdown] = useState(false)

  // Only show the first 10 notifications in the dropdown
  const displayedNotifications = notifications.slice(0, 10)

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId)
  }

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead()
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_approved':
      case 'booking_declined':
        return <Check className="h-4 w-4 text-green-600" />
      case 'booking_request':
      case 'booking_expired':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'reminder_24h':
      case 'reminder_12h':
      case 'reminder_1h':
        return <Bell className="h-4 w-4 text-orange-600" />
      case 'ride_alert':
        return <AlertCircle className="h-4 w-4 text-purple-600" />
      default:
        return <Users className="h-4 w-4 text-gray-600" />
    }
  }

  const getNotificationLink = (notification: Notification) => {
    if (notification.ride_id) {
      return `/rides/${notification.ride_id}`
    }
    if (notification.booking_request_id) {
      return `/rides/my`
    }
    return '/notifications'
  }

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-gray-700" />
        {unreadNotificationsCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-50 max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-xl">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setShowDropdown(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {displayedNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No notifications yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    We&apos;ll notify you about ride updates
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {displayedNotifications.map((notification) => (
                    <Link
                      key={notification.id}
                      href={getNotificationLink(notification)}
                      onClick={() => {
                        if (!notification.is_read) {
                          handleMarkAsRead(notification.id)
                        }
                        setShowDropdown(false)
                      }}
                      className={`block p-4 hover:bg-gray-50 transition-colors ${
                        !notification.is_read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 p-2 rounded-full ${
                          !notification.is_read ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-medium ${
                              !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </p>
                            {!notification.is_read && (
                              <span className="flex-shrink-0 h-2 w-2 bg-blue-600 rounded-full mt-1"></span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {notification.body}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {displayedNotifications.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <Link
                  href="/notifications"
                  onClick={() => setShowDropdown(false)}
                  className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all notifications
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
