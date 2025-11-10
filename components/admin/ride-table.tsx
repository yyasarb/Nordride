'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

interface Ride {
  id: string
  status: string
  origin_address: string
  destination_address: string
  departure_time: string
  seats_available: number
  seats_booked: number
  created_at: string
  driver: {
    first_name: string | null
    last_name: string | null
    email: string
  }
}

interface RideTableProps {
  rides: Ride[]
  totalCount: number
  currentPage: number
}

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  published: 'default',
  completed: 'outline',
  cancelled: 'destructive',
}

export function RideTable({ rides, totalCount, currentPage }: RideTableProps) {
  const pageSize = 20
  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Route</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Driver</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Seats</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Departure</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rides.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No rides found
                </td>
              </tr>
            ) : (
              rides.map((ride) => (
                <tr key={ride.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm">
                    <div className="max-w-xs">
                      <div className="font-medium truncate">{ride.origin_address}</div>
                      <div className="text-gray-600 truncate">→ {ride.destination_address}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <div>
                      <div className="font-medium">{ride.driver.first_name} {ride.driver.last_name}</div>
                      <div className="text-gray-600">{ride.driver.email}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={statusColors[ride.status] || 'secondary'}>
                      {ride.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {ride.seats_booked}/{ride.seats_available}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {new Date(ride.departure_time).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4">
                    <Link href={`/rides/${ride.id}`} target="_blank">
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
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} rides
          </p>
          <div className="flex gap-2">
            <Link href={`/admin/rides?page=${currentPage - 1}`}>
              <Button variant="outline" size="sm" disabled={currentPage === 1}>
                Previous
              </Button>
            </Link>
            <Link href={`/admin/rides?page=${currentPage + 1}`}>
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
