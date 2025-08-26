import { useUserStore } from '@/store/UserStore'
import { supabase } from '@/superbase-client'
import { useEffect } from 'react'

export function useInitAuth() {
  const setUser = useUserStore((state) => state.setUser)
  const clearUser = useUserStore((state) => state.clearUser)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) setUser(data.session.user)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user)
        } else {
          clearUser()
        }
      },
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [setUser, clearUser])
}
