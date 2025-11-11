'use client'

/**
 * Tier Progress Tracker Component
 * Shows user's current verification tier and next steps
 */

import React, { useEffect, useState } from 'react'
import { Check, Lock, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { VerificationBadge } from './verification-badge'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface TierRequirementsStatus {
  current_tier: number
  tier_1: {
    complete: boolean
    requirements: {
      first_name: boolean
      last_name: boolean
    }
  }
  tier_2: {
    complete: boolean
    requirements: {
      languages: boolean
      languages_count: number
      interests: boolean
      interests_count: number
    }
  }
  tier_3: {
    complete: boolean
    requirements: {
      social_accounts: boolean
      social_count: number
      facebook: boolean
      instagram: boolean
      spotify: boolean
    }
  }
  verified_social_accounts: string[]
  next_tier: number | null
}

interface TierProgressTrackerProps {
  userId: string
  onProfileUpdate?: () => void
}

export function TierProgressTracker({
  userId,
  onProfileUpdate,
}: TierProgressTrackerProps) {
  const [status, setStatus] = useState<TierRequirementsStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTierStatus()
  }, [userId])

  const loadTierStatus = async () => {
    try {
      const { data, error } = await supabase.rpc('get_tier_requirements_status', {
        user_id_param: userId,
      })

      if (error) throw error
      setStatus(data as TierRequirementsStatus)
    } catch (error) {
      console.error('Error loading tier status:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !status) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </Card>
    )
  }

  const progress = (status.current_tier / 3) * 100

  return (
    <Card className="p-6 border-2">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-xl font-bold">Verification Status</h3>
            <p className="text-sm text-gray-600 mt-1">
              Complete your profile to unlock more features
            </p>
          </div>
          <VerificationBadge tier={status.current_tier as 1 | 2 | 3} size="lg" />
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Tier {status.current_tier} of 3</span>
            <span className="text-gray-600">{Math.round(progress)}% complete</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-500 rounded-full"
              style={{
                width: `${progress}%`,
                background:
                  status.current_tier === 3
                    ? '#FFC107'
                    : status.current_tier === 2
                      ? '#2196F3'
                      : '#9E9E9E',
              }}
            />
          </div>
        </div>

        {/* Tier Cards */}
        <div className="space-y-3">
          {/* Tier 1 */}
          <TierCard
            tier={1}
            title="Basic Verified"
            description="Name confirmed"
            complete={status.tier_1.complete}
            current={status.current_tier === 1}
            requirements={[
              {
                label: 'First Name',
                met: status.tier_1.requirements.first_name,
              },
              {
                label: 'Last Name',
                met: status.tier_1.requirements.last_name,
              },
            ]}
          />

          {/* Tier 2 */}
          <TierCard
            tier={2}
            title="Community Verified"
            description="Languages and interests shared"
            complete={status.tier_2.complete}
            current={status.current_tier === 2}
            locked={!status.tier_1.complete}
            requirements={[
              {
                label: `At least 1 language (${status.tier_2.requirements.languages_count} added)`,
                met: status.tier_2.requirements.languages,
              },
              {
                label: `At least 1 interest (${status.tier_2.requirements.interests_count} added)`,
                met: status.tier_2.requirements.interests,
              },
            ]}
          />

          {/* Tier 3 */}
          <TierCard
            tier={3}
            title="Social Verified"
            description="Connected via social profile(s)"
            complete={status.tier_3.complete}
            current={status.current_tier === 3}
            locked={!status.tier_2.complete}
            requirements={[
              {
                label: `At least 1 social account (${status.tier_3.requirements.social_count} connected)`,
                met: status.tier_3.requirements.social_accounts,
              },
            ]}
            socialAccounts={{
              facebook: status.tier_3.requirements.facebook,
              instagram: status.tier_3.requirements.instagram,
              spotify: status.tier_3.requirements.spotify,
            }}
          />
        </div>

        {/* Call to Action */}
        {status.next_tier && (
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600 mb-3">
              You&apos;re {3 - status.current_tier} {3 - status.current_tier === 1 ? 'step' : 'steps'}{' '}
              away from earning your{' '}
              <span className="font-semibold text-yellow-600">Gold Verification</span> badge!
            </p>
            <Link href="/profile/edit">
              <Button className="w-full rounded-full" size="lg">
                Complete Your Profile
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        )}

        {status.current_tier === 3 && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
              <Check className="h-6 w-6 text-yellow-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-yellow-900">Fully Verified!</p>
                <p className="text-sm text-yellow-700">
                  You have full access to all platform features.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

interface TierCardProps {
  tier: 1 | 2 | 3
  title: string
  description: string
  complete: boolean
  current: boolean
  locked?: boolean
  requirements: Array<{
    label: string
    met: boolean
  }>
  socialAccounts?: {
    facebook: boolean
    instagram: boolean
    spotify: boolean
  }
}

function TierCard({
  tier,
  title,
  description,
  complete,
  current,
  locked = false,
  requirements,
  socialAccounts,
}: TierCardProps) {
  return (
    <div
      className={`p-4 rounded-xl border-2 transition-all ${
        complete
          ? 'bg-green-50 border-green-200'
          : current
            ? 'bg-blue-50 border-blue-300'
            : locked
              ? 'bg-gray-50 border-gray-200 opacity-60'
              : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 pt-0.5">
          {complete ? (
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="h-4 w-4 text-white stroke-[3]" />
            </div>
          ) : locked ? (
            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
              <Lock className="h-3.5 w-3.5 text-gray-500" />
            </div>
          ) : (
            <VerificationBadge tier={tier} size="md" showTooltip={false} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900">{title}</h4>
            {complete && (
              <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                Complete
              </span>
            )}
            {current && !complete && (
              <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                In Progress
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">{description}</p>

          {/* Requirements */}
          <ul className="space-y-1">
            {requirements.map((req, index) => (
              <li
                key={index}
                className={`text-xs flex items-center gap-2 ${
                  req.met ? 'text-green-700' : 'text-gray-500'
                }`}
              >
                {req.met ? (
                  <Check className="h-3 w-3 flex-shrink-0" />
                ) : (
                  <div className="h-3 w-3 rounded-full border-2 border-gray-300 flex-shrink-0" />
                )}
                <span>{req.label}</span>
              </li>
            ))}
          </ul>

          {/* Social Accounts Detail */}
          {socialAccounts && !locked && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-1.5">Connected accounts:</p>
              <div className="flex gap-2">
                {Object.entries(socialAccounts).map(([platform, connected]) => (
                  <div
                    key={platform}
                    className={`text-xs px-2 py-1 rounded-md ${
                      connected
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    {connected && ' ✓'}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
