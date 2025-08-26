import { useUserStore } from '@/store/UserStore'
import { supabase } from '@/superbase-client'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from './ui/button'
import { useEffect } from 'react'
import { useInitAuth } from '@/hook/useSession'

export default function Header() {
  useInitAuth()
  const user = useUserStore((state) => state.user)
  const clearUser = useUserStore((state) => state.clearUser)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    clearUser()
    navigate({ to: '/' })
  }

  return (
    <header className="p-2 flex gap-2  justify-between shadow">
      {/* Left side navigation */}
      <nav className="flex flex-row gap-4 items-center">
        <div className="px-2 font-bold">
          <Link to="/">Home</Link>
        </div>
      </nav>

      {/* Right side auth actions */}
      <div className="flex gap-2 items-center">
        {!user?.email ? (
          <>
            <Link to="/login">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Register</Button>
            </Link>
          </>
        ) : (
          <>
            <span className="text-sm text-gray-700">{user.email}</span>
            <Link to="/dashboard">
              <Button size="sm" variant="secondary">
                Dashboard
              </Button>
            </Link>
            <Button size="sm" variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </>
        )}
      </div>
    </header>
  )
}
