'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AdminUser } from '@/lib/admin'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Car,
  AlertTriangle,
  FileText,
  Activity,
  Settings,
} from 'lucide-react'

interface AdminNavProps {
  admin: AdminUser
}

const navItems = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/admin/users',
    label: 'Users',
    icon: Users,
  },
  {
    href: '/admin/rides',
    label: 'Rides',
    icon: Car,
  },
  {
    href: '/admin/reports',
    label: 'Reports',
    icon: AlertTriangle,
  },
  {
    href: '/admin/reviews',
    label: 'Reviews',
    icon: FileText,
  },
  {
    href: '/admin/activity',
    label: 'Activity Log',
    icon: Activity,
  },
  {
    href: '/admin/settings',
    label: 'Settings',
    icon: Settings,
    superAdminOnly: true,
  },
]

export function AdminNav({ admin }: AdminNavProps) {
  const pathname = usePathname()

  return (
    <nav className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)]">
      <div className="p-4 space-y-1">
        {navItems.map((item) => {
          // Skip super admin only items if user is not super admin
          if (item.superAdminOnly && admin.admin_role !== 'super_admin') {
            return null
          }

          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium',
                isActive
                  ? 'bg-black text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
