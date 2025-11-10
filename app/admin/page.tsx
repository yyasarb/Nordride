import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Car, AlertTriangle, MessageSquare, TrendingUp, Activity } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getAdminStats() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('admin_stats')
    .select('*')
    .single()

  if (error) {
    console.error('Error fetching admin stats:', error)
    return null
  }

  return data
}

async function getRecentActivity() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('admin_audit_log')
    .select(`
      *,
      admin:users!admin_id(first_name, last_name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching recent activity:', error)
    return []
  }

  return data
}

export default async function AdminDashboard() {
  await requireAdmin()

  const stats = await getAdminStats()
  const recentActivity = await getRecentActivity()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of platform statistics and recent activity</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_users || 0}</div>
            <p className="text-xs text-gray-600 mt-1">
              +{stats?.new_users_7d || 0} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rides</CardTitle>
            <Car className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active_rides || 0}</div>
            <p className="text-xs text-gray-600 mt-1">
              {stats?.total_rides || 0} total rides
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending_reports || 0}</div>
            <p className="text-xs text-gray-600 mt-1">
              {stats?.reviewing_reports || 0} under review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_conversations || 0}</div>
            <p className="text-xs text-gray-600 mt-1">
              Active message threads
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Growth Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              User Growth
            </CardTitle>
            <CardDescription>New user registrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Last 7 days</span>
              <span className="text-lg font-semibold">{stats?.new_users_7d || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Last 30 days</span>
              <span className="text-lg font-semibold">{stats?.new_users_30d || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Blocked users</span>
              <span className="text-lg font-semibold text-red-600">{stats?.blocked_users || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Platform Activity
            </CardTitle>
            <CardDescription>Rides and bookings overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completed rides</span>
              <span className="text-lg font-semibold">{stats?.completed_rides || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total bookings</span>
              <span className="text-lg font-semibold">{stats?.total_bookings || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total reviews</span>
              <span className="text-lg font-semibold">{stats?.total_reviews || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Admin Activity</CardTitle>
          <CardDescription>Latest actions performed by administrators</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-gray-600 text-center py-8">No recent activity</p>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {activity.admin?.first_name} {activity.admin?.last_name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.action_type.replace(/_/g, ' ').toUpperCase()} - {activity.target_type}
                    </p>
                    {activity.details && Object.keys(activity.details).length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {JSON.stringify(activity.details)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
