import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/superbase-client'
import { createFileRoute, Link } from '@tanstack/react-router'
import { FaGoogle } from 'react-icons/fa'
import React, { use, useState } from 'react'
import { useUserStore } from '@/store/UserStore'
import toast from 'react-hot-toast'

export const Route = createFileRoute('/login')({
  component: SignInPage,
})

function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  // const { setUser, user, clearUser } = useUserStore()
  const handleSignIn = async () => {
    setLoading(true)
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    console.log(data)
    if (error) toast(error.message)
    else toast('Signed in successfully!')
    setLoading(false)
  }

  const handleGoogleSignIn = async () => {
    const { error, data } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    console.log(data)
    // setUser()
    if (error) toast(error.message)
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col gap-4 p-6 bg-white shadow rounded">
        <h1 className="text-2xl font-bold">Sign In</h1>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button onClick={handleSignIn} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
        <hr />
        <Button variant="outline" onClick={handleGoogleSignIn}>
          <FaGoogle className="mr-2" /> Continue with Google
        </Button>
      </div>
      <p>
        Already have an account? <Link to="/register">Sign In</Link>
      </p>
    </div>
  )
}

export default SignInPage
