'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'

interface BlockConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  userName: string
  onSuccess?: () => void
}

export function BlockConfirmationModal({
  isOpen,
  onClose,
  userId,
  userName,
  onSuccess,
}: BlockConfirmationModalProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()
  const router = useRouter()

  const handleBlock = async () => {
    setLoading(true)
    try {
      const session = await supabase.auth.getSession()
      const response = await fetch('/api/friends/block', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.data.session?.access_token}`,
        },
        body: JSON.stringify({ blocked_id: userId, reason: 'Blocked by user' }),
      })

      if (response.ok) {
        toast({
          title: 'User blocked',
          description: `You have blocked ${userName}`,
        })
        onSuccess?.()
        router.refresh()
        onClose()
      } else {
        const data = await response.json()
        toast({
          title: 'Error',
          description: data.error || 'Failed to block user',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error blocking user:', error)
      toast({
        title: 'Error',
        description: 'Failed to block user',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Block {userName}?</AlertDialogTitle>
          <AlertDialogDescription>
            {userName} will not be able to:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Send you friend requests</li>
              <li>See your profile</li>
              <li>See your rides</li>
              <li>Message you</li>
              <li>Book your rides</li>
            </ul>
            <p className="mt-2">{userName} will not be notified.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleBlock} disabled={loading} className="bg-red-600 hover:bg-red-700">
            {loading ? 'Blocking...' : 'Block User'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
