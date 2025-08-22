'use client'

import { useState } from 'react'
import { useDashboard } from '@/hooks/useDashboard'
import { useRouter } from 'next/navigation'

const tabs = [
  { id: 'dashboard', label: 'Dashboard', route: '/dash' },
  { id: 'timeline', label: 'Timeline', route: '/dash/timeline' },
  { id: 'chat', label: 'Chat', route: '/dash/chat' },
  { id: 'contact', label: 'Contact', route: '/dash/contact' },
  { id: 'view', label: 'View', route: '/dash/view' }
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
    // Add profile navigation logic here
    setIsMobileMenuOpen(false) // Close mobile menu on profile access
    // router.push('/profile') // Uncomment when profile route is ready
  }

  return (
    <header className="header">
      <div className="header-content">
        {/* Logo */}
        <div className="logo">
          <span className="brand-full">Nality</span>
          <span className="brand-short">N</span>
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
          <span className="user-avatar">👤</span>
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
