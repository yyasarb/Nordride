import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RideTable } from '@/components/admin/ride-table'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: {
    status?: string
    page?: string
  }
}

async function getRides(status?: string, page: number = 1) {
  const supabase = await createClient()
  const pageSize = 20
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('rides')
    .select(`
      id,
      status,
      origin_address,
      destination_address,
      departure_time,
      seats_available,
      seats_booked,
      created_at,
      driver:driver_id(first_name, last_name, email)
    `, { count: 'exact' })
    .order('departure_time', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching rides:', error)
    return { rides: [], count: 0 }
  }

  // Transform data to handle driver as array
  const rides = (data || []).map((ride: any) => ({
    ...ride,
    driver: Array.isArray(ride.driver) ? ride.driver[0] : ride.driver
  }))

  return { rides, count: count || 0 }
}

export default async function RidesPage({ searchParams }: PageProps) {
  await requireAdmin()

  const status = searchParams.status || 'all'
  const page = parseInt(searchParams.page || '1')

  const { rides, count } = await getRides(status === 'all' ? undefined : status, page)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ride Management</h1>
        <p className="text-gray-600 mt-2">View and manage all rides on the platform</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rides ({count})</CardTitle>
          <CardDescription>Filter and view rides by status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Link href="/admin/rides?status=all">
              <Button variant={status === 'all' ? 'default' : 'outline'} size="sm">
                All
              </Button>
            </Link>
            <Link href="/admin/rides?status=published">
              <Button variant={status === 'published' ? 'default' : 'outline'} size="sm">
                Published
              </Button>
            </Link>
            <Link href="/admin/rides?status=completed">
              <Button variant={status === 'completed' ? 'default' : 'outline'} size="sm">
                Completed
              </Button>
            </Link>
            <Link href="/admin/rides?status=cancelled">
              <Button variant={status === 'cancelled' ? 'default' : 'outline'} size="sm">
                Cancelled
              </Button>
            </Link>
          </div>
          <RideTable rides={rides} totalCount={count} currentPage={page} />
        </CardContent>
      </Card>
    </div>
  )
}
