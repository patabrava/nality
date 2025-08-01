'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

// Disable static generation for this page
export const dynamic = 'force-dynamic'

export default function ProfilePage() {
  const { user, signOut, loading } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (!error) {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Profile</h1>
          <p className="text-xl text-gray-300">
            Manage your Nality account
          </p>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Account Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                Email Address
              </label>
              <div className="text-lg">
                {user?.email || 'Not available'}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                User ID
              </label>
              <div className="text-sm text-gray-500 font-mono">
                {user?.id || 'Not available'}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                Account Created
              </label>
              <div className="text-lg">
                {user?.created_at 
                  ? new Date(user.created_at).toLocaleDateString()
                  : 'Not available'
                }
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4">Account Actions</h2>
          
          <div className="space-y-4">
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full h-11 px-6 bg-red-600 text-white rounded-xl font-bold text-xl transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-red-500 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Signing Out...' : 'Sign Out'}
            </button>
            
            <p className="text-sm text-gray-400">
              You&apos;ll be redirected to the home page after signing out.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/dash')}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
} 