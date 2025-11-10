import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserModerationActions } from '@/components/admin/user-moderation-actions'
import { ShieldCheck, Mail, Calendar, TrendingUp, Car, Users as UsersIcon } from 'lucide-react'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

async function getUserDetails(userId: string) {
  const supabase = await createClient()

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !user) {
    return null
  }

  // Get user's vehicles
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('*')
    .eq('user_id', userId)

  // Get user's rides as driver
  const { data: ridesAsDriver } = await supabase
    .from('rides')
    .select('id, status, departure_time, origin_address, destination_address')
    .eq('driver_id', userId)
    .order('departure_time', { ascending: false })
    .limit(5)

  // Get user's bookings as rider
  const { data: bookingsAsRider } = await supabase
    .from('booking_requests')
    .select(`
      id,
      status,
      created_at,
      ride:rides(origin_address, destination_address, departure_time)
    `)
    .eq('rider_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get reports about this user
  const { data: reports } = await supabase
    .from('reports')
    .select(`
      id,
      reason,
      description,
      status,
      created_at,
      reporter:users!reporter_id(first_name, last_name, email)
    `)
    .eq('reported_user_id', userId)
    .order('created_at', { ascending: false })

  return {
    user,
    vehicles: vehicles || [],
    ridesAsDriver: ridesAsDriver || [],
    bookingsAsRider: bookingsAsRider || [],
    reports: reports || [],
  }
}

export default async function UserDetailsPage({ params }: { params: { id: string } }) {
  await requireAdmin()

  const data = await getUserDetails(params.id)

  if (!data) {
    notFound()
  }

  const { user, vehicles, ridesAsDriver, bookingsAsRider, reports } = data

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            {user.first_name} {user.last_name}
            {user.is_admin && <ShieldCheck className="h-7 w-7 text-blue-600" />}
          </h1>
          <p className="text-gray-600 mt-1 flex items-center gap-2">
            <Mail className="h-4 w-4" />
            {user.email}
          </p>
        </div>
        <UserModerationActions user={user} />
      </div>

      {/* User Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Tier Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Tier {user.current_tier}</div>
            {user.current_tier === 3 && (
              <p className="text-xs text-gray-600 mt-1">Verified Driver</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Trust Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.trust_score}</div>
            <p className="text-xs text-gray-600 mt-1">Out of 100</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Rides as Driver</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.total_rides_driver}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Rides as Rider</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.total_rides_rider}</div>
          </CardContent>
        </Card>
      </div>

      {/* Account Information */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Status</span>
              {user.is_blocked ? (
                <Badge variant="destructive">Blocked</Badge>
              ) : (
                <Badge variant="outline" className="text-green-700 border-green-700">Active</Badge>
              )}
            </div>
            {user.is_blocked && user.blocked_until && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Blocked Until</span>
                <span className="text-sm font-medium">{new Date(user.blocked_until).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Email Verified</span>
              <span className="text-sm font-medium">{user.email_verified ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Phone Verified</span>
              <span className="text-sm font-medium">{user.phone_verified ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Member Since</span>
              <span className="text-sm font-medium">{new Date(user.created_at).toLocaleDateString()}</span>
            </div>
            {user.is_admin && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Admin Role</span>
                <Badge>{user.admin_role?.replace('_', ' ')}</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Bio</span>
              <p className="text-sm mt-1">{user.bio || 'No bio provided'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Languages</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {user.languages?.map((lang: string) => (
                  <Badge key={lang} variant="secondary">{lang}</Badge>
                )) || <span className="text-sm">None</span>}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Interests</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {user.interests?.map((interest: string) => (
                  <Badge key={interest} variant="secondary">{interest}</Badge>
                )) || <span className="text-sm">None</span>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vehicles */}
      {vehicles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicles ({vehicles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vehicles.map((vehicle: any) => (
                <div key={vehicle.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">
                      {vehicle.brand} {vehicle.model} {vehicle.year && `(${vehicle.year})`}
                    </div>
                    <div className="text-sm text-gray-600">
                      {vehicle.color} • {vehicle.seats} seats • {vehicle.plate_number}
                    </div>
                  </div>
                  {vehicle.is_primary && <Badge>Primary</Badge>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reports */}
      {reports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Reports ({reports.length})</CardTitle>
            <CardDescription>Reports filed against this user</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reports.map((report: any) => (
                <div key={report.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{report.reason}</div>
                      <div className="text-sm text-gray-600">
                        By: {report.reporter?.first_name} {report.reporter?.last_name} ({report.reporter?.email})
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(report.created_at).toLocaleString()}
                      </div>
                    </div>
                    <Badge variant={report.status === 'resolved' ? 'default' : 'destructive'}>
                      {report.status}
                    </Badge>
                  </div>
                  {report.description && (
                    <p className="text-sm text-gray-700">{report.description}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Rides as Driver</CardTitle>
          </CardHeader>
          <CardContent>
            {ridesAsDriver.length === 0 ? (
              <p className="text-sm text-gray-600">No rides offered yet</p>
            ) : (
              <div className="space-y-3">
                {ridesAsDriver.map((ride: any) => (
                  <div key={ride.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{ride.origin_address} → {ride.destination_address}</div>
                      <Badge variant="outline">{ride.status}</Badge>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {new Date(ride.departure_time).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings as Rider</CardTitle>
          </CardHeader>
          <CardContent>
            {bookingsAsRider.length === 0 ? (
              <p className="text-sm text-gray-600">No bookings yet</p>
            ) : (
              <div className="space-y-3">
                {bookingsAsRider.map((booking: any) => (
                  <div key={booking.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">
                        {booking.ride?.origin_address} → {booking.ride?.destination_address}
                      </div>
                      <Badge variant="outline">{booking.status}</Badge>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {new Date(booking.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
