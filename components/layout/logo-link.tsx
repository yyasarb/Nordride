'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

type LogoLinkProps = {
  className?: string
  showWordmark?: boolean
  wordmarkClassName?: string
}

export function LogoLink({
  className,
  showWordmark = true,
  wordmarkClassName,
}: LogoLinkProps) {
  const pathname = usePathname()
  const isWaitlistPage = pathname === '/waitlist'

  return (
    <Link href="/" className={cn('flex items-center gap-3 group', className)}>
      <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold transition-transform group-hover:scale-105">
        N
      </div>
      {showWordmark && (
        <span className={cn('text-2xl font-bold', isWaitlistPage ? 'text-gray-900 dark:text-white' : '', wordmarkClassName)}>
          Nordride
        </span>
      )}
    </Link>
  )
}
