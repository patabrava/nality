'use client'

import { useTheme } from '@/stores/theme'
import { useEffect, useState } from 'react'

/**
 * ThemeToggle Component
 * 
 * Material Design 3 compliant theme toggle switch.
 * Following CODE_EXPANSION principles - new component that doesn't 
 * modify existing functionality.
 */
export function ThemeToggle() {
  const { mode, resolvedTheme, setMode } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    // Return static placeholder during SSR/hydration
    return (
      <div className="theme-toggle-skeleton">
        <div className="toggle-placeholder" />
      </div>
    )
  }
  
  const handleToggle = () => {
    // Cycle through: system → light → dark → system
    switch (mode) {
      case 'system':
        setMode('light')
        break
      case 'light':
        setMode('dark')
        break
      case 'dark':
        setMode('system')
        break
    }
  }
  
  const getToggleLabel = () => {
    switch (mode) {
      case 'system':
        return `Auto (${resolvedTheme})`
      case 'light':
        return 'Light'
      case 'dark':
        return 'Dark'
    }
  }
  
  const getToggleIcon = () => {
    switch (mode) {
      case 'system':
        return '🌓' // Half moon for auto
      case 'light':
        return '☀️' // Sun for light
      case 'dark':
        return '🌙' // Moon for dark
    }
  }
  
  return (
    <>
      <button
        onClick={handleToggle}
        className="theme-toggle"
        aria-label={`Switch theme (currently ${getToggleLabel()})`}
        title={`Current theme: ${getToggleLabel()}`}
      >
        <span className="toggle-icon" aria-hidden="true">
          {getToggleIcon()}
        </span>
        <span className="toggle-label">
          {getToggleLabel()}
        </span>
      </button>
      
      <style jsx>{`
        .theme-toggle-skeleton {
          width: 100px;
          height: 40px;
          display: flex;
          align-items: center;
        }
        
        .toggle-placeholder {
          width: 80px;
          height: 32px;
          background: var(--md-sys-color-surface-container);
          border-radius: 16px;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .theme-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: var(--md-sys-color-surface-container);
          border: 1px solid var(--md-sys-color-outline-variant);
          border-radius: 20px;
          color: var(--md-sys-color-on-surface);
          font-family: var(--font-primary);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
          outline: none;
        }
        
        .theme-toggle:hover {
          background: var(--md-sys-color-surface-container-high);
          border-color: var(--md-sys-color-outline);
          transform: translateY(-1px);
        }
        
        .theme-toggle:focus-visible {
          outline: 2px solid var(--md-sys-color-primary);
          outline-offset: 2px;
        }
        
        .theme-toggle:active {
          transform: translateY(0);
          background: var(--md-sys-color-surface-container-high);
        }
        
        .toggle-icon {
          font-size: 16px;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
        }
        
        .toggle-label {
          font-size: 14px;
          font-weight: 500;
          min-width: 60px;
          text-align: left;
        }
        
        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .theme-toggle {
            border-width: 2px;
          }
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .theme-toggle {
            transition: none;
          }
          
          .theme-toggle:hover {
            transform: none;
          }
          
          .theme-toggle:active {
            transform: none;
          }
        }
      `}</style>
    </>
  )
}

/**
 * Compact ThemeToggle for mobile/constrained spaces
 */
export function ThemeToggleCompact() {
  const { mode, setMode } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return <div className="theme-toggle-compact-skeleton" />
  }
  
  const handleToggle = () => {
    // Simple toggle between light and dark (no system mode in compact)
    switch (mode) {
      case 'system':
      case 'dark':
        setMode('light')
        break
      case 'light':
        setMode('dark')
        break
    }
  }
  
  const getIcon = () => {
    return mode === 'light' ? '🌙' : '☀️'
  }
  
  return (
    <>
      <button
        onClick={handleToggle}
        className="theme-toggle-compact"
        aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} theme`}
      >
        <span className="toggle-icon-compact" aria-hidden="true">
          {getIcon()}
        </span>
      </button>
      
      <style jsx>{`
        .theme-toggle-compact-skeleton {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--md-sys-color-surface-container);
          animation: pulse 2s infinite;
        }
        
        .theme-toggle-compact {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--md-sys-color-surface-container);
          border: 1px solid var(--md-sys-color-outline-variant);
          border-radius: 50%;
          color: var(--md-sys-color-on-surface);
          cursor: pointer;
          transition: all var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
          outline: none;
        }
        
        .theme-toggle-compact:hover {
          background: var(--md-sys-color-surface-container-high);
          transform: scale(1.05);
        }
        
        .theme-toggle-compact:focus-visible {
          outline: 2px solid var(--md-sys-color-primary);
          outline-offset: 2px;
        }
        
        .theme-toggle-compact:active {
          transform: scale(0.95);
        }
        
        .toggle-icon-compact {
          font-size: 18px;
          line-height: 1;
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .theme-toggle-compact {
            transition: none;
          }
          
          .theme-toggle-compact:hover {
            transform: none;
          }
          
          .theme-toggle-compact:active {
            transform: none;
          }
        }
      `}</style>
    </>
  )
}
