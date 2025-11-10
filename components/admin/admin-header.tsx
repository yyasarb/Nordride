'use client'

import Link from 'next/link'
import { AdminUser } from '@/lib/admin'
import { Shield, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface AdminHeaderProps {
  admin: AdminUser
}

export function AdminHeader({ admin }: AdminHeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-black" />
            <span className="text-xl font-bold">Nordride Admin</span>
          </Link>
          <div className="h-6 w-px bg-gray-300" />
          <span className="text-sm text-gray-600 capitalize">{admin.admin_role?.replace('_', ' ')}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium">
              {admin.first_name} {admin.last_name}
            </p>
            <p className="text-xs text-gray-600">{admin.email}</p>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm">
              View Site
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  )
}
