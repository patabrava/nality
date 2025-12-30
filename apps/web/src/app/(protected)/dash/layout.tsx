'use client'

import { useState } from 'react'

// BULLETPROOF HEADER - Zero external dependencies, all inline styles
function DashboardHeader() {
  const [activeTab, setActiveTab] = useState('dashboard')
  
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', path: '/dash' },
    { id: 'timeline', label: 'Timeline', path: '/dash/timeline' },
    { id: 'chat', label: 'Chat', path: '/dash/chat' },
    { id: 'contact', label: 'Contact', path: '/dash/contact' },
  ]

  const navigate = (path: string, tabId: string) => {
    setActiveTab(tabId)
    window.location.href = path
  }

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '64px',
        backgroundColor: 'rgba(10, 10, 10, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 10000,
      }}
    >
      {/* Logo */}
      <div 
        onClick={() => window.location.href = '/'}
        style={{ 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'baseline',
        }}
      >
        <span style={{ 
          color: '#FFFFFF', 
          fontFamily: 'Georgia, serif', 
          fontSize: '1.5rem', 
          fontWeight: 600,
          letterSpacing: '-0.02em',
        }}>
          NALITY
        </span>
        <span style={{ 
          color: '#D4AF37', 
          fontSize: '0.6rem', 
          marginLeft: '2px',
          verticalAlign: 'super',
        }}>
          ®
        </span>
      </div>

      {/* Navigation Tabs */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px',
        borderRadius: '100px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path, tab.id)}
            style={{
              padding: '8px 20px',
              borderRadius: '100px',
              border: 'none',
              backgroundColor: activeTab === tab.id ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
              color: activeTab === tab.id ? '#D4AF37' : 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
            onMouseOver={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'
                e.currentTarget.style.color = '#FFFFFF'
              }
            }}
            onMouseOut={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
              }
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Profile Button */}
      <button
        onClick={() => window.location.href = '/dash/profile'}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.1)'
          e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
        }}
        aria-label="Profile"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </button>
    </header>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#050505',
      color: '#FFFFFF',
    }}>
      {/* Bulletproof Header */}
      <DashboardHeader />
      
      {/* Main content area */}
      <main style={{ 
        flex: 1,
        overflow: 'hidden',
        paddingTop: '80px',
      }}>
        {children}
      </main>
    </div>
  )
}
