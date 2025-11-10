import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserTable } from '@/components/admin/user-table'
import { UserSearch } from '@/components/admin/user-search'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: {
    search?: string
    filter?: string
    page?: string
  }
}

async function getUsers(searchQuery?: string, filter?: string, page: number = 1) {
  const supabase = await createClient()
  const pageSize = 20
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('users')
    .select(`
      id,
      email,
      first_name,
      last_name,
      current_tier,
      is_blocked,
      blocked_until,
      trust_score,
      total_rides_driver,
      total_rides_rider,
      created_at,
      is_admin,
      admin_role
    `, { count: 'exact' })
    .order('created_at', { ascending: false })

  // Apply search filter
  if (searchQuery) {
    query = query.or(`email.ilike.%${searchQuery}%,first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`)
  }

  // Apply status filter
  if (filter === 'blocked') {
    query = query.eq('is_blocked', true)
  } else if (filter === 'admin') {
    query = query.eq('is_admin', true)
  } else if (filter === 'tier3') {
    query = query.eq('current_tier', 3)
  }

  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching users:', error)
    return { users: [], count: 0 }
  }

  return { users: data || [], count: count || 0 }
}

export default async function UsersPage({ searchParams }: PageProps) {
  await requireAdmin()

  const search = searchParams.search || ''
  const filter = searchParams.filter || 'all'
  const page = parseInt(searchParams.page || '1')

  const { users, count } = await getUsers(search, filter === 'all' ? undefined : filter, page)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-gray-600 mt-2">Manage users, view details, and take moderation actions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users ({count})</CardTitle>
          <CardDescription>Search and filter users across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <UserSearch />
          <div className="mt-6">
            <UserTable users={users} totalCount={count} currentPage={page} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
