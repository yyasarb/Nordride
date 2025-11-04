import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'

export function useSupabaseAuth() {
  const setUser = useAuthStore((state) => state.setUser)
  const setInitialized = useAuthStore((state) => state.setInitialized)

  useEffect(() => {
    let mounted = true

    const hydrateSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Failed to get session:', error)
        setInitialized(true)
        return
      }

      if (mounted) {
        setUser(data.session?.user ?? null)
        setInitialized(true)
      }
    }

    hydrateSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setInitialized(true)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [setUser, setInitialized])
}
