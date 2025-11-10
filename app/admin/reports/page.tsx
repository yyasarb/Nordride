import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ReportActions } from '@/components/admin/report-actions'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: {
    status?: string
  }
}

async function getReports(status?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('reports')
    .select(`
      *,
      reporter:users!reporter_id(first_name, last_name, email),
      reported_user:users!reported_user_id(first_name, last_name, email),
      ride:rides(origin_address, destination_address)
    `)
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching reports:', error)
    return []
  }

  return data || []
}

export default async function ReportsPage({ searchParams }: PageProps) {
  await requireAdmin()

  const status = searchParams.status || 'pending'
  const reports = await getReports(status === 'all' ? undefined : status)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports & Moderation</h1>
        <p className="text-gray-600 mt-2">Review and resolve user reports</p>
      </div>

      <div className="flex gap-2">
        <Link href="/admin/reports?status=pending">
          <Button variant={status === 'pending' ? 'default' : 'outline'} size="sm">
            Pending
          </Button>
        </Link>
        <Link href="/admin/reports?status=reviewing">
          <Button variant={status === 'reviewing' ? 'default' : 'outline'} size="sm">
            Under Review
          </Button>
        </Link>
        <Link href="/admin/reports?status=resolved">
          <Button variant={status === 'resolved' ? 'default' : 'outline'} size="sm">
            Resolved
          </Button>
        </Link>
        <Link href="/admin/reports?status=all">
          <Button variant={status === 'all' ? 'default' : 'outline'} size="sm">
            All
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {reports.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-gray-600">No reports found</p>
            </CardContent>
          </Card>
        ) : (
          reports.map((report: any) => (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{report.reason}</CardTitle>
                    <CardDescription className="mt-2">
                      Reported by: {report.reporter?.first_name} {report.reporter?.last_name} ({report.reporter?.email})
                      <br />
                      Against: {report.reported_user?.first_name} {report.reported_user?.last_name} ({report.reported_user?.email})
                      <br />
                      {new Date(report.created_at).toLocaleString()}
                    </CardDescription>
                  </div>
                  <Badge variant={
                    report.status === 'pending' ? 'destructive' :
                    report.status === 'reviewing' ? 'default' :
                    'outline'
                  }>
                    {report.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.description && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Description:</p>
                    <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                  </div>
                )}

                {report.ride && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Related Ride:</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {report.ride.origin_address} → {report.ride.destination_address}
                    </p>
                  </div>
                )}

                {report.action_taken && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Action Taken:</p>
                    <p className="text-sm text-gray-600 mt-1">{report.action_taken}</p>
                  </div>
                )}

                {report.admin_notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Admin Notes:</p>
                    <p className="text-sm text-gray-600 mt-1">{report.admin_notes}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Link href={`/admin/users/${report.reported_user_id}`}>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View User
                    </Button>
                  </Link>
                  {report.ride_id && (
                    <Link href={`/rides/${report.ride_id}`} target="_blank">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Ride
                      </Button>
                    </Link>
                  )}
                  {report.status !== 'resolved' && (
                    <ReportActions reportId={report.id} />
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
