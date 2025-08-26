import { Button } from '@/components/ui/button'

import { Rocket, ArrowRight } from 'lucide-react'
import { useInitAuth } from '@/hook/useSession'
import { useUserStore } from '@/store/UserStore'
import { useNavigate } from '@tanstack/react-router'

const InitalPqge = () => {
  useInitAuth()
const {user} = useUserStore((state) => state)
  const navigate = useNavigate()

  const handleSignIn = () => {
    navigate({ to: '/login' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="flex justify-center mb-8">
          <div className="p-4 rounded-full border">
            <Rocket className="h-16 w-16" />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Cosmic Event Tracker
        </h1>
        

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button 
            size="lg" 
            className="px-8 py-4 text-lg"
            onClick={handleSignIn}
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          {!user && (
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-4 text-lg"
              onClick={handleSignIn}
            >
              Sign In
            </Button>
          )}
        </div>

      </div>
    </div>
  )
}


export default InitalPqge