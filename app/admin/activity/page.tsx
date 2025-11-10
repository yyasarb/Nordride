import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: {
    action?: string
    page?: string
  }
}

async function getActivityLog(actionType?: string, page: number = 1) {
  const supabase = await createClient()
  const pageSize = 50
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('admin_audit_log')
    .select(`
      *,
      admin:users!admin_id(first_name, last_name, email, admin_role)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })

  if (actionType && actionType !== 'all') {
    query = query.eq('action_type', actionType)
  }

  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching activity log:', error)
    return { logs: [], count: 0 }
  }

  return { logs: data || [], count: count || 0 }
}

export default async function ActivityLogPage({ searchParams }: PageProps) {
  await requireAdmin()

  const actionType = searchParams.action || 'all'
  const page = parseInt(searchParams.page || '1')

  const { logs, count } = await getActivityLog(actionType === 'all' ? undefined : actionType, page)

  const actionColors: Record<string, string> = {
    user_suspend: 'bg-red-100 text-red-800',
    user_unsuspend: 'bg-green-100 text-green-800',
    ride_cancel: 'bg-amber-100 text-amber-800',
    report_resolve: 'bg-blue-100 text-blue-800',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Activity Log</h1>
        <p className="text-gray-600 mt-2">Audit trail of all admin actions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Actions ({count})</CardTitle>
          <CardDescription>Chronological log of administrative activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {logs.length === 0 ? (
              <p className="text-center text-gray-600 py-8">No activity logged yet</p>
            ) : (
              logs.map((log: any) => (
                <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            actionColors[log.action_type] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {log.action_type.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-600">
                          {log.admin?.first_name} {log.admin?.last_name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {log.admin?.admin_role?.replace('_', ' ')}
                        </Badge>
                      </div>

                      <div className="mt-2 text-sm text-gray-700">
                        <span className="font-medium">Target:</span> {log.target_type} (ID: {log.target_id.substring(0, 8)}...)
                      </div>

                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      )}

                      <div className="mt-2 text-xs text-gray-500">
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
