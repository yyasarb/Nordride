'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle, ArrowRight } from 'lucide-react'
import { ProfileCompletionStatus } from '@/lib/profile-completion'

interface ProfileCompletionBannerProps {
  status: ProfileCompletionStatus
  action?: string
  showIfComplete?: boolean
}

export function ProfileCompletionBanner({
  status,
  action = 'access all features',
  showIfComplete = false
}: ProfileCompletionBannerProps) {
  if (status.isComplete && !showIfComplete) {
    return null
  }

  if (status.isComplete) {
    return (
      <Card className="p-4 mb-6 bg-green-50 border-2 border-green-200">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-green-800 font-semibold">
              Your profile is complete!
            </p>
            <p className="text-green-700 text-sm">
              You have full access to all Nordride features.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4 mb-6 bg-amber-50 border-2 border-amber-200">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-amber-900 font-semibold mb-1">
            Complete your profile to {action}
          </p>
          <p className="text-amber-800 text-sm mb-3">
            Missing: {status.missingFields.join(', ')}
          </p>
          <ul className="text-sm text-amber-800 space-y-1 mb-3">
            <li className="flex items-center gap-2">
              {status.hasProfilePicture ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <div className="h-4 w-4 rounded-full border-2 border-amber-400" />
              )}
              Profile picture
            </li>
            <li className="flex items-center gap-2">
              {status.hasVerifiedEmail ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <div className="h-4 w-4 rounded-full border-2 border-amber-400" />
              )}
              Verified email
            </li>
            <li className="flex items-center gap-2">
              {status.hasLanguages ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <div className="h-4 w-4 rounded-full border-2 border-amber-400" />
              )}
              At least one language
            </li>
            {status.hasVehicle !== undefined && (
              <li className="flex items-center gap-2">
                {status.hasVehicle ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-amber-400" />
                )}
                At least one vehicle (for drivers)
              </li>
            )}
          </ul>
          <Link href="/profile/edit">
            <Button size="sm" className="rounded-full">
              Complete Profile
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}
