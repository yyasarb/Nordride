'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, ShieldCheck, ShieldOff } from 'lucide-react'

interface User {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  current_tier: number
  is_blocked: boolean
  blocked_until: string | null
  trust_score: number
  total_rides_driver: number
  total_rides_rider: number
  created_at: string
  is_admin: boolean
  admin_role: string | null
}

interface UserTableProps {
  users: User[]
  totalCount: number
  currentPage: number
}

export function UserTable({ users, totalCount, currentPage }: UserTableProps) {
  const pageSize = 20
  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Tier</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Rides</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Joined</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {user.first_name} {user.last_name}
                        {user.is_admin && (
                          <ShieldCheck className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={user.current_tier === 3 ? 'default' : 'secondary'}>
                      Tier {user.current_tier}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    {user.is_blocked ? (
                      <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                        <ShieldOff className="h-3 w-3" />
                        Blocked
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-green-700 border-green-700">
                        Active
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <div>Driver: {user.total_rides_driver}</div>
                    <div>Rider: {user.total_rides_rider}</div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4">
                    <Link href={`/admin/users/${user.id}`}>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-gray-600">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} users
          </p>
          <div className="flex gap-2">
            <Link href={`/admin/users?page=${currentPage - 1}`}>
              <Button variant="outline" size="sm" disabled={currentPage === 1}>
                Previous
              </Button>
            </Link>
            <Link href={`/admin/users?page=${currentPage + 1}`}>
              <Button variant="outline" size="sm" disabled={currentPage === totalPages}>
                Next
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
