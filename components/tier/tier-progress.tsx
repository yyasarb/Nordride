'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { VerifiedRiderBadge, VerifiedDriverBadge } from '@/components/badges/verification-badges'
import { getTierRequirements, getTierProgress, type UserProfile, type UserTier } from '@/lib/tier/tier-utils'
import { CheckCircle, Circle, ArrowRight, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

type TierProgressTrackerProps = {
  profile: UserProfile
  vehicleCount: number
}

export function TierProgressTracker({ profile, vehicleCount }: TierProgressTrackerProps) {
  const progress = getTierProgress(profile, vehicleCount)
  const tierReqs = getTierRequirements(profile, vehicleCount)
  const [isExpanded, setIsExpanded] = useState(true)

  // If fully verified, show simplified view
  if (progress.current === 3) {
    return (
      <Card className="p-6 border-2 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <VerifiedRiderBadge size="lg" showTooltip />
              <VerifiedDriverBadge size="lg" showTooltip />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-700">Fully Verified</h3>
              <p className="text-sm text-green-600">
                🎉 Congratulations! You&apos;re fully verified and have access to all Nordride features.
              </p>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 border-2">
      <div className="space-y-6">
        {/* Collapsible Header */}
        <div
          className="flex items-start justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Verification Status</h3>
              <ChevronDown
                className={`h-5 w-5 text-gray-600 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {progress.current === 2 ? (
                <span className="text-blue-600 font-medium">Verified Rider</span>
              ) : (
                <span className="text-gray-600">Immediate Access</span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            {progress.current >= 2 && <VerifiedRiderBadge size="lg" showTooltip />}
          </div>
        </div>

        {/* Collapsible Content */}
        {isExpanded && (
          <>
            {/* Progress Bar (if not max tier) */}
            {progress.next && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    Progress to {tierReqs[progress.next - 1].name}
                  </span>
                  <span className="text-sm text-gray-600">{progress.progress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-500 ease-out"
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Tier Cards */}
            <div className="space-y-3">
              {tierReqs.map((tier) => {
                const isCurrent = tier.tier === progress.current
                const isCompleted = tier.tier < progress.current
                const isNext = tier.tier === progress.next

                return (
                  <div
                    key={tier.tier}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isCurrent
                        ? 'border-blue-500 bg-blue-50'
                        : isCompleted
                        ? 'border-green-500 bg-green-50'
                        : isNext
                        ? 'border-gray-300 bg-gray-50'
                        : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {tier.tier === 2 && <VerifiedRiderBadge size="sm" />}
                        {tier.tier === 3 && <VerifiedDriverBadge size="sm" />}
                        <div>
                          <h4 className="font-semibold text-sm">
                            {tier.name}
                          </h4>
                          <p className="text-xs text-gray-600">{tier.description}</p>
                        </div>
                      </div>
                      {isCompleted && (
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      )}
                    </div>

                    {/* Requirements */}
                    <div className="space-y-1.5 mb-3">
                      {tier.requirements.map((req, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          {req.completed ? (
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          )}
                          <span className={req.completed ? 'text-gray-700' : 'text-gray-500'}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Privileges */}
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-600 mb-1">Privileges:</p>
                      <ul className="text-xs text-gray-600 space-y-0.5">
                        {tier.privileges.map((priv, idx) => (
                          <li key={idx}>• {priv}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Call to Action */}
            {progress.next && progress.missing.length > 0 && (
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2">
                  Complete your profile to unlock {tierReqs[progress.next - 1].name}:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 mb-4">
                  {progress.missing.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-blue-600" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full rounded-full">
                  <Link href="/profile/edit">Complete Profile</Link>
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  )
}
