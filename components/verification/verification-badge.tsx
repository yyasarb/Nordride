/**
 * Verification Badge Component
 * Displays colored verification badges based on user tier
 *
 * Tier 1 (Grey): Basic Verified - Name confirmed
 * Tier 2 (Blue): Community Verified - Languages and interests shared
 * Tier 3 (Gold): Social Verified - Connected via social profile(s)
 */

import React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface VerificationBadgeProps {
  tier: 1 | 2 | 3
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
  className?: string
}

const tierConfig = {
  1: {
    color: '#9E9E9E', // Neutral Grey
    bgColor: 'bg-gray-500',
    label: 'Verified User',
    tooltip: 'Verified User: Name confirmed.',
  },
  2: {
    color: '#2196F3', // Nordride Blue
    bgColor: 'bg-blue-500',
    label: 'Community Verified',
    tooltip: 'Community Verified: Languages and interests shared.',
  },
  3: {
    color: '#FFC107', // Warm Gold
    bgColor: 'bg-yellow-500',
    label: 'Socially Verified',
    tooltip: 'Socially Verified: Connected via social profile(s).',
  },
}

const sizeConfig = {
  sm: {
    container: 'w-4 h-4',
    icon: 'w-2.5 h-2.5',
  },
  md: {
    container: 'w-5 h-5',
    icon: 'w-3 h-3',
  },
  lg: {
    container: 'w-6 h-6',
    icon: 'w-4 h-4',
  },
}

export function VerificationBadge({
  tier,
  size = 'md',
  showTooltip = true,
  className,
}: VerificationBadgeProps) {
  const config = tierConfig[tier]
  const sizeClasses = sizeConfig[size]

  if (!config) {
    return null
  }

  return (
    <div
      className={cn('inline-flex items-center justify-center', className)}
      title={showTooltip ? config.tooltip : undefined}
      aria-label={config.label}
    >
      <div
        className={cn(
          'rounded-full flex items-center justify-center',
          config.bgColor,
          sizeClasses.container
        )}
      >
        <Check
          className={cn('text-white stroke-[3]', sizeClasses.icon)}
          strokeWidth={3}
        />
      </div>
    </div>
  )
}

/**
 * Verification Badge with Label
 * Shows badge + text label inline
 */
export interface VerificationBadgeWithLabelProps extends VerificationBadgeProps {
  showLabel?: boolean
}

export function VerificationBadgeWithLabel({
  tier,
  size = 'md',
  showLabel = true,
  showTooltip = true,
  className,
}: VerificationBadgeWithLabelProps) {
  const config = tierConfig[tier]

  if (!config) {
    return null
  }

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <VerificationBadge tier={tier} size={size} showTooltip={showTooltip} />
      {showLabel && (
        <span
          className={cn(
            'font-medium',
            size === 'sm' && 'text-xs',
            size === 'md' && 'text-sm',
            size === 'lg' && 'text-base'
          )}
        >
          {config.label}
        </span>
      )}
    </div>
  )
}

/**
 * Get tier name for display
 */
export function getTierName(tier: 1 | 2 | 3): string {
  return tierConfig[tier]?.label || 'Verified User'
}

/**
 * Get tier tooltip text
 */
export function getTierTooltip(tier: 1 | 2 | 3): string {
  return tierConfig[tier]?.tooltip || ''
}

/**
 * Get tier color
 */
export function getTierColor(tier: 1 | 2 | 3): string {
  return tierConfig[tier]?.color || '#9E9E9E'
}
