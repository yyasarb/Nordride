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

interface UnfriendConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  friendId: string
  friendName: string
  onSuccess?: () => void
}

export function UnfriendConfirmationModal({
  isOpen,
  onClose,
  friendId,
  friendName,
  onSuccess,
}: UnfriendConfirmationModalProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()
  const router = useRouter()

  const handleUnfriend = async () => {
    setLoading(true)
    try {
      const session = await supabase.auth.getSession()
      const response = await fetch(`/api/friends/unfriend?friend_id=${friendId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.data.session?.access_token}`,
        },
      })

      if (response.ok) {
        toast({
          title: 'Unfriended',
          description: `You are no longer friends with ${friendName}`,
        })
        onSuccess?.()
        router.refresh()
        onClose()
      } else {
        const data = await response.json()
        toast({
          title: 'Error',
          description: data.error || 'Failed to unfriend user',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error unfriending user:', error)
      toast({
        title: 'Error',
        description: 'Failed to unfriend user',
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
          <AlertDialogTitle>Unfriend {friendName}?</AlertDialogTitle>
          <AlertDialogDescription>
            You can always send a friend request again later if you change your mind.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleUnfriend} disabled={loading}>
            {loading ? 'Unfriending...' : 'Unfriend'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
