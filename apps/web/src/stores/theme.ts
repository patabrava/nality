'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Theme types following Material Design 3 conventions
export type ThemeMode = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

interface ThemeState {
  // Current theme mode (user preference)
  mode: ThemeMode
  // Resolved theme (actual theme applied)
  resolvedTheme: ResolvedTheme
  // System preference detection
  systemPreference: ResolvedTheme
  // Actions
  setMode: (mode: ThemeMode) => void
  setSystemPreference: (preference: ResolvedTheme) => void
  initializeTheme: () => void
}

// Theme detection utilities
const getSystemPreference = (): ResolvedTheme => {
  if (typeof window === 'undefined') return 'dark' // SSR fallback
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const resolveTheme = (mode: ThemeMode, systemPreference: ResolvedTheme): ResolvedTheme => {
  return mode === 'system' ? systemPreference : mode
}

const applyTheme = (theme: ResolvedTheme) => {
  if (typeof document === 'undefined') return
  
  // Apply theme via data attribute on document root
  document.documentElement.setAttribute('data-theme', theme)
  
  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    const color = theme === 'dark' ? '#000000' : '#ffffff'
    metaThemeColor.setAttribute('content', color)
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system', // Default to system preference
      resolvedTheme: 'dark', // Default fallback
      systemPreference: 'dark', // Default fallback
      
      setMode: (mode: ThemeMode) => {
        const { systemPreference } = get()
        const resolvedTheme = resolveTheme(mode, systemPreference)
        
        set({ mode, resolvedTheme })
        applyTheme(resolvedTheme)
      },
      
      setSystemPreference: (preference: ResolvedTheme) => {
        const { mode } = get()
        const resolvedTheme = resolveTheme(mode, preference)
        
        set({ systemPreference: preference, resolvedTheme })
        
        // Only apply if user hasn't explicitly chosen a theme
        if (mode === 'system') {
          applyTheme(resolvedTheme)
        }
      },
      
      initializeTheme: () => {
        if (typeof window === 'undefined') return
        
        const systemPreference = getSystemPreference()
        const { mode } = get()
        const resolvedTheme = resolveTheme(mode, systemPreference)
        
        set({ systemPreference, resolvedTheme })
        applyTheme(resolvedTheme)
        
        // Listen for system preference changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = (e: MediaQueryListEvent) => {
          const newPreference = e.matches ? 'dark' : 'light'
          get().setSystemPreference(newPreference)
        }
        
        mediaQuery.addEventListener('change', handleChange)
        
        // Cleanup function (will be called when component unmounts)
        return () => mediaQuery.removeEventListener('change', handleChange)
      }
    }),
    {
      name: 'nality-theme-storage',
      partialize: (state) => ({ mode: state.mode }), // Only persist user preference
    }
  )
)

// React hook for theme functionality
export const useTheme = () => {
  const store = useThemeStore()
  
  return {
    mode: store.mode,
    resolvedTheme: store.resolvedTheme,
    systemPreference: store.systemPreference,
    setMode: store.setMode,
    initializeTheme: store.initializeTheme,
    // Convenience methods
    setLight: () => store.setMode('light'),
    setDark: () => store.setMode('dark'),
    setSystem: () => store.setMode('system'),
    toggleTheme: () => {
      const currentResolved = store.resolvedTheme
      store.setMode(currentResolved === 'dark' ? 'light' : 'dark')
    }
  }
}
