'use client'

import React from 'react'
import { useLifeEvents } from '@/hooks/useLifeEvents'
import { LifeEventCard } from '@/components/timeline/LifeEventCard'

export default function TestTimelinePage() {
  const { events, loading, error } = useLifeEvents()

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading timeline...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">⚠️ Timeline Error</h1>
          <p className="text-red-400 mb-6">{error}</p>
          <div className="space-y-2 text-sm text-gray-400">
            <p>Debug info:</p>
            <p>• Check if you're logged in</p>
            <p>• Verify database is set up</p>
            <p>• Check console for detailed errors</p>
          </div>
          <div className="mt-6">
            <a href="/login" className="text-blue-400 hover:text-blue-300 mr-4">Go to Login</a>
            <a href="/setup" className="text-green-400 hover:text-green-300">Database Setup</a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Timeline Test (No Auth Required)</h1>
        
        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400 mb-4">No life events found</p>
            <p className="text-gray-500">Database connection is working, but no events exist yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((event) => (
              <LifeEventCard 
                key={event.id} 
                event={event} 
                onEdit={() => {}}
                onDelete={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
