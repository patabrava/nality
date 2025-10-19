'use client'

export default function LayoutSection() {
  return (
    <section id="layout" className="styleguide-section">
      <div className="section-header">
        <h1 className="section-title">Layout System</h1>
        <p className="section-subtitle">
          Flexible grid systems and layout patterns that create consistent, responsive experiences
        </p>
      </div>

      {/* Grid System */}
      <div className="layout-category">
        <h2 className="category-title">Grid System</h2>
        <div className="grid-examples">
          <div className="grid-example">
            <h3>12-Column Grid</h3>
            <div className="grid-container">
              <div className="grid-demo">
                {Array.from({ length: 12 }, (_, i) => (
                  <div key={i} className="grid-column">
                    <div className="column-content">{i + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid-example">
            <h3>Common Layouts</h3>
            <div className="layout-demos">
              <div className="layout-demo">
                <h4>Two Column (8/4)</h4>
                <div className="layout-grid two-column">
                  <div className="layout-item main">Main Content</div>
                  <div className="layout-item sidebar">Sidebar</div>
                </div>
              </div>
              
              <div className="layout-demo">
                <h4>Three Column (3/6/3)</h4>
                <div className="layout-grid three-column">
                  <div className="layout-item side">Left</div>
                  <div className="layout-item main">Center</div>
                  <div className="layout-item side">Right</div>
                </div>
              </div>

              <div className="layout-demo">
                <h4>Card Grid</h4>
                <div className="layout-grid card-grid">
                  <div className="layout-item card">Card 1</div>
                  <div className="layout-item card">Card 2</div>
                  <div className="layout-item card">Card 3</div>
                  <div className="layout-item card">Card 4</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Container Sizes */}
      <div className="layout-category">
        <h2 className="category-title">Container Sizes</h2>
        <div className="container-examples">
          <div className="container-demo">
            <h3>Container Widths</h3>
            <div className="container-showcase">
              <div className="container-example fluid">
                <div className="container-label">Fluid (100%)</div>
                <div className="container-content">Full width container</div>
              </div>
              <div className="container-example xl">
                <div className="container-label">XL (1200px)</div>
                <div className="container-content">Extra large container</div>
              </div>
              <div className="container-example lg">
                <div className="container-label">Large (960px)</div>
                <div className="container-content">Large container</div>
              </div>
              <div className="container-example md">
                <div className="container-label">Medium (720px)</div>
                <div className="container-content">Medium container</div>
              </div>
              <div className="container-example sm">
                <div className="container-label">Small (540px)</div>
                <div className="container-content">Small container</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page Layouts */}
      <div className="layout-category">
        <h2 className="category-title">Page Layouts</h2>
        <div className="page-examples">
          <div className="page-example">
            <h3>Application Layout</h3>
            <div className="app-layout">
              <div className="app-header">Header</div>
              <div className="app-body">
                <div className="app-sidebar">Sidebar</div>
                <div className="app-main">
                  <div className="app-content">Main Content</div>
                </div>
              </div>
            </div>
          </div>

          <div className="page-example">
            <h3>Article Layout</h3>
            <div className="article-layout">
              <div className="article-header">
                <h4>Article Title</h4>
                <p className="article-meta">By Author • Date • 5 min read</p>
              </div>
              <div className="article-content">
                <p>Article content with proper typography and spacing...</p>
                <p>Multiple paragraphs with consistent line height...</p>
              </div>
              <div className="article-sidebar">
                <div className="sidebar-widget">Table of Contents</div>
                <div className="sidebar-widget">Related Articles</div>
              </div>
            </div>
          </div>

          <div className="page-example">
            <h3>Dashboard Layout</h3>
            <div className="dashboard-layout">
              <div className="dashboard-stats">
                <div className="stat-card">Stat 1</div>
                <div className="stat-card">Stat 2</div>
                <div className="stat-card">Stat 3</div>
                <div className="stat-card">Stat 4</div>
              </div>
              <div className="dashboard-content">
                <div className="dashboard-chart">Chart Widget</div>
                <div className="dashboard-list">Recent Activity</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Breakpoints */}
      <div className="layout-category">
        <h2 className="category-title">Responsive Breakpoints</h2>
        <div className="breakpoint-examples">
          <div className="breakpoint-table">
            <div className="breakpoint-row header">
              <div className="breakpoint-name">Breakpoint</div>
              <div className="breakpoint-size">Min Width</div>
              <div className="breakpoint-description">Usage</div>
            </div>
            <div className="breakpoint-row">
              <div className="breakpoint-name">Mobile</div>
              <div className="breakpoint-size">320px</div>
              <div className="breakpoint-description">Small phones, single column</div>
            </div>
            <div className="breakpoint-row">
              <div className="breakpoint-name">Tablet</div>
              <div className="breakpoint-size">768px</div>
              <div className="breakpoint-description">Tablets, two columns</div>
            </div>
            <div className="breakpoint-row">
              <div className="breakpoint-name">Desktop</div>
              <div className="breakpoint-size">1024px</div>
              <div className="breakpoint-description">Laptops, full layout</div>
            </div>
            <div className="breakpoint-row">
              <div className="breakpoint-name">Large</div>
              <div className="breakpoint-size">1440px</div>
              <div className="breakpoint-description">Large screens, wide layouts</div>
            </div>
          </div>

          <div className="responsive-demo">
            <h3>Responsive Behavior</h3>
            <div className="responsive-showcase">
              <div className="device-demo mobile">
                <div className="device-label">Mobile</div>
                <div className="device-layout">
                  <div className="mobile-stack">
                    <div className="mobile-item">Nav</div>
                    <div className="mobile-item">Content</div>
                    <div className="mobile-item">Footer</div>
                  </div>
                </div>
              </div>
              
              <div className="device-demo tablet">
                <div className="device-label">Tablet</div>
                <div className="device-layout">
                  <div className="tablet-layout">
                    <div className="tablet-nav">Nav</div>
                    <div className="tablet-main">Content</div>
                    <div className="tablet-side">Side</div>
                  </div>
                </div>
              </div>
              
              <div className="device-demo desktop">
                <div className="device-label">Desktop</div>
                <div className="device-layout">
                  <div className="desktop-layout">
                    <div className="desktop-header">Header</div>
                    <div className="desktop-nav">Nav</div>
                    <div className="desktop-main">Main</div>
                    <div className="desktop-side">Sidebar</div>
                  </div>
                </div>
              </div>
            </div>
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

        .layout-category {
          margin-bottom: 64px;
        }

        .category-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 32px;
        }

        /* Grid System */
        .grid-examples {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .grid-example {
          background: var(--md-sys-color-surface-container);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .grid-example h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 20px;
        }

        .grid-container {
          background: var(--md-sys-color-surface);
          border-radius: 8px;
          padding: 16px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .grid-demo {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 8px;
        }

        .grid-column {
          min-height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .column-content {
          background: var(--md-sys-color-primary-container);
          color: var(--md-sys-color-on-primary-container);
          padding: 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
          text-align: center;
          width: 100%;
        }

        .layout-demos {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .layout-demo h4 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 12px;
        }

        .layout-grid {
          display: grid;
          gap: 12px;
          min-height: 100px;
        }

        .two-column {
          grid-template-columns: 2fr 1fr;
        }

        .three-column {
          grid-template-columns: 1fr 2fr 1fr;
        }

        .card-grid {
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        }

        .layout-item {
          background: var(--md-sys-color-surface-container-high);
          border: 1px solid var(--md-sys-color-outline-variant);
          border-radius: 8px;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--md-sys-color-on-surface);
          text-align: center;
        }

        .layout-item.main {
          background: var(--md-sys-color-primary-container);
          color: var(--md-sys-color-on-primary-container);
        }

        /* Container Sizes */
        .container-examples {
          background: var(--md-sys-color-surface-container);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .container-demo h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 20px;
        }

        .container-showcase {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .container-example {
          position: relative;
          border: 2px dashed var(--md-sys-color-outline-variant);
          border-radius: 8px;
          margin: 0 auto;
        }

        .container-example.fluid { max-width: 100%; }
        .container-example.xl { max-width: 1200px; }
        .container-example.lg { max-width: 960px; }
        .container-example.md { max-width: 720px; }
        .container-example.sm { max-width: 540px; }

        .container-label {
          position: absolute;
          top: -12px;
          left: 16px;
          background: var(--md-sys-color-surface-container);
          padding: 4px 8px;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--md-sys-color-on-surface-variant);
          border-radius: 4px;
        }

        .container-content {
          padding: 20px;
          text-align: center;
          font-size: 0.875rem;
          color: var(--md-sys-color-on-surface);
          background: var(--md-sys-color-surface);
          border-radius: 6px;
          margin: 8px;
        }

        /* Page Layouts */
        .page-examples {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 32px;
        }

        .page-example {
          background: var(--md-sys-color-surface-container);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .page-example h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 20px;
        }

        .app-layout {
          display: grid;
          grid-template-rows: auto 1fr;
          height: 200px;
          gap: 2px;
          background: var(--md-sys-color-outline-variant);
          border-radius: 6px;
          overflow: hidden;
        }

        .app-header {
          background: var(--md-sys-color-primary-container);
          color: var(--md-sys-color-on-primary-container);
          padding: 12px;
          font-size: 0.75rem;
          font-weight: 500;
          text-align: center;
        }

        .app-body {
          display: grid;
          grid-template-columns: 80px 1fr;
          gap: 2px;
        }

        .app-sidebar {
          background: var(--md-sys-color-surface-container-high);
          color: var(--md-sys-color-on-surface);
          padding: 12px;
          font-size: 0.75rem;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .app-main {
          background: var(--md-sys-color-surface);
          padding: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .app-content {
          background: var(--md-sys-color-surface-container);
          padding: 16px;
          border-radius: 4px;
          font-size: 0.75rem;
          color: var(--md-sys-color-on-surface);
          width: 100%;
          text-align: center;
        }

        .article-layout {
          display: grid;
          grid-template-columns: 1fr 80px;
          gap: 12px;
          background: var(--md-sys-color-surface);
          border-radius: 6px;
          padding: 16px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .article-header {
          grid-column: 1 / -1;
          margin-bottom: 12px;
        }

        .article-header h4 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 4px;
        }

        .article-meta {
          font-size: 0.75rem;
          color: var(--md-sys-color-on-surface-variant);
          margin: 0;
        }

        .article-content {
          font-size: 0.75rem;
          color: var(--md-sys-color-on-surface-variant);
          line-height: 1.4;
        }

        .article-content p {
          margin: 0 0 8px 0;
        }

        .article-sidebar {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sidebar-widget {
          background: var(--md-sys-color-surface-container);
          padding: 8px;
          border-radius: 4px;
          font-size: 0.625rem;
          color: var(--md-sys-color-on-surface);
          text-align: center;
        }

        .dashboard-layout {
          display: grid;
          gap: 12px;
          background: var(--md-sys-color-surface);
          border-radius: 6px;
          padding: 16px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .dashboard-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }

        .stat-card {
          background: var(--md-sys-color-surface-container);
          padding: 8px;
          border-radius: 4px;
          font-size: 0.625rem;
          color: var(--md-sys-color-on-surface);
          text-align: center;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .dashboard-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 12px;
        }

        .dashboard-chart,
        .dashboard-list {
          background: var(--md-sys-color-surface-container);
          padding: 16px;
          border-radius: 4px;
          font-size: 0.75rem;
          color: var(--md-sys-color-on-surface);
          text-align: center;
          border: 1px solid var(--md-sys-color-outline-variant);
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 80px;
        }

        /* Responsive Breakpoints */
        .breakpoint-examples {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .breakpoint-table {
          background: var(--md-sys-color-surface-container);
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .breakpoint-row {
          display: grid;
          grid-template-columns: 1fr 1fr 2fr;
          gap: 16px;
          padding: 16px;
          border-bottom: 1px solid var(--md-sys-color-outline-variant);
        }

        .breakpoint-row:last-child {
          border-bottom: none;
        }

        .breakpoint-row.header {
          background: var(--md-sys-color-surface-container-high);
          font-weight: 600;
        }

        .breakpoint-name,
        .breakpoint-size,
        .breakpoint-description {
          font-size: 0.875rem;
          color: var(--md-sys-color-on-surface);
        }

        .breakpoint-row:not(.header) .breakpoint-name,
        .breakpoint-row:not(.header) .breakpoint-size,
        .breakpoint-row:not(.header) .breakpoint-description {
          color: var(--md-sys-color-on-surface-variant);
        }

        .responsive-demo {
          background: var(--md-sys-color-surface-container);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .responsive-demo h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 20px;
        }

        .responsive-showcase {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 24px;
        }

        .device-demo {
          text-align: center;
        }

        .device-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 12px;
        }

        .device-layout {
          background: var(--md-sys-color-surface);
          border: 2px solid var(--md-sys-color-outline-variant);
          border-radius: 8px;
          padding: 8px;
        }

        .mobile-stack {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .mobile-item {
          background: var(--md-sys-color-surface-container);
          padding: 8px;
          border-radius: 4px;
          font-size: 0.625rem;
          color: var(--md-sys-color-on-surface);
          text-align: center;
        }

        .tablet-layout {
          display: grid;
          grid-template-columns: 1fr 2fr 1fr;
          gap: 4px;
          height: 80px;
        }

        .tablet-nav,
        .tablet-main,
        .tablet-side {
          background: var(--md-sys-color-surface-container);
          border-radius: 4px;
          font-size: 0.625rem;
          color: var(--md-sys-color-on-surface);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .desktop-layout {
          display: grid;
          grid-template-columns: 1fr 3fr 1fr;
          grid-template-rows: auto 1fr;
          gap: 4px;
          height: 100px;
        }

        .desktop-header {
          grid-column: 1 / -1;
          background: var(--md-sys-color-primary-container);
          color: var(--md-sys-color-on-primary-container);
          border-radius: 4px;
          font-size: 0.625rem;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 24px;
        }

        .desktop-nav,
        .desktop-main,
        .desktop-side {
          background: var(--md-sys-color-surface-container);
          border-radius: 4px;
          font-size: 0.625rem;
          color: var(--md-sys-color-on-surface);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (max-width: 768px) {
          .page-examples {
            grid-template-columns: 1fr;
          }
          
          .responsive-showcase {
            grid-template-columns: 1fr;
          }
          
          .breakpoint-row {
            grid-template-columns: 1fr;
            gap: 8px;
            text-align: center;
          }
          
          .dashboard-stats {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .dashboard-content {
            grid-template-columns: 1fr;
          }
          
          .article-layout {
            grid-template-columns: 1fr;
          }
          
          .app-body {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  )
}
