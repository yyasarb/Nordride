import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type AdminRole = 'super_admin' | 'moderator' | 'support'

export interface AdminUser {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  is_admin: boolean
  admin_role: AdminRole | null
  admin_notes: string | null
  admin_verified_at: string | null
}

/**
 * Check if the current user is an admin
 * Throws redirect if not authenticated or not an admin
 */
export async function requireAdmin(): Promise<AdminUser> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth/login?message=Please log in to continue&redirect=/admin')
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, is_admin, admin_role, admin_notes, admin_verified_at')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || !profile.is_admin) {
    redirect('/?message=Unauthorized access')
  }

  return profile as AdminUser
}

/**
 * Check if user has specific admin role
 */
export function hasAdminRole(admin: AdminUser, requiredRole: AdminRole | AdminRole[]): boolean {
  if (!admin.admin_role) return false

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  return roles.includes(admin.admin_role)
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(admin: AdminUser): boolean {
  return admin.admin_role === 'super_admin'
}

/**
 * Get admin user (nullable - won't redirect)
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return null
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, is_admin, admin_role, admin_notes, admin_verified_at')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || !profile.is_admin) {
      return null
    }

    return profile as AdminUser
  } catch {
    return null
  }
}
