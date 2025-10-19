'use client'

export default function OverviewSection() {
  return (
    <section id="overview" className="styleguide-section">
      <div className="section-header">
        <h1 className="section-title">Nality Design System</h1>
        <p className="section-subtitle">
          A sophisticated monochromatic design system for capturing and sharing life stories
        </p>
      </div>

      <div className="content-grid">
        {/* Design Principles */}
        <div className="principle-card">
          <div className="principle-icon">🎯</div>
          <h3 className="principle-title">Clarity</h3>
          <p className="principle-description">
            Every element serves a purpose. Clean hierarchy and intentional white space guide users through their life story journey.
          </p>
        </div>

        <div className="principle-card">
          <div className="principle-icon">♿</div>
          <h3 className="principle-title">Accessibility</h3>
          <p className="principle-description">
            Designed for users of all ages and abilities. High contrast, keyboard navigation, and screen reader support are built-in.
          </p>
        </div>

        <div className="principle-card">
          <div className="principle-icon">🎨</div>
          <h3 className="principle-title">Consistency</h3>
          <p className="principle-description">
            Unified visual language across all touchpoints. Consistent spacing, typography, and interaction patterns create familiarity.
          </p>
        </div>

        <div className="principle-card">
          <div className="principle-icon">⚡</div>
          <h3 className="principle-title">Performance</h3>
          <p className="principle-description">
            Lightweight and fast. Optimized CSS, minimal dependencies, and efficient rendering for smooth experiences.
          </p>
        </div>
      </div>

      {/* Design Philosophy */}
      <div className="philosophy-section">
        <h2 className="subsection-title">Design Philosophy</h2>
        <div className="philosophy-content">
          <div className="philosophy-text">
            <p>
              Nality's design system draws inspiration from Material Design 3 while maintaining 
              a distinctive monochromatic aesthetic. The system prioritizes emotional connection 
              over flashy interfaces, allowing users' memories and stories to take center stage.
            </p>
            <p>
              Our monochromatic palette creates a sophisticated, timeless feel that won't 
              distract from the personal content. Subtle variations in surface elevation 
              and careful typography hierarchy guide users through complex storytelling flows.
            </p>
          </div>
          <div className="philosophy-visual">
            <div className="gradient-demo">
              <div className="gradient-layer" style={{ background: 'var(--md-sys-color-background)' }}>Background</div>
              <div className="gradient-layer" style={{ background: 'var(--md-sys-color-surface-container-low)' }}>Surface Low</div>
              <div className="gradient-layer" style={{ background: 'var(--md-sys-color-surface-container)' }}>Surface</div>
              <div className="gradient-layer" style={{ background: 'var(--md-sys-color-surface-container-high)' }}>Surface High</div>
              <div className="gradient-layer" style={{ background: 'var(--md-sys-color-primary)' }}>Primary</div>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Foundation */}
      <div className="technical-section">
        <h2 className="subsection-title">Technical Foundation</h2>
        <div className="tech-grid">
          <div className="tech-item">
            <h4>CSS Custom Properties</h4>
            <p>Design tokens implemented as CSS variables for consistency and theming.</p>
          </div>
          <div className="tech-item">
            <h4>Material Design 3</h4>
            <p>Built on MD3 color system with monochromatic customizations.</p>
          </div>
          <div className="tech-item">
            <h4>Responsive First</h4>
            <p>Mobile-first approach with progressive enhancement for larger screens.</p>
          </div>
          <div className="tech-item">
            <h4>Component-Based</h4>
            <p>Reusable React components with TypeScript for type safety.</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .styleguide-section {
          margin-bottom: 80px;
        }

        .section-header {
          text-align: center;
          margin-bottom: 64px;
        }

        .section-title {
          font-size: clamp(2.5rem, 5vw, 3.5rem);
          font-weight: 700;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 16px;
          letter-spacing: -0.02em;
        }

        .section-subtitle {
          font-size: 1.25rem;
          color: var(--md-sys-color-on-surface-variant);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.5;
        }

        .content-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
          margin-bottom: 64px;
        }

        .principle-card {
          background: var(--md-sys-color-surface-container);
          border-radius: 16px;
          padding: 24px;
          border: 1px solid var(--md-sys-color-outline-variant);
          text-align: center;
          transition: transform var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard);
        }

        .principle-card:hover {
          transform: translateY(-4px);
        }

        .principle-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .principle-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 12px;
        }

        .principle-description {
          font-size: 0.875rem;
          color: var(--md-sys-color-on-surface-variant);
          line-height: 1.5;
        }

        .philosophy-section,
        .technical-section {
          margin-bottom: 48px;
        }

        .subsection-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 24px;
        }

        .philosophy-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          align-items: center;
        }

        .philosophy-text p {
          font-size: 1rem;
          color: var(--md-sys-color-on-surface-variant);
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .philosophy-visual {
          display: flex;
          justify-content: center;
        }

        .gradient-demo {
          display: flex;
          flex-direction: column;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid var(--md-sys-color-outline-variant);
          width: 200px;
        }

        .gradient-layer {
          padding: 12px 16px;
          font-size: 0.75rem;
          font-weight: 600;
          text-align: center;
          color: var(--md-sys-color-on-surface);
        }

        .tech-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px;
        }

        .tech-item {
          background: var(--md-sys-color-surface-container);
          border-radius: 12px;
          padding: 20px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .tech-item h4 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 8px;
        }

        .tech-item p {
          font-size: 0.875rem;
          color: var(--md-sys-color-on-surface-variant);
          line-height: 1.4;
        }

        @media (max-width: 768px) {
          .philosophy-content {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          
          .content-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  )
}
