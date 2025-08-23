'use client'

/**
 * View Module Placeholder
 * Preview interface for future timeline view configurator
 * Material Design 3 compliant implementation
 */
export function ViewPlaceholder() {
  console.log('[ViewPlaceholder] Component mounted')

  return (
    <>
      {/* Material Design 3 styling for view module */}
      <style jsx>{`
        .view-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          background: var(--md-sys-color-background);
          color: var(--md-sys-color-on-background);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
          text-align: center;
        }
        
        .view-hero {
          text-align: center;
          padding: 2rem 0;
          background: linear-gradient(135deg, var(--md-sys-color-surface-container), var(--md-sys-color-surface-container-high));
          border-radius: 24px;
          border: 1px solid var(--md-sys-color-outline-variant);
          position: relative;
          overflow: hidden;
          width: 100%;
          max-width: 600px;
        }
        
        .view-hero::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 40px 40px;
          animation: float var(--md-sys-motion-duration-long2) ease-in-out infinite alternate;
        }
        
        .view-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          position: relative;
          z-index: 1;
        }
        
        .view-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 1rem;
          position: relative;
          z-index: 1;
          line-height: 1.3;
        }
        
        .view-subtitle {
          font-size: 1rem;
          color: var(--md-sys-color-on-surface-variant);
          line-height: 1.5;
          position: relative;
          z-index: 1;
          opacity: 0.9;
          margin-bottom: 1.5rem;
        }
        
        .view-button {
          height: 48px;
          padding: 0 2rem;
          background: var(--md-sys-color-primary-container);
          color: var(--md-sys-color-on-primary-container);
          border: none;
          border-radius: 24px;
          font-size: 1rem;
          font-weight: 600;
          cursor: not-allowed;
          transition: all var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard);
          opacity: 0.6;
          font-family: 'Roboto', system-ui, sans-serif;
          position: relative;
          z-index: 1;
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          width: 100%;
          max-width: 800px;
        }
        
        .feature-card {
          background: var(--md-sys-color-surface-container);
          border-radius: 16px;
          padding: 1.5rem;
          border: 1px solid var(--md-sys-color-outline-variant);
          transition: all var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard);
          position: relative;
          overflow: hidden;
        }
        
        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--md-sys-color-on-surface), var(--md-sys-color-on-surface-variant));
          transform: scaleX(0);
          transition: transform var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard);
        }
        
        .feature-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
          border-color: var(--md-sys-color-outline);
        }
        
        .feature-card:hover::before {
          transform: scaleX(1);
        }
        
        .feature-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 0.75rem;
        }
        
        .feature-description {
          font-size: 0.875rem;
          color: var(--md-sys-color-on-surface-variant);
          line-height: 1.5;
        }
        
        /* Animation keyframes */
        @keyframes float {
          from {
            transform: translateY(0px);
          }
          to {
            transform: translateY(-10px);
          }
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
          .view-container {
            padding: 1rem;
            gap: 1.5rem;
          }
          
          .view-hero {
            padding: 1.5rem;
          }
          
          .view-title {
            font-size: 1.75rem;
          }
          
          .view-icon {
            font-size: 3rem;
          }
          
          .features-grid {
            grid-template-columns: 1fr;
          }
          
          .feature-card {
            padding: 1.25rem;
          }
        }
      `}</style>
      
      <section className="view-container">
        {/* Hero Section */}
        <div className="view-hero">
          <div className="view-icon">⚙️</div>
          
          <h2 className="view-title">
            Timeline View Configurator
          </h2>
          
          <p className="view-subtitle">
            Soon you'll be able to tailor how your entire life story is displayed—pick categories, 
            zoom levels, visual styles, and create custom views that highlight what matters most to you.
          </p>
          
          <button 
            className="view-button"
            disabled
          >
            Design My View (Coming Soon)
          </button>
        </div>

        {/* Features Grid */}
        <div className="features-grid">
          <div className="feature-card">
            <h3 className="feature-title">
              Category Filters
            </h3>
            <p className="feature-description">
              Show only specific life areas: career, family, travel, achievements, and more.
            </p>
          </div>
          
          <div className="feature-card">
            <h3 className="feature-title">
              Time Zoom Levels
            </h3>
            <p className="feature-description">
              Focus on decades, years, or drill down to individual months and days.
            </p>
          </div>
          
          <div className="feature-card">
            <h3 className="feature-title">
              Visual Themes
            </h3>
            <p className="feature-description">
              Choose layouts: detailed cards, compact lists, or photo-focused galleries.
            </p>
          </div>
          
          <div className="feature-card">
            <h3 className="feature-title">
              Story Flows
            </h3>
            <p className="feature-description">
              Create narrative sequences that connect related events across time.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
