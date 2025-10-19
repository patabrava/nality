'use client'

export default function NavigationSection() {
  return (
    <section id="navigation" className="styleguide-section">
      <div className="section-header">
        <h1 className="section-title">Navigation</h1>
        <p className="section-subtitle">
          Intuitive navigation patterns that guide users through the application seamlessly
        </p>
      </div>

      {/* Primary Navigation */}
      <div className="nav-category">
        <h2 className="category-title">Primary Navigation</h2>
        <div className="nav-examples">
          <div className="nav-example">
            <h3>Desktop Header</h3>
            <nav className="desktop-nav">
              <div className="nav-brand">
                <span className="brand-logo">Nality</span>
              </div>
              <div className="nav-links">
                <a href="#" className="nav-link active">Dashboard</a>
                <a href="#" className="nav-link">Timeline</a>
                <a href="#" className="nav-link">Chat</a>
                <a href="#" className="nav-link">Settings</a>
              </div>
              <div className="nav-actions">
                <button className="btn-secondary">Help</button>
                <button className="btn-primary">Sign Out</button>
              </div>
            </nav>
          </div>

          <div className="nav-example">
            <h3>Mobile Navigation</h3>
            <div className="mobile-nav-container">
              <div className="mobile-header">
                <button className="hamburger">☰</button>
                <span className="mobile-brand">Nality</span>
                <button className="profile-btn">👤</button>
              </div>
              <nav className="mobile-nav">
                <a href="#" className="mobile-nav-item active">
                  <span className="nav-icon">🏠</span>
                  <span>Dashboard</span>
                </a>
                <a href="#" className="mobile-nav-item">
                  <span className="nav-icon">📅</span>
                  <span>Timeline</span>
                </a>
                <a href="#" className="mobile-nav-item">
                  <span className="nav-icon">💬</span>
                  <span>Chat</span>
                </a>
                <a href="#" className="mobile-nav-item">
                  <span className="nav-icon">⚙️</span>
                  <span>Settings</span>
                </a>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Navigation */}
      <div className="nav-category">
        <h2 className="category-title">Secondary Navigation</h2>
        <div className="nav-examples">
          <div className="nav-example">
            <h3>Sidebar Navigation</h3>
            <div className="sidebar-nav">
              <div className="sidebar-section">
                <h4 className="sidebar-title">Personal</h4>
                <nav className="sidebar-links">
                  <a href="#" className="sidebar-link active">
                    <span className="link-icon">👤</span>
                    Profile
                  </a>
                  <a href="#" className="sidebar-link">
                    <span className="link-icon">📊</span>
                    Analytics
                  </a>
                  <a href="#" className="sidebar-link">
                    <span className="link-icon">🔔</span>
                    Notifications
                  </a>
                </nav>
              </div>
              <div className="sidebar-section">
                <h4 className="sidebar-title">Content</h4>
                <nav className="sidebar-links">
                  <a href="#" className="sidebar-link">
                    <span className="link-icon">📝</span>
                    Life Events
                  </a>
                  <a href="#" className="sidebar-link">
                    <span className="link-icon">📸</span>
                    Media
                  </a>
                  <a href="#" className="sidebar-link">
                    <span className="link-icon">🏷️</span>
                    Tags
                  </a>
                </nav>
              </div>
            </div>
          </div>

          <div className="nav-example">
            <h3>Tab Navigation</h3>
            <div className="tab-nav-container">
              <nav className="tab-nav">
                <button className="tab-item active">Overview</button>
                <button className="tab-item">Details</button>
                <button className="tab-item">History</button>
                <button className="tab-item">Settings</button>
              </nav>
              <div className="tab-content">
                <p>Active tab content would be displayed here...</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Utility Navigation */}
      <div className="nav-category">
        <h2 className="category-title">Utility Navigation</h2>
        <div className="nav-examples">
          <div className="nav-example">
            <h3>Breadcrumbs</h3>
            <nav className="breadcrumb-nav">
              <a href="#" className="breadcrumb-link">Home</a>
              <span className="breadcrumb-separator">/</span>
              <a href="#" className="breadcrumb-link">Timeline</a>
              <span className="breadcrumb-separator">/</span>
              <a href="#" className="breadcrumb-link">2024</a>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">January</span>
            </nav>
          </div>

          <div className="nav-example">
            <h3>Pagination</h3>
            <nav className="pagination-nav">
              <button className="pagination-btn" disabled>← Previous</button>
              <div className="pagination-pages">
                <button className="pagination-page">1</button>
                <button className="pagination-page active">2</button>
                <button className="pagination-page">3</button>
                <button className="pagination-page">4</button>
                <span className="pagination-ellipsis">...</span>
                <button className="pagination-page">10</button>
              </div>
              <button className="pagination-btn">Next →</button>
            </nav>
          </div>

          <div className="nav-example">
            <h3>Filter Navigation</h3>
            <div className="filter-nav">
              <div className="filter-section">
                <label className="filter-label">Time Period</label>
                <select className="filter-select">
                  <option>All Time</option>
                  <option>Last Year</option>
                  <option>Last Month</option>
                  <option>Last Week</option>
                </select>
              </div>
              <div className="filter-section">
                <label className="filter-label">Category</label>
                <div className="filter-tags">
                  <button className="filter-tag active">All</button>
                  <button className="filter-tag">Work</button>
                  <button className="filter-tag">Personal</button>
                  <button className="filter-tag">Family</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation States */}
      <div className="nav-category">
        <h2 className="category-title">Navigation States</h2>
        <div className="nav-examples">
          <div className="nav-example">
            <h3>Link States</h3>
            <div className="link-states">
              <a href="#" className="state-link default">Default Link</a>
              <a href="#" className="state-link active">Active Link</a>
              <a href="#" className="state-link hover">Hover Link</a>
              <a href="#" className="state-link visited">Visited Link</a>
              <span className="state-link disabled">Disabled Link</span>
            </div>
          </div>

          <div className="nav-example">
            <h3>Loading States</h3>
            <div className="loading-states">
              <nav className="loading-nav">
                <div className="nav-skeleton"></div>
                <div className="nav-skeleton short"></div>
                <div className="nav-skeleton"></div>
                <div className="nav-skeleton long"></div>
              </nav>
              <p className="loading-caption">Navigation loading state</p>
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

        .nav-category {
          margin-bottom: 64px;
        }

        .category-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 32px;
        }

        .nav-examples {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 32px;
        }

        .nav-example {
          background: var(--md-sys-color-surface-container);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .nav-example h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 20px;
        }

        /* Desktop Navigation */
        .desktop-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background: var(--md-sys-color-surface);
          border-radius: 8px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .nav-brand {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--md-sys-color-primary);
        }

        .nav-links {
          display: flex;
          gap: 24px;
        }

        .nav-link {
          color: var(--md-sys-color-on-surface-variant);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          padding: 8px 12px;
          border-radius: 6px;
          transition: all var(--md-sys-motion-duration-short1) var(--md-sys-motion-easing-standard);
        }

        .nav-link:hover {
          color: var(--md-sys-color-on-surface);
          background: var(--md-sys-color-surface-container);
        }

        .nav-link.active {
          color: var(--md-sys-color-primary);
          background: var(--md-sys-color-primary-container);
        }

        .nav-actions {
          display: flex;
          gap: 12px;
        }

        .btn-primary {
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
        }

        .btn-secondary {
          background: transparent;
          color: var(--md-sys-color-on-surface-variant);
          border: 1px solid var(--md-sys-color-outline);
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
        }

        /* Mobile Navigation */
        .mobile-nav-container {
          background: var(--md-sys-color-surface);
          border-radius: 8px;
          border: 1px solid var(--md-sys-color-outline-variant);
          overflow: hidden;
        }

        .mobile-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border-bottom: 1px solid var(--md-sys-color-outline-variant);
        }

        .hamburger,
        .profile-btn {
          background: none;
          border: none;
          font-size: 1.25rem;
          color: var(--md-sys-color-on-surface);
          cursor: pointer;
          padding: 8px;
        }

        .mobile-brand {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--md-sys-color-primary);
        }

        .mobile-nav {
          display: flex;
          flex-direction: column;
        }

        .mobile-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          color: var(--md-sys-color-on-surface-variant);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          border-bottom: 1px solid var(--md-sys-color-outline-variant);
          transition: background-color var(--md-sys-motion-duration-short1) var(--md-sys-motion-easing-standard);
        }

        .mobile-nav-item:hover {
          background: var(--md-sys-color-surface-container);
        }

        .mobile-nav-item.active {
          color: var(--md-sys-color-primary);
          background: var(--md-sys-color-primary-container);
        }

        .mobile-nav-item:last-child {
          border-bottom: none;
        }

        .nav-icon {
          font-size: 1.125rem;
        }

        /* Sidebar Navigation */
        .sidebar-nav {
          background: var(--md-sys-color-surface);
          border-radius: 8px;
          border: 1px solid var(--md-sys-color-outline-variant);
          padding: 20px;
          width: 240px;
        }

        .sidebar-section {
          margin-bottom: 24px;
        }

        .sidebar-section:last-child {
          margin-bottom: 0;
        }

        .sidebar-title {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface-variant);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
        }

        .sidebar-links {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          color: var(--md-sys-color-on-surface-variant);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          border-radius: 6px;
          transition: all var(--md-sys-motion-duration-short1) var(--md-sys-motion-easing-standard);
        }

        .sidebar-link:hover {
          background: var(--md-sys-color-surface-container);
          color: var(--md-sys-color-on-surface);
        }

        .sidebar-link.active {
          background: var(--md-sys-color-primary-container);
          color: var(--md-sys-color-primary);
        }

        .link-icon {
          font-size: 1rem;
        }

        /* Tab Navigation */
        .tab-nav-container {
          background: var(--md-sys-color-surface);
          border-radius: 8px;
          border: 1px solid var(--md-sys-color-outline-variant);
          overflow: hidden;
        }

        .tab-nav {
          display: flex;
          border-bottom: 1px solid var(--md-sys-color-outline-variant);
        }

        .tab-item {
          background: none;
          border: none;
          padding: 12px 20px;
          color: var(--md-sys-color-on-surface-variant);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all var(--md-sys-motion-duration-short1) var(--md-sys-motion-easing-standard);
        }

        .tab-item:hover {
          color: var(--md-sys-color-on-surface);
          background: var(--md-sys-color-surface-container);
        }

        .tab-item.active {
          color: var(--md-sys-color-primary);
          border-bottom-color: var(--md-sys-color-primary);
        }

        .tab-content {
          padding: 20px;
          color: var(--md-sys-color-on-surface-variant);
          font-size: 0.875rem;
        }

        /* Breadcrumbs */
        .breadcrumb-nav {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: var(--md-sys-color-surface);
          border-radius: 8px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .breadcrumb-link {
          color: var(--md-sys-color-on-surface-variant);
          text-decoration: none;
          font-size: 0.875rem;
          transition: color var(--md-sys-motion-duration-short1) var(--md-sys-motion-easing-standard);
        }

        .breadcrumb-link:hover {
          color: var(--md-sys-color-primary);
        }

        .breadcrumb-separator {
          color: var(--md-sys-color-outline);
          font-size: 0.875rem;
        }

        .breadcrumb-current {
          color: var(--md-sys-color-on-surface);
          font-size: 0.875rem;
          font-weight: 500;
        }

        /* Pagination */
        .pagination-nav {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px;
          background: var(--md-sys-color-surface);
          border-radius: 8px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .pagination-btn {
          background: none;
          border: 1px solid var(--md-sys-color-outline);
          color: var(--md-sys-color-on-surface-variant);
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all var(--md-sys-motion-duration-short1) var(--md-sys-motion-easing-standard);
        }

        .pagination-btn:hover:not(:disabled) {
          background: var(--md-sys-color-surface-container);
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-pages {
          display: flex;
          align-items: center;
          gap: 4px;
          margin: 0 16px;
        }

        .pagination-page {
          background: none;
          border: 1px solid var(--md-sys-color-outline-variant);
          color: var(--md-sys-color-on-surface-variant);
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 0.875rem;
          cursor: pointer;
          min-width: 36px;
          transition: all var(--md-sys-motion-duration-short1) var(--md-sys-motion-easing-standard);
        }

        .pagination-page:hover {
          background: var(--md-sys-color-surface-container);
        }

        .pagination-page.active {
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
          border-color: var(--md-sys-color-primary);
        }

        .pagination-ellipsis {
          color: var(--md-sys-color-outline);
          padding: 0 8px;
        }

        /* Filter Navigation */
        .filter-nav {
          display: flex;
          flex-wrap: wrap;
          gap: 24px;
          padding: 20px;
          background: var(--md-sys-color-surface);
          border-radius: 8px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .filter-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .filter-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--md-sys-color-on-surface);
        }

        .filter-select {
          padding: 8px 12px;
          border: 1px solid var(--md-sys-color-outline);
          border-radius: 6px;
          background: var(--md-sys-color-surface-container);
          color: var(--md-sys-color-on-surface);
          font-size: 0.875rem;
        }

        .filter-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .filter-tag {
          background: var(--md-sys-color-surface-container);
          border: 1px solid var(--md-sys-color-outline-variant);
          color: var(--md-sys-color-on-surface-variant);
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--md-sys-motion-duration-short1) var(--md-sys-motion-easing-standard);
        }

        .filter-tag:hover {
          background: var(--md-sys-color-surface-container-high);
        }

        .filter-tag.active {
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
          border-color: var(--md-sys-color-primary);
        }

        /* Navigation States */
        .link-states {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 20px;
          background: var(--md-sys-color-surface);
          border-radius: 8px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .state-link {
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
          transition: all var(--md-sys-motion-duration-short1) var(--md-sys-motion-easing-standard);
        }

        .state-link.default {
          color: var(--md-sys-color-on-surface-variant);
        }

        .state-link.active {
          color: var(--md-sys-color-primary);
          background: var(--md-sys-color-primary-container);
        }

        .state-link.hover {
          color: var(--md-sys-color-on-surface);
          background: var(--md-sys-color-surface-container);
        }

        .state-link.visited {
          color: var(--md-sys-color-outline);
        }

        .state-link.disabled {
          color: var(--md-sys-color-outline);
          opacity: 0.5;
          cursor: not-allowed;
        }

        .loading-states {
          text-align: center;
        }

        .loading-nav {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: var(--md-sys-color-surface);
          border-radius: 8px;
          border: 1px solid var(--md-sys-color-outline-variant);
          margin-bottom: 12px;
        }

        .nav-skeleton {
          height: 20px;
          background: var(--md-sys-color-surface-container-high);
          border-radius: 4px;
          animation: pulse 2s ease-in-out infinite;
          width: 80px;
        }

        .nav-skeleton.short {
          width: 60px;
        }

        .nav-skeleton.long {
          width: 100px;
        }

        .loading-caption {
          font-size: 0.75rem;
          color: var(--md-sys-color-on-surface-variant);
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @media (max-width: 768px) {
          .nav-examples {
            grid-template-columns: 1fr;
          }
          
          .desktop-nav {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }
          
          .nav-links {
            justify-content: center;
          }
          
          .nav-actions {
            justify-content: center;
          }
          
          .sidebar-nav {
            width: 100%;
          }
          
          .pagination-nav {
            flex-direction: column;
            align-items: center;
            gap: 12px;
          }
          
          .filter-nav {
            flex-direction: column;
            gap: 16px;
          }
        }
      `}</style>
    </section>
  )
}
