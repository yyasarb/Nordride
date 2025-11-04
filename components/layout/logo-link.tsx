import Link from 'next/link'
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
  return (
    <Link href="/" className={cn('flex items-center gap-3 group', className)}>
      <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold transition-transform group-hover:scale-105">
        N
      </div>
      {showWordmark && (
        <span className={cn('font-display text-2xl font-bold', wordmarkClassName)}>
          Nordride
        </span>
      )}
    </Link>
  )
}
