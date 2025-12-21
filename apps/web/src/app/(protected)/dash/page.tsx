'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CHAPTERS_ORDERED } from '@/lib/chapters'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useUserProfile } from '@/hooks/useUserProfile'
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
      className={`dashboard-tile feature-card ${isInteractive ? 'interactive' : ''}`}
      onClick={isInteractive ? onClick : undefined}
      style={{
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.0) 100%)',
        border: '1px solid var(--border-color)',
        borderRadius: '4px',
        aspectRatio: '1',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
        cursor: isInteractive ? 'pointer' : 'default',
        transition: 'transform 0.5s ease, border-color 0.5s ease',
        backdropFilter: 'blur(20px)',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseOver={(e) => {
        if (isInteractive) {
          e.currentTarget.style.transform = 'translateY(-10px)'
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
        }
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = 'var(--border-color)'
      }}
    >
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        {content}
        <h3 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.5rem',
          fontWeight: 400,
          color: 'var(--text-color)',
          margin: '1.5rem 0 1rem',
          letterSpacing: '-0.01em'
        }}>
          {title}
        </h3>
        {slogan && (
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.9rem',
            color: '#a0a0a0',
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
            color: '#a0a0a0',
            fontFamily: 'var(--font-sans)',
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
            color: '#a0a0a0',
            fontFamily: 'var(--font-sans)',
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
        .grain-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
          opacity: 0.04;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
        
        .section-header {
          text-align: center;
          margin-bottom: 4rem;
          padding: 0 5vw;
          position: relative;
          z-index: 2;
        }
        
        .section-label {
          font-family: 'var(--font-sans)';
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--accent-gold);
          margin-bottom: 1.5rem;
          display: block;
        }
        
        .section-title {
          font-family: 'var(--font-serif)';
          font-size: clamp(2.5rem, 4vw, 4rem);
          font-weight: 400;
          margin-bottom: 1.5rem;
          color: var(--text-color);
          line-height: 1.2;
          letter-spacing: -0.02em;
        }
        
        .section-subtitle {
          font-family: 'var(--font-serif-text)';
          font-style: italic;
          color: var(--accent-gold);
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
          /* Luxury Card Styling */
          width: auto !important;
          max-width: none !important;
          min-width: 0 !important;
          aspect-ratio: 1.1;
          height: 100%;
          position: relative;
          
          /* Reset margins */
          margin: 0 !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
          
          /* Luxury Glass Morphism Design */
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.0) 100%) !important;
          border: 1px solid var(--border-color) !important;
          border-radius: 4px !important;
          backdrop-filter: blur(20px) !important;
          
          /* Center content layout */
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          text-align: center !important;
          padding: 2rem !important;
          
          /* Elegant animations */
          transition: transform 0.5s ease, border-color 0.5s ease !important;
          will-change: transform !important;
        }
        
        /* Interactive tiles (Picture Chapters) - Elegant hover effects */
        .dashboard-tile.interactive:hover {
          transform: translateY(-10px) !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
        }
        
        /* Feature card golden accent */
        .dashboard-tile.feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--accent-gold), var(--accent-gold-dim));
          transform: scaleX(0);
          transition: transform 0.3s ease;
          z-index: 2;
        }
        
        .dashboard-tile.feature-card.interactive:hover::before {
          transform: scaleX(1);
        }
        
        /* Chapter icons styling */
        .chapter-icon {
          font-size: 3.5rem;
          margin-bottom: 1.5rem;
          color: var(--accent-gold);
          display: block;
        }
        
        /* Stats number styling */
        .stats-number {
          font-family: var(--font-serif);
          font-size: 2.5rem;
          font-weight: 600;
          color: var(--accent-gold);
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
          
          .dashboard-tile .card-title {
            font-size: 0.9rem !important;
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
          background: var(--accent-gold);
          color: #000;
          border: none;
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
      
      <div className="h-full" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', position: 'relative' }}>
        <div className="grain-overlay"></div>
        
        {/* Section Header - Moved to top */}
        <div className="section-header">
          <span className="section-label">Your Journey</span>
          <h1 className="section-title">
            Your life, <span className="section-subtitle">beautifully told.</span>
          </h1>
        </div>
        
        {/* Profile Card - Shows values, influences, motto */}
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
