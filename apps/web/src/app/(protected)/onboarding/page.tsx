'use client';

import ChatInterface from '@/components/onboarding/ChatInterface';
import { fetchUserProfile, supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function OnboardingPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isAuthenticated && user?.id) {
      fetchUserProfile(user.id).then(profile => {
        if (profile && profile.onboarding_complete) {
          console.log('✅ User already onboarded, redirecting to /timeline')
          router.replace('/timeline')
        }
      })
    }
  }, [loading, isAuthenticated, user, router])

  // At the end of onboarding, call this function:
  async function completeOnboarding() {
    if (!user?.id) return
    const { error } = await supabase
      .from('users')
      .update({ onboarding_complete: true })
      .eq('id', user.id)
    if (!error) {
      console.log('🎉 Onboarding complete, redirecting to /timeline')
      router.replace('/timeline')
    } else {
      console.error('❌ Failed to update onboarding_complete:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4">
        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          
          {/* Chat Interface - Main Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg h-full overflow-hidden border border-red-100">
              <ChatInterface 
                className="h-full"
                placeholder="Share a memory, tell me about your childhood, or ask me anything..."
                initialMessage="Hello! I&apos;m here to help you create a wonderful timeline of your life. We can start wherever you&apos;d like - your childhood, your family, your career, or any special moments you&apos;d like to preserve. What would you like to share first?"
              />
            </div>
          </div>

          {/* Sidebar - Progress & Tips */}
          <div className="space-y-6">
            {/* Progress Card removed as requested */}
          </div>
        </div>
      </main>

      {/* Footer removed as requested */}
    </div>
  );
} 