'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CHAPTERS_ORDERED } from '@/lib/chapters'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { AddMemoryButton } from '@/components/buttons/AddMemoryButton'

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
        background: 'var(--md-sys-color-surface-container)',
        border: '1px solid var(--md-sys-color-outline-variant)',
        borderRadius: '0',
        aspectRatio: '1',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        cursor: isInteractive ? 'pointer' : 'default',
        transition: 'all 0.25s ease',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
      }}
      onMouseOver={(e) => {
        if (isInteractive) {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.6)'
          e.currentTarget.style.borderColor = 'var(--md-sys-color-primary)'
        }
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.4)'
        e.currentTarget.style.borderColor = 'var(--md-sys-color-outline-variant)'
      }}
    >
      <div style={{ textAlign: 'center' }}>
        {content}
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: 700,
          color: 'var(--md-sys-color-on-surface)',
          margin: '0.5rem 0',
        }}>
          {title}
        </h3>
        {slogan && (
          <p style={{
            fontSize: '0.8rem',
            color: 'var(--md-sys-color-on-surface-variant)',
            margin: 0,
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

  // Build tiles from chapters config with stats
  const chapterTiles = DASHBOARD_CHAPTERS.map(chapter => ({
    title: chapter.name,
    content: (
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: '2.5rem', display: 'block' }}>{chapter.icon}</span>
        {(chapterStats[chapter.id] ?? 0) > 0 && (
          <span style={{ 
            fontSize: '0.7rem', 
            color: 'var(--md-sys-color-primary)',
            fontWeight: 600,
            marginTop: '4px',
            display: 'block'
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
          <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--md-sys-color-primary)', margin: 0 }}>
            {totalEvents}
          </p>
          <p style={{ fontSize: '0.75rem', opacity: 0.75, margin: '4px 0 0' }}>
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
      {/* Dashboard-specific CSS to override timeline card styles for Material Design 3 grid layout */}
      <style jsx>{`
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 2rem;
          max-width: 1024px;
          margin: 0 auto;
          padding: 2rem;
          align-items: stretch;
          justify-items: stretch;
        }
        
        .dashboard-tile {
          /* Material Design 3 Card Styling */
          width: auto !important;
          max-width: none !important;
          min-width: 0 !important;
          aspect-ratio: 1;
          height: 100%;
          position: relative;
          
          /* Reset timeline-specific margins */
          margin: 0 !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
          
          /* Material Design 3 Surface Container - Sharp Square Design */
          background: var(--md-sys-color-surface-container) !important;
          border: 1px solid var(--md-sys-color-outline-variant) !important;
          border-radius: 0 !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4) !important;
          
          /* Center content layout */
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          text-align: center !important;
          padding: 1.5rem !important;
          
          /* Animation foundation */
          transition: all var(--md-sys-motion-duration-medium1, 250ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)) !important;
          will-change: transform, box-shadow !important;
        }
        
        /* Interactive tiles (Picture Chapters) - Enhanced hover effects */
        .dashboard-tile.interactive-tile:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6) !important;
          border-color: var(--md-sys-color-on-surface) !important;
        }
        
        .dashboard-tile.interactive-tile::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--md-sys-color-on-surface), var(--md-sys-color-on-surface-variant));
          transform: scaleX(0);
          transition: transform var(--md-sys-motion-duration-medium1, 250ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }
        
        .dashboard-tile.interactive-tile:hover::before {
          transform: scaleX(1);
        }
        
        /* Static tiles (KPI, slogan, call-to-action) - Enhanced subtle styling */
        .dashboard-tile.static-tile:hover {
          transform: none !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4) !important;
          border-color: var(--md-sys-color-outline-variant) !important;
        }
        
        /* Feature Card Styling - Tiles with icons */
        .dashboard-tile.feature-card {
          background: var(--md-sys-color-surface-container) !important;
          border: 2px solid var(--md-sys-color-outline-variant) !important;
        }
        
        .dashboard-tile.feature-card:hover {
          border-color: var(--md-sys-color-primary) !important;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6) !important;
        }
        
        /* View Hero Styling - Tiles without icons (stats, CTAs) */
        .dashboard-tile.view-hero {
          background: var(--md-sys-color-primary-container) !important;
          border: 2px solid var(--md-sys-color-primary) !important;
          color: var(--md-sys-color-on-primary-container) !important;
        }
        
        .dashboard-tile.view-hero:hover {
          background: var(--md-sys-color-primary) !important;
          color: var(--md-sys-color-on-primary) !important;
          transform: scale(1.02) !important;
        }
        
        .dashboard-tile.view-hero .card-title {
          color: inherit !important;
        }
        
        /* Card content centering */
        .dashboard-tile .card-content-container {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          min-height: 0;
          gap: 0.5rem;
        }
        
        .dashboard-tile .card-main-content {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        
        .dashboard-tile .card-primary-info {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        
        /* Typography improvements - Enhanced hierarchy */
        .dashboard-tile .card-title {
          font-size: 1.125rem !important;
          font-weight: 700 !important;
          color: var(--md-sys-color-on-surface) !important;
          line-height: 1.2 !important;
          text-align: center !important;
          margin: 0 !important;
          word-wrap: break-word;
          letter-spacing: -0.01em;
        }
        
        /* SVG styling */
        .dashboard-tile img {
          opacity: 0.9;
          transition: opacity var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }
        
        .dashboard-tile.interactive-tile:hover img {
          opacity: 1;
        }
        
        /* Responsive grid behavior */
        @media (max-width: 1024px) {
          .dashboard-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 1.5rem;
            padding: 1.5rem;
          }
        }
        
        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            padding: 1rem;
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
      `}</style>
      
      <div className="h-full p-6" style={{ backgroundColor: 'var(--md-sys-color-background)' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '1rem',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            padding: '0.75rem 0',
            background: 'var(--md-sys-color-background)',
          }}
        >
          <AddMemoryButton
            onClick={handleAddMemory}
            aria-label="Add a new memory"
          />
        </div>
        <div className="dashboard-grid">
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
      </div>
    </>
  )
}
