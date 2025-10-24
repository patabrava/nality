/**
 * Theme System Tests
 * 
 * Tests for dark/light theme functionality following CODE_EXPANSION principles.
 * These tests verify the theme system works correctly without modifying existing functionality.
 */

import { renderHook, act } from '@testing-library/react'
import { useTheme } from '@/stores/theme'

// Mock localStorage
const createMockStorage = () => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} }
  }
}

// Mock matchMedia
const createMockMatchMedia = (matches: boolean) => (query: string) => ({
  matches,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => true,
})

describe('Theme System', () => {
  beforeEach(() => {
    // Reset localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: createMockStorage(),
      writable: true
    })
    
    // Reset document.documentElement
    if (typeof document !== 'undefined') {
      document.documentElement.removeAttribute('data-theme')
    }
  })

  describe('Theme Detection', () => {
    test('should default to dark theme when no preference is stored', () => {
      window.matchMedia = createMockMatchMedia(true) // prefers dark
      
      const { result } = renderHook(() => useTheme())
      
      expect(result.current.mode).toBe('system')
      expect(result.current.systemPreference).toBe('dark')
    })

    test('should detect light system preference', () => {
      window.matchMedia = createMockMatchMedia(false) // prefers light
      
      const { result } = renderHook(() => useTheme())
      act(() => {
        result.current.initializeTheme()
      })
      
      expect(result.current.systemPreference).toBe('light')
    })

    test('should detect dark system preference', () => {
      window.matchMedia = createMockMatchMedia(true) // prefers dark
      
      const { result } = renderHook(() => useTheme())
      act(() => {
        result.current.initializeTheme()
      })
      
      expect(result.current.systemPreference).toBe('dark')
    })
  })

  describe('Theme Switching', () => {
    test('should switch to light theme', () => {
      const { result } = renderHook(() => useTheme())
      
      act(() => {
        result.current.setLight()
      })
      
      expect(result.current.mode).toBe('light')
      expect(result.current.resolvedTheme).toBe('light')
    })

    test('should switch to dark theme', () => {
      const { result } = renderHook(() => useTheme())
      
      act(() => {
        result.current.setDark()
      })
      
      expect(result.current.mode).toBe('dark')
      expect(result.current.resolvedTheme).toBe('dark')
    })

    test('should toggle between themes', () => {
      const { result } = renderHook(() => useTheme())
      
      // Start with dark
      act(() => {
        result.current.setDark()
      })
      expect(result.current.resolvedTheme).toBe('dark')
      
      // Toggle to light
      act(() => {
        result.current.toggleTheme()
      })
      expect(result.current.resolvedTheme).toBe('light')
      
      // Toggle back to dark
      act(() => {
        result.current.toggleTheme()
      })
      expect(result.current.resolvedTheme).toBe('dark')
    })

    test('should switch to system preference', () => {
      window.matchMedia = createMockMatchMedia(false) // system prefers light
      
      const { result } = renderHook(() => useTheme())
      
      act(() => {
        result.current.setSystem()
      })
      
      expect(result.current.mode).toBe('system')
      // Should resolve to system preference (light)
      expect(result.current.resolvedTheme).toBe('light')
    })
  })

  describe('Theme Persistence', () => {
    test('should persist theme preference to localStorage', () => {
      const { result } = renderHook(() => useTheme())
      
      act(() => {
        result.current.setLight()
      })
      
      const stored = localStorage.getItem('nality-theme-storage')
      expect(stored).toBeTruthy()
      
      const parsed = JSON.parse(stored!)
      expect(parsed.state.mode).toBe('light')
    })

    test('should restore theme preference from localStorage', () => {
      // Pre-populate localStorage
      localStorage.setItem('nality-theme-storage', JSON.stringify({
        state: { mode: 'dark' },
        version: 0
      }))
      
      const { result } = renderHook(() => useTheme())
      
      expect(result.current.mode).toBe('dark')
    })
  })

  describe('Theme Resolution', () => {
    test('should resolve system mode to actual preference', () => {
      window.matchMedia = createMockMatchMedia(true) // prefers dark
      
      const { result } = renderHook(() => useTheme())
      
      act(() => {
        result.current.setSystem()
        result.current.initializeTheme()
      })
      
      expect(result.current.mode).toBe('system')
      expect(result.current.resolvedTheme).toBe('dark')
    })

    test('should resolve explicit mode directly', () => {
      const { result } = renderHook(() => useTheme())
      
      act(() => {
        result.current.setLight()
      })
      
      expect(result.current.mode).toBe('light')
      expect(result.current.resolvedTheme).toBe('light')
    })
  })

  describe('CSS Integration', () => {
    test('should apply data-theme attribute to document', () => {
      if (typeof document === 'undefined') return
      
      const { result } = renderHook(() => useTheme())
      
      act(() => {
        result.current.setLight()
      })
      
      expect(document.documentElement.getAttribute('data-theme')).toBe('light')
      
      act(() => {
        result.current.setDark()
      })
      
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    })
  })

  describe('Error Handling', () => {
    test('should handle localStorage unavailable gracefully', () => {
      // Mock localStorage to throw errors
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: () => { throw new Error('localStorage unavailable') },
          setItem: () => { throw new Error('localStorage unavailable') }
        }
      })
      
      const { result } = renderHook(() => useTheme())
      
      // Should not throw error
      expect(() => {
        act(() => {
          result.current.setLight()
        })
      }).not.toThrow()
    })

    test('should handle invalid localStorage data gracefully', () => {
      localStorage.setItem('nality-theme-storage', 'invalid-json')
      
      const { result } = renderHook(() => useTheme())
      
      // Should fallback to defaults
      expect(result.current.mode).toBe('system')
    })
  })
})

export {}
