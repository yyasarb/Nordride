import { requireAdmin } from '@/lib/admin'
import { AdminNav } from '@/components/admin/admin-nav'
import { AdminHeader } from '@/components/admin/admin-header'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This will redirect if user is not an admin
  const admin = await requireAdmin()

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader admin={admin} />
      <div className="flex">
        <AdminNav admin={admin} />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
