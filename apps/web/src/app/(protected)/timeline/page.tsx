'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

// Disable static generation for this page
export const dynamic = 'force-dynamic'

export default function TimelinePage() {
  const { user } = useAuth()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Your Timeline</h1>
          <p className="text-xl text-gray-300">
            Welcome back, {user?.email?.split('@')[0] || 'friend'}!
          </p>
        </div>

        <div className="bg-gray-900 rounded-xl p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Your Timeline Awaits</h2>
            <p className="text-gray-400">
              This is where your life story will come to life. Timeline functionality will be added in Phase 5.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => router.push('/profile')}
              className="w-full h-11 px-6 border border-white text-white bg-transparent rounded-xl font-bold text-xl transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-white/10 active:scale-[0.98]"
            >
              View Profile
            </button>
            
            <div className="text-sm text-gray-500">
              Authentication is working! ✅
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-2">Life Events</h3>
            <p className="text-gray-400 text-sm">
              Coming in Phase 5 - Add and manage your life events
            </p>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-2">AI Chat</h3>
            <p className="text-gray-400 text-sm">
              Coming in Phase 6 - Chat with AI to discover memories
            </p>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-2">Media Upload</h3>
            <p className="text-gray-400 text-sm">
              Coming in Phase 7 - Upload photos and videos
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 