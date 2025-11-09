'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X, LogOut as LogOutIcon, MessageSquare, Bell, Inbox, User, ChevronDown } from 'lucide-react'
import { LogoLink } from '@/components/layout/logo-link'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function SiteHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)
  const initialized = useAuthStore((state) => state.initialized)
  const [menuOpen, setMenuOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0)
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const closeMenu = useCallback(() => setMenuOpen(false), [])

  const handleToggleMenu = () => {
    setMenuOpen((prev) => !prev)
  }

  const handleSignOut = useCallback(async () => {
    try {
      setSigningOut(true)
      await supabase.auth.signOut()
      closeMenu()
      setDropdownOpen(false)
      router.push('/')
      router.refresh()
    } finally {
      setSigningOut(false)
    }
  }, [closeMenu, router])

  // Fetch user profile data
  useEffect(() => {
    if (!user) {
      setUserProfile(null)
      return
    }

    const fetchUserProfile = async () => {
      try {
        const { data } = await supabase
          .from('users')
          .select('first_name, last_name, profile_picture_url, photo_url')
          .eq('id', user.id)
          .single()

        if (data) {
          setUserProfile(data)
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      }
    }

    fetchUserProfile()
  }, [user])

  // Fetch unread message count
  useEffect(() => {
    if (!user) {
      setUnreadMessagesCount(0)
      return
    }

    const fetchUnreadMessagesCount = async () => {
      try {
        const { data: messages } = await supabase
          .from('messages')
          .select('id, thread_id, sender_id, is_read')
          .eq('is_read', false)
          .neq('sender_id', user.id)

        setUnreadMessagesCount(messages?.length || 0)
      } catch (error) {
        console.error('Error fetching unread messages count:', error)
      }
    }

    fetchUnreadMessagesCount()

    const channel = supabase
      .channel('unread-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchUnreadMessagesCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  // Fetch unread notifications count
  useEffect(() => {
    if (!user) {
      setUnreadNotificationsCount(0)
      return
    }

    const fetchUnreadNotificationsCount = async () => {
      try {
        const { data: notifications } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_read', false)

        setUnreadNotificationsCount(notifications?.length || 0)
      } catch (error) {
        console.error('Error fetching unread notifications count:', error)
      }
    }

    fetchUnreadNotificationsCount()

    const channel = supabase
      .channel('unread-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchUnreadNotificationsCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const isActive = (path: string) => pathname === path

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - Left */}
          <div className="flex-shrink-0">
            <LogoLink />
          </div>

          {/* Center Navigation - Desktop */}
          <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <Link
              href="/rides/create"
              className={cn(
                "text-sm font-medium transition-colors relative",
                isActive('/rides/create')
                  ? "text-black dark:text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-black dark:after:bg-white after:-mb-[21px]"
                  : "text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
              )}
            >
              Offer a Ride
            </Link>
            <Link
              href="/rides/search"
              className={cn(
                "text-sm font-medium transition-colors relative",
                isActive('/rides/search')
                  ? "text-black dark:text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-black dark:after:bg-white after:-mb-[21px]"
                  : "text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
              )}
            >
              Find a Ride
            </Link>
          </nav>

          {/* Right Section - Desktop Auth Actions */}
          <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
            {initialized && user ? (
              <>
                {/* Bell Icon - System Notifications */}
                <Link href="/notifications" className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                  <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                    </span>
                  )}
                </Link>

                {/* Profile Dropdown */}
                <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen} modal={false}>
                  <DropdownMenuTrigger className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none">
                    {userProfile?.photo_url || userProfile?.profile_picture_url ? (
                      <Image
                        src={userProfile.photo_url || userProfile.profile_picture_url || ''}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-semibold">
                        {userProfile?.first_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </div>
                    )}
                    <ChevronDown className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    {/* User Info Header */}
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {userProfile?.first_name && userProfile?.last_name
                            ? `${userProfile.first_name} ${userProfile.last_name}`
                            : 'User'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {/* Menu Items */}
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/rides/my" className="flex items-center gap-2 cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        <span>My Rides</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/messages" className="flex items-center gap-2 cursor-pointer">
                        <Inbox className="h-4 w-4" />
                        <span>Messages</span>
                        {unreadMessagesCount > 0 && (
                          <span className="ml-auto h-5 w-5 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                            {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                          </span>
                        )}
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Theme Toggle */}
                    <div className="px-2 py-2">
                      <ThemeToggle />
                    </div>

                    <DropdownMenuSeparator />

                    {/* Logout */}
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      disabled={signingOut}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2 w-full bg-black dark:bg-white text-white dark:text-black px-3 py-2 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                        <LogOutIcon className="h-4 w-4" />
                        <span className="font-medium">{signingOut ? 'Signing out...' : 'Log Out'}</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">
                  Log in
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              type="button"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle navigation menu"
              onClick={handleToggleMenu}
            >
              {menuOpen ? <X className="h-6 w-6 text-gray-900 dark:text-white" /> : <Menu className="h-6 w-6 text-gray-900 dark:text-white" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'lg:hidden transition-all duration-200 ease-out overflow-hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900',
          menuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="flex flex-col gap-1 px-4 py-4">
          <Link
            href="/rides/search"
            onClick={closeMenu}
            className="px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Find a Ride
          </Link>
          <Link
            href="/rides/create"
            onClick={closeMenu}
            className="px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Offer a Ride
          </Link>
          {user && (
            <>
              <Link
                href="/rides/my"
                onClick={closeMenu}
                className="px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                My Rides
              </Link>
              <Link
                href="/notifications"
                onClick={closeMenu}
                className="px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center justify-between"
              >
                <span>Notifications</span>
                {unreadNotificationsCount > 0 && (
                  <span className="h-6 w-6 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </span>
                )}
              </Link>
              <Link
                href="/messages"
                onClick={closeMenu}
                className="px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center justify-between"
              >
                <span>Messages</span>
                {unreadMessagesCount > 0 && (
                  <span className="h-6 w-6 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                  </span>
                )}
              </Link>
              <Link
                href="/profile"
                onClick={closeMenu}
                className="px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                My Profile
              </Link>
              <div className="border-t border-gray-200 dark:border-gray-800 my-2" />
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="px-4 py-3 text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-left"
              >
                {signingOut ? 'Signing out...' : 'Log out'}
              </button>
            </>
          )}
          {!user && initialized && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-800 my-2" />
              <Link
                href="/auth/login"
                onClick={closeMenu}
                className="px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/auth/signup"
                onClick={closeMenu}
                className="mx-4 my-2 bg-black dark:bg-white text-white dark:text-black px-4 py-3 rounded-full text-base font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-center"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
