import { Button } from '@/components/ui/button'
import { supabase } from '@/superbase-client'
import { createFileRoute } from '@tanstack/react-router'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const DashboardPage: React.FC = () => {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const session = supabase.auth
      .getSession()
      .then(({ data }) => setUser(data.session?.user))
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null)
      },
    )
    console.log(user)
    return () => listener.subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast('Signed out successfully!')
    setUser(null)
  }

  if (!user)
    return (
      <p className="text-center mt-20">
        You are not logged in. Go to Sign In or Sign Up.
      </p>
    )

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {JSON.stringify(user)}
      <h1 className="text-2xl font-bold mb-4">Welcome, {user.email}</h1>
      <Button onClick={handleLogout}>Logout</Button>
    </div>
  )
}

export default DashboardPage
export const Route = createFileRoute('/' as any)({
  component: DashboardPage,
})
