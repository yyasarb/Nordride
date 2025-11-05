'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
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
    } finally {
      setSigningOut(false)
    }
  }, [closeMenu, router])

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
            className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
          >
            <Inbox className="h-4 w-4" />
            Inbox
          </Link>
          <Link href="/profile" className="text-sm font-medium hover:text-primary transition-colors">
            My profile
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
              <span className="flex items-center gap-2">
                <Inbox className="h-4 w-4" />
                Inbox
              </span>
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="justify-start text-base">
            <Link href="/profile" onClick={closeMenu}>
              My profile
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
