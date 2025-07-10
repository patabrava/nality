'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { signInWithEmail, loading, error } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) return
    
    const { error } = await signInWithEmail(email)
    
    if (!error) {
      setIsSubmitted(true)
    }
  }

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Check Your Email</h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              We&apos;ve sent a magic link to <span className="text-white font-semibold">{email}</span>
            </p>
            <p className="text-gray-400 mt-4">
              Click the link in your email to sign in to Nality
            </p>
          </div>
          
          <button
            onClick={() => {
              setIsSubmitted(false)
              setEmail('')
            }}
            className="w-full h-11 px-6 border border-white text-white bg-transparent rounded-xl font-bold text-xl transition-all duration-150 ease-out hover:bg-white/10 active:scale-98"
          >
            Try Different Email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to Nality</h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            Your life story, beautifully preserved
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-lg font-semibold mb-3">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full h-11 px-4 bg-gray-100 text-black rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-150"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-600/10 border border-red-600/20 rounded-lg">
              <p className="text-red-400 text-sm">
                {error.message || 'Something went wrong. Please try again.'}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email.trim() || !isValidEmail(email)}
            className="w-full h-11 px-6 bg-gray-600 text-white rounded-xl font-bold text-xl transition-all duration-150 ease-out hover:bg-gray-500 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Sending Magic Link...' : 'Continue with Email'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            We&apos;ll send you a secure link to sign in.<br />
            No passwords required.
          </p>
        </div>
      </div>
    </div>
  )
} 