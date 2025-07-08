'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

// Disable static generation for this page
export const dynamic = 'force-dynamic'

export default function Home() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  const handleStartStory = () => {
    if (isAuthenticated) {
      router.push('/timeline')
    } else {
      router.push('/login')
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">
            Welcome to Nality
          </h1>
          <div className="bg-gray-900 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              Your Life Story Platform
            </h2>
            <p className="text-gray-300 mb-6 text-lg leading-relaxed">
              Nality helps you capture, organize, and share your life&apos;s most important moments.
              Create a beautiful timeline of your experiences with photos, videos, and memories.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={handleStartStory}
                disabled={loading}
                className="h-11 px-6 bg-gray-600 text-white rounded-xl font-bold text-xl transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-gray-500 active:scale-[0.98] disabled:opacity-40"
              >
                {loading ? 'Loading...' : isAuthenticated ? 'Continue My Story' : 'Start My Story'}
              </button>
              <button className="h-11 px-6 border border-white text-white bg-transparent rounded-xl font-bold text-xl transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-white/10 active:scale-[0.98]">
                Learn More
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-3">
                Timeline View
              </h3>
              <p className="text-gray-400">
                Organize your life events in a beautiful, chronological timeline.
              </p>
            </div>
            <div className="bg-gray-900 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-3">
                Media Rich
              </h3>
              <p className="text-gray-400">
                Add photos, videos, and documents to bring your memories to life.
              </p>
            </div>
            <div className="bg-gray-900 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-3">
                AI Powered
              </h3>
              <p className="text-gray-400">
                Chat with AI to help you remember and organize your experiences.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
