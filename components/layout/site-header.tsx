'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Menu, X, LogOut as LogOutIcon, MessageSquare } from 'lucide-react'
import { LogoLink } from '@/components/layout/logo-link'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

export function SiteHeader() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const initialized = useAuthStore((state) => state.initialized)
  const [menuOpen, setMenuOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [userProfile, setUserProfile] = useState<any>(null)

  const closeMenu = useCallback(() => setMenuOpen(false), [])

  const handleToggleMenu = () => {
    setMenuOpen((prev) => !prev)
  }

  const handleSignOut = useCallback(async () => {
    try {
      setSigningOut(true)
      await supabase.auth.signOut()
      closeMenu()
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
      setUnreadCount(0)
      return
    }

    const fetchUnreadCount = async () => {
      try {
        const { data: messages } = await supabase
          .from('messages')
          .select('id, thread_id, sender_id, is_read')
          .eq('is_read', false)
          .neq('sender_id', user.id)

        setUnreadCount(messages?.length || 0)
      } catch (error) {
        console.error('Error fetching unread count:', error)
      }
    }

    fetchUnreadCount()

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
          fetchUnreadCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <LogoLink />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link href="/rides/search" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">
              Find a ride
            </Link>
            <Link href="/rides/create" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">
              Offer a ride
            </Link>
            {user && (
              <>
                <Link href="/rides/my" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">
                  My rides
                </Link>
                <Link href="/messages" className="relative text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">
                  <MessageSquare className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
              </>
            )}
          </nav>

          {/* Desktop Auth Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <ThemeToggle />
            {initialized && user ? (
              <>
                <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
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
                </Link>
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                >
                  {signingOut ? 'Signing out...' : 'Log out'}
                </button>
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

          {/* Mobile Menu Button and Theme Toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle navigation menu"
              onClick={handleToggleMenu}
            >
              {menuOpen ? <X className="h-6 w-6 text-gray-900 dark:text-gray-100" /> : <Menu className="h-6 w-6 text-gray-900 dark:text-gray-100" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'lg:hidden transition-all duration-200 ease-out overflow-hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900',
          menuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="flex flex-col gap-1 px-4 py-4">
          <Link
            href="/rides/search"
            onClick={closeMenu}
            className="px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Find a ride
          </Link>
          <Link
            href="/rides/create"
            onClick={closeMenu}
            className="px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Offer a ride
          </Link>
          {user && (
            <>
              <Link
                href="/rides/my"
                onClick={closeMenu}
                className="px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                My rides
              </Link>
              <Link
                href="/messages"
                onClick={closeMenu}
                className="px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center justify-between"
              >
                <span>Messages</span>
                {unreadCount > 0 && (
                  <span className="h-6 w-6 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              <Link
                href="/profile"
                onClick={closeMenu}
                className="px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                My profile
              </Link>
              <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="px-4 py-3 text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors text-left"
              >
                {signingOut ? 'Signing out...' : 'Log out'}
              </button>
            </>
          )}
          {!user && initialized && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
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
