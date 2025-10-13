'use client'

import { useEffect } from 'react'
import '@/styles/timeline.css'

/**
 * Timeline Alternating Layout Demo
 * Simple demo to verify alternating layout is working correctly
 */
export default function TimelineAlternatingDemo() {
  // Update viewport indicator on resize
  useEffect(() => {
    const updateViewportInfo = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const isDesktop = width >= 768
      
      const viewportEl = document.getElementById('viewport-indicator')
      const layoutEl = document.getElementById('layout-status')
      
      if (viewportEl) {
        viewportEl.textContent = `${width}px × ${height}px`
      }
      
      if (layoutEl) {
        layoutEl.textContent = isDesktop ? 'Active (Desktop)' : 'Inactive (Mobile)'
        layoutEl.style.color = isDesktop ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-error)'
      }
    }
    
    updateViewportInfo()
    window.addEventListener('resize', updateViewportInfo)
    return () => window.removeEventListener('resize', updateViewportInfo)
  }, [])

  // Mock timeline events for testing alternating layout
  const mockEvents = [
    {
      id: '1',
      title: 'First Day of School',
      description: 'Started kindergarten at Lincoln Elementary. Met my best friend Sarah.',
      start_date: '1995-09-01',
      category: 'education',
      importance: 7
    },
    {
      id: '2', 
      title: 'Learned to Ride a Bike',
      description: 'Finally mastered riding without training wheels in the park.',
      start_date: '1996-06-15',
      category: 'personal',
      importance: 8
    },
    {
      id: '3',
      title: 'Family Vacation to Disney World',
      description: 'Amazing week-long trip to Orlando. Rode Space Mountain for the first time.',
      start_date: '1997-07-10',
      category: 'travel', 
      importance: 9
    },
    {
      id: '4',
      title: 'Won Science Fair',
      description: 'First place in the school science fair with volcano project.',
      start_date: '1998-05-20',
      category: 'achievement',
      importance: 8
    },
    {
      id: '5',
      title: 'Started High School',
      description: 'Began freshman year at Roosevelt High School. Nervous but excited.',
      start_date: '2001-09-03',
      category: 'education',
      importance: 7
    }
  ]

  const renderTimelineCard = (event: typeof mockEvents[0], index: number) => {
    const isEven = index % 2 === 0
    const positionClass = isEven ? 'timeline-event-even' : 'timeline-event-odd'
    
    return (
      <div 
        key={`timeline-item-${event.id}`} 
        className={`timeline-item ${positionClass}`}
        style={{ '--item-index': index } as React.CSSProperties}
        title={`Index: ${index}, Class: ${positionClass}, Side: ${isEven ? 'Right' : 'Left'}`}
      >
        {/* Timeline Node */}
        <div className="timeline-event-node moment" />
        
        {/* Timeline Card - Direct child of timeline-item for CSS alternating layout */}
        <div className="timeline-event-card">
            <h3 style={{
              fontSize: 'clamp(1rem, 3vw, 1.25rem)',
              fontWeight: 600,
              color: 'var(--md-sys-color-on-surface)',
              margin: '0 0 8px 0',
              fontFamily: 'Roboto, system-ui, sans-serif'
            }}>
              {event.title}
            </h3>
            
            <p style={{
              fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
              color: 'var(--md-sys-color-on-surface-variant)',
              margin: '0 0 12px 0',
              lineHeight: 1.5
            }}>
              {event.description}
            </p>
            
            <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem' }}>
              <span style={{
                background: 'var(--md-sys-color-secondary-container)',
                color: 'var(--md-sys-color-on-secondary-container)',
                padding: '4px 8px',
                borderRadius: '8px',
                fontWeight: 500
              }}>
                {event.category}
              </span>
              <span style={{
                background: 'var(--md-sys-color-tertiary-container)',
                color: 'var(--md-sys-color-on-tertiary-container)',
                padding: '4px 8px',
                borderRadius: '8px',
                fontWeight: 500
              }}>
                {new Date(event.start_date).getFullYear()}
              </span>
            </div>
          </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'var(--md-sys-color-surface)',
      color: 'var(--md-sys-color-on-surface)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: 'clamp(16px, 4vw, 32px) clamp(12px, 4vw, 32px) clamp(8px, 2vw, 16px) clamp(12px, 4vw, 32px)',
        flexShrink: 0,
        borderBottom: '1px solid var(--md-sys-color-outline-variant)'
      }}>
        <h1 style={{
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          fontWeight: 700,
          color: 'var(--md-sys-color-on-surface)',
          margin: 0,
          fontFamily: 'Roboto, system-ui, sans-serif',
          letterSpacing: '-0.02em'
        }}>
          Timeline Alternating Layout Demo
        </h1>
        
        <p style={{
          fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
          color: 'var(--md-sys-color-on-surface-variant)',
          margin: '8px 0 0 0'
        }}>
          Testing alternating event positioning on both sides of the timeline spine
        </p>
      </div>

      {/* Timeline Content */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: 'clamp(8px, 2vw, 24px) clamp(4px, 2vw, 24px) clamp(8px, 2vw, 24px) clamp(4px, 2vw, 24px)',
        background: 'linear-gradient(to bottom, var(--md-sys-color-surface) 0%, var(--md-sys-color-surface-container-low) 50%, var(--md-sys-color-surface) 100%)',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div className="timeline-list">
          {/* Timeline spine */}
          <div className="timeline-spine" />

          {/* Timeline items */}
          {mockEvents.map((event, index) => renderTimelineCard(event, index))}
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        padding: '16px 24px',
        background: 'var(--md-sys-color-surface-container-low)',
        borderTop: '1px solid var(--md-sys-color-outline-variant)',
        fontSize: '0.875rem',
        color: 'var(--md-sys-color-on-surface-variant)'
      }}>
        <strong>Demo Instructions:</strong> Resize your browser window to test responsive breakpoints. 
        Events should alternate between left and right sides of the central spine on desktop (768px+).
        On mobile, events stack on the right side of a left-aligned spine.
        <br />
        <strong>Current viewport:</strong> <span id="viewport-indicator">Loading...</span>
        <br />
        <strong>Alternating layout:</strong> <span id="layout-status">Checking...</span>
      </div>
    </div>
  )
}
