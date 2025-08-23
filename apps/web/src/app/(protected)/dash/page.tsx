'use client'

import Image from 'next/image'

// Dashboard tile data structure for content management
interface TileData {
  title: string
  content: React.ReactNode
  isInteractive: boolean
  svgPath?: string
  slogan?: string
  onClick?: () => void
}

// Simple dashboard tile component that reuses timeline card styling
interface DashboardTileProps {
  title: string
  content: React.ReactNode
  isInteractive?: boolean
  svgPath?: string
  slogan?: string
  onClick?: () => void
}

function DashboardTile({ title, content, isInteractive = false, svgPath, slogan, onClick }: DashboardTileProps) {
  const tileClasses = [
    'timeline-event-card',
    'standard-text-card',
    'dashboard-tile', // Add custom class for grid-specific overrides
    svgPath ? 'feature-card' : 'view-hero', // Conditional class based on icon presence
    isInteractive ? 'cursor-pointer interactive-tile' : 'static-tile'
  ].filter(Boolean).join(' ')

  const handleClick = () => {
    if (isInteractive && onClick) {
      onClick()
    }
  }

  return (
    <div className={tileClasses} onClick={handleClick}>
      <div className="card-content-container">
        <div className="card-main-content">
          <div className="card-primary-info">
            {/* SVG Icon for Picture Chapters */}
            {svgPath && (
              <div className="flex justify-center mb-4">
                <Image
                  src={svgPath}
                  alt={title}
                  width={56}
                  height={56}
                  className="opacity-90"
                  onError={(e) => {
                    console.warn(`Failed to load SVG: ${svgPath}`)
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            )}
            
            <h3 className="card-title text-center mb-2">
              {title}
            </h3>
            
            {/* Slogan for Picture Chapters */}
            {slogan && (
              <p className="text-sm text-center mb-3 opacity-75" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                {slogan}
              </p>
            )}
            
            {/* Content container - conditional display based on tile type */}
            <div className="flex items-center justify-center mt-2">
              {content}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  console.log('📊 Dashboard page mounted')

  const handleChapterClick = (chapterNum: number, theme: string) => {
    console.log(`Picture Chapter ${chapterNum} clicked: ${theme}`)
    // Add navigation logic here
  }

  // Demo content data following the life journey themes
  const tilesData: TileData[] = [
    // Row 1
    {
      title: "Family Roots",
      content: <p className="text-2xl font-bold">1</p>,
      isInteractive: true,
      svgPath: "/family_roots.svg",
      slogan: "Where Your Story Begins",
      onClick: () => handleChapterClick(1, "Family Roots & Origins")
    },
    {
      title: "Childhood Memories", 
      content: <p className="text-2xl font-bold">2</p>,
      isInteractive: true,
      svgPath: "/childhood.svg",
      slogan: "First Steps, First Dreams",
      onClick: () => handleChapterClick(2, "Childhood")
    },
    {
      title: "Life Events",
      content: (
        <div className="text-center">
          <p className="text-lg font-bold" style={{ color: 'var(--md-sys-color-primary)' }}>247</p>
          <p className="text-xs opacity-75">Memories Captured</p>
          <p className="text-xs opacity-60">Across 6 Decades</p>
        </div>
      ),
      isInteractive: false
    },
    {
      title: "Learning Journey",
      content: <p className="text-2xl font-bold">3</p>,
      isInteractive: true,
      svgPath: "/education.svg", 
      slogan: "Knowledge That Shaped You",
      onClick: () => handleChapterClick(3, "Education & Learning")
    },
    // Row 2  
    {
      title: "Career Milestones",
      content: <p className="text-2xl font-bold">4</p>,
      isInteractive: true,
      svgPath: "/career_growth.svg",
      slogan: "Professional Achievements", 
      onClick: () => handleChapterClick(4, "Career & Professional Growth")
    },
    {
      title: "Your Story Matters",
      content: (
        <div className="text-center">
          <p className="text-sm font-medium mb-1">Every Memory</p>
          <p className="text-sm font-bold">Counts</p>
          <p className="text-xs opacity-60 mt-1">Keep Adding Chapters</p>
        </div>
      ),
      isInteractive: false
    },
    {
      title: "Love & Partnership",
      content: <p className="text-2xl font-bold">5</p>,
      isInteractive: true,
      svgPath: "/marriage_partnership.svg",
      slogan: "Shared Life Adventures",
      onClick: () => handleChapterClick(5, "Marriage & Partnership")
    },
    {
      title: "AI Assistant Ready",
      content: (
        <div className="text-center">
          <p className="text-lg font-bold" style={{ color: 'var(--md-sys-color-primary)' }}>Chat Now</p>
          <p className="text-xs opacity-75 mt-1">Add More Memories</p>
        </div>
      ),
      isInteractive: false
    }
  ]

  return (
    <>
      {/* Dashboard-specific CSS to override timeline card styles for Material Design 3 grid layout */}
      <style jsx>{`
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .dashboard-tile {
          /* Material Design 3 Card Styling */
          width: auto !important;
          max-width: none !important;
          min-width: 0 !important;
          aspect-ratio: 1;
          
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
            grid-template-columns: repeat(3, 1fr);
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
        <div className="dashboard-grid">
          {tilesData.map((tile, index) => (
            <DashboardTile
              key={index}
              title={tile.title}
              content={tile.content}
              isInteractive={tile.isInteractive}
              {...(tile.svgPath && { svgPath: tile.svgPath })}
              {...(tile.slogan && { slogan: tile.slogan })}
              {...(tile.onClick && { onClick: tile.onClick })}
            />
          ))}
        </div>
      </div>
    </>
  )
}
