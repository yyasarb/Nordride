'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Star, UserPlus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { FriendRequestButton } from '@/components/friends/friend-request-button'

interface PostRideCompletionModalProps {
  isOpen: boolean
  onClose: () => void
  otherParticipants: Array<{
    id: string
    name: string
    photo?: string | null
    isDriver: boolean
  }>
  rideId: string
}

export function PostRideCompletionModal({
  isOpen,
  onClose,
  otherParticipants,
  rideId,
}: PostRideCompletionModalProps) {
  const router = useRouter()
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null)

  // Auto-select first participant if there's only one
  useEffect(() => {
    if (otherParticipants.length === 1) {
      setSelectedParticipant(otherParticipants[0].id)
    }
  }, [otherParticipants])

  const handleLeaveReview = () => {
    onClose()
    // Navigate to the ride details page where the review section is
    router.push(`/rides/${rideId}#review`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            🎉 Trip Completed!
          </DialogTitle>
          <DialogDescription>
            Great job completing your trip! Would you like to leave a review or connect with your travel companions?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Participant list */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">
              {otherParticipants.length === 1
                ? `How was your ride with ${otherParticipants[0].name}?`
                : 'Your travel companions:'}
            </p>

            {otherParticipants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-4 border-2 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {participant.photo ? (
                    <Image
                      src={participant.photo}
                      alt={participant.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                      {participant.name[0]}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{participant.name}</p>
                    <p className="text-xs text-gray-500">
                      {participant.isDriver ? 'Driver' : 'Rider'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <FriendRequestButton
                    userId={participant.id}
                    userName={participant.name}
                    variant="outline"
                    size="sm"
                    showIcon={true}
                    className="rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleLeaveReview}
              className="w-full rounded-full"
              size="lg"
            >
              <Star className="h-4 w-4 mr-2" />
              Leave a Review
            </Button>

            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full rounded-full"
              size="lg"
            >
              Maybe Later
            </Button>
          </div>
        </div>

        {/* Dismissal note */}
        <p className="text-xs text-gray-500 text-center">
          This prompt will only appear once per trip
        </p>
      </DialogContent>
    </Dialog>
  )
}
