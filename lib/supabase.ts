// Re-export the SSR-compatible client
// This ensures all auth works properly with cookies for server-side rendering
import { createClient } from './supabase/client'

export const supabase = createClient()
