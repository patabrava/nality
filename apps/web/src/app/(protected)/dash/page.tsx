'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CHAPTERS_ORDERED } from '@/lib/chapters'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useUserProfile } from '@/hooks/useUserProfile'
import { usePageTitle } from '@/hooks/usePageTitle'
import { AddMemoryButton } from '@/components/buttons/AddMemoryButton'
import { ProfileCard } from '@/components/profile/ProfileCard'

const DASHBOARD_CHAPTERS = CHAPTERS_ORDERED.filter(chapter => chapter.id !== 'moments')

// Dashboard tile component
interface DashboardTileProps {
  title: string
  content: React.ReactNode
  isInteractive?: boolean
  slogan?: string
  onClick?: (() => void) | undefined
}

function DashboardTile({ title, content, isInteractive = false, slogan, onClick }: DashboardTileProps) {
  return (
    <div 
      className={`dashboard-tile ${isInteractive ? 'interactive' : ''}`}
      onClick={isInteractive ? onClick : undefined}
      style={{
        background: 'var(--theme-bg-glass, rgba(20, 20, 20, 0.4))',
        border: '1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))',
        borderRadius: '4px',
        aspectRatio: '1',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
        cursor: isInteractive ? 'pointer' : 'default',
        transition: 'transform 0.4s ease, border-color 0.4s ease, background 0.4s ease',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseOver={(e) => {
        if (isInteractive) {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.borderColor = 'var(--theme-border-hover, rgba(255, 255, 255, 0.2))'
          e.currentTarget.style.background = 'var(--theme-gradient-gold-hover, rgba(212, 175, 55, 0.03))'
        }
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = 'var(--theme-border-subtle, rgba(255, 255, 255, 0.08))'
        e.currentTarget.style.background = 'var(--theme-bg-glass, rgba(20, 20, 20, 0.4))'
      }}
    >
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        {content}
        <h3 style={{
          fontFamily: 'Playfair Display, Georgia, serif',
          fontSize: '1.5rem',
          fontWeight: 400,
          color: 'var(--theme-text-primary, #e0e0e0)',
          margin: '1.5rem 0 1rem',
          letterSpacing: '-0.01em'
        }}>
          {title}
        </h3>
        {slogan && (
          <p style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '0.9rem',
            color: 'var(--theme-text-secondary, #a0a0a0)',
            margin: 0,
            lineHeight: '1.5'
          }}>
            {slogan}
          </p>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  usePageTitle('Dashboard')
  const router = useRouter()
  const { user } = useAuth()
  const { profile, isLoading: profileLoading } = useUserProfile(user?.id)
  const [chapterStats, setChapterStats] = useState<Record<string, number>>({})
  const [totalEvents, setTotalEvents] = useState(0)
  
  console.log('📊 Dashboard page mounted')

  // Auto-convert any unconverted onboarding answers on dashboard load
  useEffect(() => {
    async function convertOnboardingAnswers() {
      if (!user?.id) return
      
      try {
        // Get access token for API auth
        const { data: { session } } = await supabase.auth.getSession()
        const accessToken = session?.access_token
        
        console.log('🔄 Checking for unconverted onboarding answers...')
        const response = await fetch('/api/events/convert-onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, accessToken }),
        })
        
        if (response.ok) {
          const result = await response.json()
          if (result.created > 0) {
            console.log('✅ Auto-converted onboarding answers:', result)
          } else {
            console.log('📋 No new answers to convert')
          }
        }
      } catch (error) {
        console.error('❌ Error auto-converting onboarding answers:', error)
      }
    }
    
    convertOnboardingAnswers()
  }, [user?.id])

  // Fetch chapter stats
  useEffect(() => {
    async function fetchStats() {
      if (!user?.id) return
      
      try {
        // Get event counts per category
        const { data, error } = await supabase
          .from('life_event')
          .select('category')
          .eq('user_id', user.id)
        
        if (error) {
          console.error('Failed to fetch stats:', error)
          return
        }
        
        // Count events per chapter
        const stats: Record<string, number> = {}
        let total = 0
        
        DASHBOARD_CHAPTERS.forEach(chapter => {
          const count = data?.filter((e: { category: string }) => 
            chapter.categories.includes(e.category as typeof chapter.categories[number])
          ).length || 0
          stats[chapter.id] = count
          total += count
        })
        
        setChapterStats(stats)
        setTotalEvents(total)
        console.log('📊 Chapter stats:', stats, 'Total:', total)
      } catch (err) {
        console.error('Error fetching stats:', err)
      }
    }
    
    fetchStats()
  }, [user?.id])

  const handleChapterClick = (chapterId: string) => {
    console.log(`📖 Navigating to chapter: ${chapterId}`)
    router.push(`/dash/${chapterId}`)
  }

  const handleAddMemory = () => {
    console.log('🧠 Navigating to chat to add a memory')
    router.push('/dash/chat')
  }
  
  const handleChatNavigation = () => {
    console.log('🗣️ Navigating to chat for profile completion')
    router.push('/dash/chat')
  }

  // Build tiles from chapters config with stats
  const chapterTiles = DASHBOARD_CHAPTERS.map(chapter => ({
    title: chapter.name,
    content: (
      <div style={{ textAlign: 'center' }}>
        <span className="chapter-icon">{chapter.icon}</span>
        {(chapterStats[chapter.id] ?? 0) > 0 && (
          <span style={{ 
            fontSize: '0.8rem', 
            color: 'var(--theme-text-secondary, #a0a0a0)',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 400,
            marginTop: '8px',
            display: 'block',
            letterSpacing: '0.5px'
          }}>
            {chapterStats[chapter.id]} {chapterStats[chapter.id] === 1 ? 'memory' : 'memories'}
          </span>
        )}
      </div>
    ),
    isInteractive: true,
    slogan: chapter.subtitle,
    onClick: () => handleChapterClick(chapter.id)
  }))

  // Add stats tiles
  const statsTiles = [
    {
      title: "Your Story",
      content: (
        <div style={{ textAlign: 'center' }}>
          <p className="stats-number">
            {totalEvents}
          </p>
          <p style={{ 
            fontSize: '0.9rem', 
            color: 'var(--theme-text-secondary, #a0a0a0)',
            fontFamily: 'Inter, system-ui, sans-serif',
            margin: '8px 0 0',
            letterSpacing: '0.5px'
          }}>
            {totalEvents === 1 ? 'Memory' : 'Memories'} Captured
          </p>
        </div>
      ),
      isInteractive: false,
      slogan: `Across ${DASHBOARD_CHAPTERS.length} life chapters`,
      onClick: undefined as (() => void) | undefined
    }
  ]

  const tilesData = [...chapterTiles, ...statsTiles]

  return (
    <>
      {/* Dashboard-specific CSS with luxury design system */}
      <style jsx>{`
        .section-header {
          text-align: center;
          margin-bottom: 4rem;
          margin-top: 6rem;
          margin-left: auto;
          margin-right: auto;
          padding: 0 5vw;
          max-width: 1400px;
          position: relative;
          z-index: 2;
        }
        
        .section-label {
          font-family: Inter, system-ui, sans-serif;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--theme-accent-gold, #D4AF37);
          margin-bottom: 1.5rem;
          display: block;
        }
        
        .section-title {
          font-family: Playfair Display, Georgia, serif;
          font-size: clamp(2.5rem, 4vw, 4rem);
          font-weight: 400;
          margin-bottom: 1.5rem;
          margin-left: auto;
          margin-right: auto;
          color: var(--theme-text-primary, #e0e0e0);
          line-height: 1.2;
          letter-spacing: -0.02em;
          text-align: center;
        }
        
        .section-subtitle {
          font-family: Playfair Display, Georgia, serif;
          font-style: italic;
          color: var(--theme-accent-gold, #D4AF37);
        }
        
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem 5vw;
          align-items: stretch;
          justify-items: stretch;
        }
        
        .dashboard-tile {
          width: auto !important;
          max-width: none !important;
          min-width: 0 !important;
          aspect-ratio: 1.1;
          height: 100%;
          position: relative;
          margin: 0 !important;
        }
        
        /* Chapter icons styling */
        .chapter-icon {
          font-size: 3.5rem;
          margin-bottom: 1.5rem;
          color: var(--theme-accent-gold, #D4AF37);
          display: block;
        }
        
        /* Stats number styling */
        .stats-number {
          font-family: Playfair Display, Georgia, serif;
          font-size: 2.5rem;
          font-weight: 600;
          color: var(--theme-accent-gold, #D4AF37);
          margin: 0;
        }
        
        /* Responsive grid behavior */
        @media (max-width: 1024px) {
          .dashboard-grid {
            grid-template-columns: repeat(2, minmax(250px, 1fr));
            gap: 1.5rem;
            padding: 2rem 2rem;
          }
          
          .dashboard-tile {
            padding: 1.5rem !important;
          }
        }
        
        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            padding: 1.5rem 1rem;
          }
          
          .dashboard-tile {
            padding: 1rem !important;
          }
          
          .chapter-icon {
            font-size: 2.5rem;
          }
        }
        
        @media (max-width: 480px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
            gap: 0.75rem;
            padding: 0.75rem;
          }
          
          .dashboard-tile {
            aspect-ratio: 1.2;
          }
        }
        
        /* Floating Add Memory Button */
        .floating-add-button {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 100;
          background: var(--theme-accent-gold, #D4AF37);
          color: var(--theme-bg-primary, #050505);
          border: 1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08));
          border-radius: 50%;
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 8px 32px rgba(212, 175, 55, 0.3);
          transition: all 0.3s ease;
        }
        
        .floating-add-button:hover {
          transform: scale(1.1);
          box-shadow: 0 12px 48px rgba(212, 175, 55, 0.4);
        }
        
        @media (max-width: 768px) {
          .floating-add-button {
            bottom: 1.5rem;
            right: 1.5rem;
            width: 56px;
            height: 56px;
            font-size: 1.25rem;
          }
        }
      `}</style>
      
      <div className="h-full" style={{ 
        backgroundColor: 'var(--theme-bg-primary, #050505)', 
        color: 'var(--theme-text-primary, #e0e0e0)', 
        position: 'relative',
        minHeight: '100vh'
      }}>
        {/* Section Header */}
        <div className="section-header">
          <span className="section-label">Your Journey</span>
          <h1 className="section-title">
            Your life, <span className="section-subtitle">beautifully told.</span>
          </h1>
        </div>
        
        {/* Profile Card */}
        {!profileLoading && profile && (
          <div style={{ maxWidth: '1400px', margin: '0 auto 3rem', padding: '0 5vw', position: 'relative', zIndex: 2 }}>
            <ProfileCard
              user={{
                full_name: profile.full_name,
                birth_date: profile.birth_date,
                birth_place: profile.birth_place,
              }}
              attributes={profile.attributes}
              onChatNavigate={handleChatNavigation}
            />
          </div>
        )}
        
        <div className="dashboard-grid" style={{ position: 'relative', zIndex: 2 }}>
          {tilesData.map((tile, index) => (
            <DashboardTile
              key={index}
              title={tile.title}
              content={tile.content}
              isInteractive={tile.isInteractive}
              slogan={tile.slogan}
              onClick={tile.onClick}
            />
          ))}
        </div>
        
        {/* Floating Add Memory Button */}
        <button
          className="floating-add-button"
          onClick={handleAddMemory}
          aria-label="Add a new memory"
          title="Add Memory"
        >
          +
        </button>
      </div>
    </>
  )
}
