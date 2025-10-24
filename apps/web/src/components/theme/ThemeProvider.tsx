'use client'

import { useEffect } from 'react'
import { useTheme } from '@/stores/theme'

interface ThemeProviderProps {
  children: React.ReactNode
}

/**
 * ThemeProvider Component
 * 
 * Handles theme initialization and system preference detection.
 * Following CODE_EXPANSION principles - adds theme functionality 
 * without modifying existing application behavior.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const { initializeTheme } = useTheme()
  
  useEffect(() => {
    // Initialize theme on client-side mount
    const cleanup = initializeTheme()
    
    // Return cleanup function
    return cleanup
  }, [initializeTheme])
  
  return <>{children}</>
}

/**
 * ThemeScript Component
 * 
 * Prevents FOUC (Flash of Unstyled Content) by applying theme
 * before React hydration. This script runs synchronously in the
 * document head before any content is rendered.
 */
export function ThemeScript() {
  const script = `
    (function() {
      try {
        // Get stored theme preference
        const stored = localStorage.getItem('nality-theme-storage');
        let mode = 'system';
        
        if (stored) {
          const parsed = JSON.parse(stored);
          mode = parsed.state?.mode || 'system';
        }
        
        // Determine resolved theme
        let resolvedTheme = 'dark'; // Default fallback
        
        if (mode === 'system') {
          resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        } else {
          resolvedTheme = mode;
        }
        
        // Apply theme immediately
        document.documentElement.setAttribute('data-theme', resolvedTheme);
        
        // Update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
          const color = resolvedTheme === 'dark' ? '#000000' : '#ffffff';
          metaThemeColor.setAttribute('content', color);
        }
      } catch (e) {
        // Fallback to dark theme if anything goes wrong
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  )
}
