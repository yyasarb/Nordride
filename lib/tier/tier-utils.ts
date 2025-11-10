export type UserTier = 1 | 2 | 3

export type TierRequirements = {
  tier: UserTier
  name: string
  badge: string
  description: string
  requirements: {
    label: string
    completed: boolean
  }[]
  privileges: string[]
}

export type UserProfile = {
  email_verified?: boolean
  first_name?: string | null
  last_name?: string | null
  profile_picture_url?: string | null
  photo_url?: string | null
  languages?: string[] | null
  bio?: string | null
  current_tier?: number
  vehicle_count?: number
}

/**
 * Calculate user's current tier based on profile completion
 */
export function calculateUserTier(profile: UserProfile, vehicleCount: number = 0): UserTier {
  // TIER 1: Email verified + First & Last name
  const tier1Complete =
    profile.email_verified === true &&
    !!profile.first_name &&
    profile.first_name.trim() !== '' &&
    !!profile.last_name &&
    profile.last_name.trim() !== ''

  if (!tier1Complete) {
    return 1
  }

  // TIER 2: Tier 1 + Profile picture + At least 1 language
  const hasPhoto = !!(profile.profile_picture_url || profile.photo_url)
  const hasLanguage = !!(profile.languages && profile.languages.length > 0)

  if (!hasPhoto || !hasLanguage) {
    return 1
  }

  // TIER 3: Tier 2 + Bio (min 50 chars) + At least 1 vehicle
  const hasBio = !!(profile.bio && profile.bio.trim().length >= 50)
  const hasVehicle = vehicleCount > 0

  if (hasBio && hasVehicle) {
    return 3
  }

  return 2
}

/**
 * Get tier requirements and completion status
 */
export function getTierRequirements(profile: UserProfile, vehicleCount: number = 0): TierRequirements[] {
  const hasPhoto = !!(profile.profile_picture_url || profile.photo_url)
  const hasLanguage = !!(profile.languages && profile.languages.length > 0)
  const hasBio = !!(profile.bio && profile.bio.trim().length >= 50)
  const hasVehicle = vehicleCount > 0

  return [
    {
      tier: 1,
      name: 'Immediate Access',
      badge: 'None',
      description: 'Browse rides and view profiles',
      requirements: [
        {
          label: 'Email verified',
          completed: profile.email_verified === true
        },
        {
          label: 'First & Last name provided',
          completed: !!profile.first_name && !!profile.last_name
        }
      ],
      privileges: [
        'Browse rides',
        'View public profiles',
        'Read reviews'
      ]
    },
    {
      tier: 2,
      name: 'Verified Rider',
      badge: '🪪',
      description: 'Request rides and message drivers',
      requirements: [
        {
          label: 'Tier 1 complete',
          completed: profile.email_verified === true && !!profile.first_name && !!profile.last_name
        },
        {
          label: 'Profile picture uploaded',
          completed: hasPhoto
        },
        {
          label: 'At least 1 language selected',
          completed: hasLanguage
        }
      ],
      privileges: [
        'All Tier 1 privileges',
        'Request to join rides',
        'Message drivers'
      ]
    },
    {
      tier: 3,
      name: 'Verified Driver',
      badge: '🚗',
      description: 'Create and manage rides',
      requirements: [
        {
          label: 'Tier 2 complete',
          completed: hasPhoto && hasLanguage
        },
        {
          label: 'Bio (minimum 50 characters)',
          completed: hasBio
        },
        {
          label: 'At least 1 vehicle added',
          completed: hasVehicle
        }
      ],
      privileges: [
        'All Tier 2 privileges',
        'Create and manage rides',
        'Approve/deny ride requests'
      ]
    }
  ]
}

/**
 * Get next tier requirements
 */
export function getNextTierRequirements(currentTier: UserTier): TierRequirements | null {
  if (currentTier >= 3) return null

  const allTiers = getTierRequirements({}, 0)
  return allTiers[currentTier] // Returns next tier (current + 1)
}

/**
 * Calculate profile completion percentage for current tier
 */
export function getTierProgress(profile: UserProfile, vehicleCount: number = 0): {
  current: UserTier
  next: UserTier | null
  progress: number
  missing: string[]
} {
  const currentTier = calculateUserTier(profile, vehicleCount)
  const tierReqs = getTierRequirements(profile, vehicleCount)

  if (currentTier >= 3) {
    return {
      current: 3,
      next: null,
      progress: 100,
      missing: []
    }
  }

  const nextTierReqs = tierReqs[currentTier] // Next tier requirements
  const completedReqs = nextTierReqs.requirements.filter(r => r.completed).length
  const totalReqs = nextTierReqs.requirements.length
  const progress = Math.round((completedReqs / totalReqs) * 100)
  const missing = nextTierReqs.requirements
    .filter(r => !r.completed)
    .map(r => r.label)

  return {
    current: currentTier,
    next: (currentTier + 1) as UserTier,
    progress,
    missing
  }
}

/**
 * Get tier badge name
 */
export function getTierBadgeName(tier: UserTier): string {
  switch (tier) {
    case 3:
      return 'Verified Driver'
    case 2:
      return 'Verified Rider'
    default:
      return ''
  }
}

/**
 * Get tier color
 */
export function getTierColor(tier: UserTier): string {
  switch (tier) {
    case 3:
      return '#007BFF' // Blue
    case 2:
      return '#007BFF' // Blue
    default:
      return '#6B7280' // Gray
  }
}
