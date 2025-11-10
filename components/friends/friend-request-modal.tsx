'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'

interface FriendRequestModalProps {
  isOpen: boolean
  onClose: () => void
  recipientId: string
  recipientName: string
  onSuccess?: () => void
}

export function FriendRequestModal({
  isOpen,
  onClose,
  recipientId,
  recipientName,
  onSuccess,
}: FriendRequestModalProps) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  const handleSend = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient_id: recipientId,
          message: message.trim() || null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Friend request sent',
          description: `Friend request sent to ${recipientName}`,
        })
        onSuccess?.()
        onClose()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to send friend request',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error sending friend request:', error)
      toast({
        title: 'Error',
        description: 'Failed to send friend request',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Friend</DialogTitle>
          <DialogDescription>
            Send friend request to {recipientName}?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label htmlFor="message" className="text-sm font-medium leading-none mb-2 block">
              Add a message (optional)
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Hey ${recipientName.split(' ')[0]}! Let's connect on Nordride...`}
              maxLength={200}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">{message.length}/200 characters</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={loading}>
            {loading ? 'Sending...' : 'Send Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
