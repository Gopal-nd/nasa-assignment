import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/superbase-client'
import { createFileRoute, Link } from '@tanstack/react-router'
import React, { useState } from 'react'
import { FaGoogle } from 'react-icons/fa'
import { toast } from 'react-hot-toast'

const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignUp = async () => {
    setLoading(true)
    const { error, data } = await supabase.auth.signUp({ email, password })
    if (error) toast(error.message)
    else toast('Check your email for confirmation!')
    setLoading(false)
    console.log(data)
  }

  const handleGoogleSignUp = async () => {
    const { error, data } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    if (error) toast(error.message)
    console.log(data)
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col gap-4 p-6  shadow rounded">
        <h1 className="text-2xl font-bold">Sign Up</h1>
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
        <Button onClick={handleSignUp} disabled={loading}>
          {loading ? 'Signing up...' : 'Sign Up'}
        </Button>
        <hr />
        <Button variant="outline" onClick={handleGoogleSignUp}>
          <FaGoogle className="mr-2" /> Continue with Google
        </Button>
      </div>
      <p>
        Already have an account?{' '}
        <Link to="/login" className="underline">
          Sign In
        </Link>
      </p>
    </div>
  )
}

export default SignUpPage

export const Route = createFileRoute('/register' as any)({
  component: SignUpPage,
})
