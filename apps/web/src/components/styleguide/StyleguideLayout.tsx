'use client'

import { useState } from 'react'

interface StyleguideSection {
  id: string
  title: string
  description: string
}

const sections: StyleguideSection[] = [
  { id: 'overview', title: 'Overview', description: 'Design principles and philosophy' },
  { id: 'colors', title: 'Colors', description: 'Color palette and usage guidelines' },
  { id: 'typography', title: 'Typography', description: 'Type scale, fonts, and text styles' },
  { id: 'spacing', title: 'Spacing', description: 'Layout grid, spacing system, and rhythm' },
  { id: 'components', title: 'Components', description: 'UI components and patterns' },
  { id: 'forms', title: 'Forms', description: 'Input fields, buttons, and form patterns' },
  { id: 'navigation', title: 'Navigation', description: 'Headers, menus, and navigation patterns' },
  { id: 'layout', title: 'Layout', description: 'Grids, containers, and responsive patterns' },
  { id: 'animations', title: 'Animations', description: 'Motion design and transitions' },
  { id: 'accessibility', title: 'Accessibility', description: 'Inclusive design guidelines' }
]

interface StyleguideLayoutProps {
  children: React.ReactNode
}

export default function StyleguideLayout({ children }: StyleguideLayoutProps) {
  const [activeSection, setActiveSection] = useState('overview')

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveSection(sectionId)
    }
  }

  return (
    <div className="styleguide-layout">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span>Nality Design System</span>
          </div>
          <nav className="nav-tabs">
            <a href="/" className="nav-tab">
              ← Back to App
            </a>
          </nav>
        </div>
      </header>

      <div className="styleguide-container">
        {/* Sidebar Navigation */}
        <aside className="styleguide-sidebar">
          <div className="sidebar-content">
            <h2 className="sidebar-title">Design System</h2>
            <nav className="sidebar-nav">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`sidebar-nav-item ${activeSection === section.id ? 'active' : ''}`}
                >
                  <span className="nav-item-title">{section.title}</span>
                  <span className="nav-item-description">{section.description}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="styleguide-main">
          <div className="styleguide-content">
            {children}
          </div>
        </main>
      </div>

      <style jsx>{`
        .styleguide-layout {
          min-height: 100vh;
          background: var(--md-sys-color-background);
          color: var(--md-sys-color-on-background);
        }

        .styleguide-container {
          display: flex;
          min-height: calc(100vh - 48px);
        }

        .styleguide-sidebar {
          width: 280px;
          background: var(--md-sys-color-surface-container);
          border-right: 1px solid var(--md-sys-color-outline-variant);
          position: sticky;
          top: 48px;
          height: calc(100vh - 48px);
          overflow-y: auto;
        }

        .sidebar-content {
          padding: 32px 24px;
        }

        .sidebar-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 24px;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sidebar-nav-item {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 12px 16px;
          border-radius: 12px;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
          text-align: left;
        }

        .sidebar-nav-item:hover {
          background: var(--md-sys-color-surface-container-high);
        }

        .sidebar-nav-item.active {
          background: var(--md-sys-color-primary-container);
          color: var(--md-sys-color-on-primary-container);
        }

        .nav-item-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: inherit;
          margin-bottom: 2px;
        }

        .nav-item-description {
          font-size: 0.75rem;
          color: var(--md-sys-color-on-surface-variant);
          opacity: 0.8;
        }

        .sidebar-nav-item.active .nav-item-description {
          color: var(--md-sys-color-on-primary-container);
          opacity: 0.8;
        }

        .styleguide-main {
          flex: 1;
          overflow-y: auto;
        }

        .styleguide-content {
          max-width: 1000px;
          margin: 0 auto;
          padding: 48px 32px;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .styleguide-sidebar {
            display: none;
          }
          
          .styleguide-content {
            padding: 24px 16px;
          }
        }
      `}</style>
    </div>
  )
}
