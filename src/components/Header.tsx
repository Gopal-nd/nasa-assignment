import { Button } from '@/components/ui/button'
import { supabase } from '@/superbase-client'
import { Link, useNavigate } from '@tanstack/react-router'
import React from 'react'
import toast from 'react-hot-toast'
import { LogOut, User, Rocket } from 'lucide-react'
import { useInitAuth } from '@/hook/useSession'
import { useUserStore } from '@/store/UserStore'

const Header: React.FC = () => {
  useInitAuth()
  const { user } = useUserStore((state) => state)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Signed out successfully!')
    navigate({ to: '/login' })
  }

  return (
    <header className="shadow-sm border-b">
      <div className=" mx-auto px-4 ">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <Rocket className="h-8 w-8 " />
              <span className="text-xl font-bold ">Cosmic Tracker</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2 text-sm ">
                  <User className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
