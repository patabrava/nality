'use client'

import { useState } from 'react'
import { useDashboard } from '@/hooks/useDashboard'
import { useRouter } from 'next/navigation'
import { ThemeToggleCompact } from '@/components/theme/ThemeToggle'

const tabs = [
  { id: 'dashboard', label: 'Dashboard', route: '/dash' },
  { id: 'timeline', label: 'Timeline', route: '/dash/timeline' },
  { id: 'chat', label: 'Chat', route: '/dash/chat' },
  { id: 'contact', label: 'Contact', route: '/dash/contact' }
] as const

export function HeaderNavigation() {
  const router = useRouter()
  const { activeModule, setActiveModule } = useDashboard()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleTabSwitch = (tabId: string, route: string) => {
    setActiveModule(tabId)
    router.push(route)
    setIsMobileMenuOpen(false) // Close mobile menu on navigation
  }

  const handleProfileClick = () => {
    // Navigate to profile page
    setIsMobileMenuOpen(false) // Close mobile menu on profile access
    router.push('/dash/profile')
  }

  return (
    <header className="header">
      <div className="header-content">
        {/* Logo */}
        <div className="logo">
          <img src="/ChatGPT%20Image%2023.%20Aug.%202025,%2014_54_47.png" alt="Nality logo" className="brand-full" style={{ height: '48px', width: 'auto' }} />
        </div>
        
        {/* Burger Menu Button (Mobile Only) */}
        <button 
          className="burger-menu-btn"
          aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="burger-line"></span>
          <span className="burger-line"></span>
          <span className="burger-line"></span>
        </button>
        
        {/* Desktop Navigation */}
        <nav className="nav-tabs" role="tablist" aria-label="Dashboard Navigation">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`nav-tab ${activeModule === tab.id ? 'active' : ''}`}
              role="tab"
              aria-selected={activeModule === tab.id}
              aria-label={`Switch to ${tab.label}`}
              onClick={() => handleTabSwitch(tab.id, tab.route)}
            >
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </nav>
        
        {/* User Profile */}
        <div className="header-user">
          <ThemeToggleCompact />
          <button 
            className="user-avatar-btn"
            aria-label="Access user profile"
            onClick={handleProfileClick}
          >
            <span className="user-avatar">👤</span>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu Overlay */}
      <nav className={`mobile-menu ${isMobileMenuOpen ? 'mobile-menu--open' : ''}`} role="tablist" aria-label="Mobile Navigation">
        {/* User Profile in Mobile Menu */}
        <button
          className="mobile-profile"
          aria-label="Access user profile"
          onClick={handleProfileClick}
        >
          <span className="mobile-profile-avatar">👤</span>
          <span className="mobile-profile-label">Profile</span>
        </button>
        
        {/* Navigation Tabs */}
        {tabs.map((tab) => (
          <button
            key={`mobile-${tab.id}`}
            className={`mobile-tab ${activeModule === tab.id ? 'active' : ''}`}
            role="tab"
            aria-selected={activeModule === tab.id}
            aria-label={`Switch to ${tab.label}`}
            onClick={() => handleTabSwitch(tab.id, tab.route)}
          >
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
        
        {/* Theme Toggle in Mobile Menu */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <ThemeToggleCompact />
        </div>
      </nav>
      
      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-menu-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  )
}
