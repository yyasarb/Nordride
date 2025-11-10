'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { ShieldOff, ShieldCheck } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from '@/components/ui/use-toast'

interface UserModerationActionsProps {
  user: any
}

export function UserModerationActions({ user }: UserModerationActionsProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [suspendDuration, setSuspendDuration] = useState('24')
  const [suspendReason, setSuspendReason] = useState('')

  const handleSuspend = async () => {
    if (!suspendReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for suspension',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.rpc('admin_suspend_user', {
        p_user_id: user.id,
        p_duration_hours: parseInt(suspendDuration),
        p_reason: suspendReason,
      })

      if (error) throw error

      toast({
        title: 'Success',
        description: `User suspended for ${suspendDuration} hours`,
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to suspend user',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUnsuspend = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.rpc('admin_unsuspend_user', {
        p_user_id: user.id,
        p_reason: 'Admin manually unsuspended user',
      })

      if (error) throw error

      toast({
        title: 'Success',
        description: 'User unsuspended successfully',
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to unsuspend user',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      {user.is_blocked ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" disabled={loading}>
              <ShieldCheck className="h-4 w-4 mr-2" />
              Unsuspend User
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Unsuspend User</AlertDialogTitle>
              <AlertDialogDescription>
                This will restore full access to the user&apos;s account. They will be able to use all platform features immediately.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleUnsuspend} disabled={loading}>
                Unsuspend
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={loading}>
              <ShieldOff className="h-4 w-4 mr-2" />
              Suspend User
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Suspend User</AlertDialogTitle>
              <AlertDialogDescription>
                This will temporarily block the user from accessing the platform.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Duration (hours)</label>
                <select
                  value={suspendDuration}
                  onChange={(e) => setSuspendDuration(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="1">1 hour</option>
                  <option value="24">24 hours (1 day)</option>
                  <option value="168">1 week</option>
                  <option value="720">30 days</option>
                  <option value="8760">1 year</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Reason *</label>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="Enter the reason for suspension..."
                  rows={3}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSuspend} disabled={loading || !suspendReason.trim()}>
                Suspend User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
