'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Menu, X, LogOut as LogOutIcon, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LogoLink } from '@/components/layout/logo-link'
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

    // Subscribe to new messages
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

  const desktopAuthActions = initialized
    ? user
      ? (
        <>
          <Button asChild size="sm" className="rounded-full text-sm font-semibold">
            <Link href="/rides/search">Find rides</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-full text-sm font-semibold"
          >
            <Link href="/rides/create">Offer a ride</Link>
          </Button>
          <Link href="/rides/my" className="text-sm font-medium hover:text-primary transition-colors">
            My rides
          </Link>
          <Link
            href="/messages"
            className="relative flex items-center text-sm font-medium hover:text-primary transition-colors"
          >
            <Inbox className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
          <Link href="/profile" className="flex items-center">
            {user.photo_url || user.profile_picture_url ? (
              <Image
                src={user.photo_url || user.profile_picture_url || ''}
                alt="Profile"
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-semibold">
                {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </div>
            )}
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? 'Signing out...' : 'Log out'}
          </Button>
        </>
      )
      : (
        <>
          <Button asChild size="sm" className="rounded-full text-sm font-semibold">
            <Link href="/rides/search">Find rides</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-full text-sm font-semibold"
          >
            <Link href="/rides/create">Offer a ride</Link>
          </Button>
          <Link href="/auth/login" className="text-sm font-medium hover:text-primary transition-colors">
            Log in
          </Link>
          <Button asChild size="sm" className="rounded-full">
            <Link href="/auth/signup">Sign up</Link>
          </Button>
        </>
      )
    : null

  const mobileLinks = (
    <div className="flex flex-col gap-2 px-6 py-4">
      <Button asChild size="lg" className="justify-start rounded-full text-base">
        <Link href="/rides/search" onClick={closeMenu}>
          Find rides
        </Link>
      </Button>
      <Button asChild variant="outline" size="lg" className="justify-start rounded-full text-base">
        <Link href="/rides/create" onClick={closeMenu}>
          Offer a ride
        </Link>
      </Button>
      {initialized && user && (
        <>
          <Button asChild variant="ghost" size="lg" className="justify-start text-base">
            <Link href="/rides/my" onClick={closeMenu}>
              My rides
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="justify-start text-base">
            <Link href="/messages" onClick={closeMenu}>
              <span className="flex items-center gap-2 relative">
                <Inbox className="h-4 w-4" />
                Messages
                {unreadCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </span>
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="justify-start text-base">
            <Link href="/profile" onClick={closeMenu}>
              <span className="flex items-center gap-2">
                {user.photo_url || user.profile_picture_url ? (
                  <Image
                    src={user.photo_url || user.profile_picture_url || ''}
                    alt="Profile"
                    width={20}
                    height={20}
                    className="h-5 w-5 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-xs font-semibold">
                    {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                )}
                My profile
              </span>
            </Link>
          </Button>
        </>
      )}
      {initialized && !user && (
        <>
          <Button asChild variant="ghost" size="lg" className="justify-start text-base">
            <Link href="/auth/login" onClick={closeMenu}>
              Log in
            </Link>
          </Button>
          <Button asChild size="lg" className="justify-start rounded-full text-base">
            <Link href="/auth/signup" onClick={closeMenu}>
              Sign up
            </Link>
          </Button>
        </>
      )}
      {initialized && user && (
        <Button
          variant="ghost"
          size="lg"
          className="justify-start text-base text-red-600 hover:text-red-600 hover:bg-red-50"
          onClick={handleSignOut}
          disabled={signingOut}
        >
          <LogOutIcon className="mr-2 h-4 w-4" />
          {signingOut ? 'Signing out...' : 'Log out'}
        </Button>
      )}
    </div>
  )

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-black/10 bg-white/80 backdrop-blur">
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <LogoLink />
          <div className="hidden lg:flex items-center gap-4">
            {desktopAuthActions}
          </div>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black hover:bg-black hover:text-white transition-colors lg:hidden"
            aria-label="Toggle navigation menu"
            onClick={handleToggleMenu}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <div
        className={cn(
          'lg:hidden transition-all duration-200 ease-out overflow-hidden border-t border-black/5 bg-white',
          menuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        {mobileLinks}
      </div>
    </header>
  )
}
