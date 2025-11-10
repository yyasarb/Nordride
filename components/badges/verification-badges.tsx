import React from 'react'

type BadgeSize = 'sm' | 'md' | 'lg'

const sizeMap = {
  sm: { icon: 16, badge: 20, verified: 8 },
  md: { icon: 20, badge: 24, verified: 10 },
  lg: { icon: 24, badge: 28, verified: 12 }
}

type VerifiedRiderBadgeProps = {
  size?: BadgeSize
  className?: string
  showTooltip?: boolean
}

export function VerifiedRiderBadge({
  size = 'md',
  className = '',
  showTooltip = false
}: VerifiedRiderBadgeProps) {
  const sizes = sizeMap[size]

  return (
    <div className={`relative inline-flex ${className}`} title={showTooltip ? 'Verified Rider – Profile verified and photo added' : undefined}>
      <svg
        width={sizes.badge}
        height={sizes.badge}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative"
      >
        {/* Person icon */}
        <circle cx="12" cy="8" r="4" fill="#6B7280" />
        <path
          d="M4 20c0-4.418 3.582-8 8-8s8 3.582 8 8"
          stroke="#6B7280"
          strokeWidth="2"
          fill="none"
        />

        {/* Verified checkmark badge */}
        <circle cx="18" cy="18" r="6" fill="#007BFF" className="drop-shadow-md" />
        <path
          d="M16 18l1.5 1.5 3-3"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  )
}

type VerifiedDriverBadgeProps = {
  size?: BadgeSize
  className?: string
  showTooltip?: boolean
}

export function VerifiedDriverBadge({
  size = 'md',
  className = '',
  showTooltip = false
}: VerifiedDriverBadgeProps) {
  const sizes = sizeMap[size]

  return (
    <div className={`relative inline-flex ${className}`} title={showTooltip ? 'Verified Driver – Full profile with vehicle and bio' : undefined}>
      <svg
        width={sizes.badge}
        height={sizes.badge}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative"
      >
        {/* Car icon */}
        <path
          d="M5 11l1.5-4.5h11L19 11M5 11v6a1 1 0 001 1h1a1 1 0 001-1v-1h8v1a1 1 0 001 1h1a1 1 0 001-1v-6M5 11h14"
          stroke="#6B7280"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="7.5" cy="14" r="0.75" fill="#6B7280" />
        <circle cx="16.5" cy="14" r="0.75" fill="#6B7280" />

        {/* Verified checkmark badge */}
        <circle cx="18" cy="18" r="6" fill="#007BFF" className="drop-shadow-md" />
        <path
          d="M16 18l1.5 1.5 3-3"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  )
}

type TierBadgeProps = {
  tier: number
  size?: BadgeSize
  className?: string
  showTooltip?: boolean
}

export function TierBadge({ tier, size = 'md', className = '', showTooltip = false }: TierBadgeProps) {
  if (tier === 3) {
    return <VerifiedDriverBadge size={size} className={className} showTooltip={showTooltip} />
  } else if (tier === 2) {
    return <VerifiedRiderBadge size={size} className={className} showTooltip={showTooltip} />
  }
  return null
}
