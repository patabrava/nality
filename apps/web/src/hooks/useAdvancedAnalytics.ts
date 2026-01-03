'use client'

import { useCallback, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useLocale } from '@/components/i18n/useLocale'

interface AnalyticsEvent {
  action: string
  category?: string
  label?: string
  value?: number
  custom_parameters?: Record<string, any>
}

interface ConversionFunnelStep {
  step: string
  timestamp: number
  source?: string
  additional_data?: Record<string, any>
}

interface UseAnalyticsReturn {
  trackEvent: (event: AnalyticsEvent) => void
  trackPageView: (page?: string) => void
  trackConversion: (type: string, value?: number, metadata?: Record<string, any>) => void
  trackUserJourney: (step: string, source?: string, data?: Record<string, any>) => void
  trackError: (error: Error, context?: string) => void
  trackPerformance: (metric: string, value: number, context?: string) => void
  setUserProperty: (property: string, value: any) => void
}

export function useAdvancedAnalytics(): UseAnalyticsReturn {
  const pathname = usePathname()
  const { locale } = useLocale()

  // Initialize analytics on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      // Set initial user properties
      (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
        custom_map: {
          locale: locale,
          user_type: 'visitor', // Will be updated based on auth state
          page_language: locale,
          session_start: Date.now()
        }
      })
    }
  }, [locale])

  // Track page views automatically
  useEffect(() => {
    trackPageView()
  }, [pathname])

  const trackEvent = useCallback((event: AnalyticsEvent) => {
    if (typeof window === 'undefined' || !(window as any).gtag) return

    // Extract event properties with proper types
    const {
      action: eventAction,
      category: eventCategory = 'general',
      label: eventLabel,
      value: eventValue,
      custom_parameters: eventCustomParams = {}
    } = event

    // Enhanced event tracking with context
    const gtag = (window as any).gtag
    gtag('event', eventAction, {
      event_category: eventCategory,
      event_label: eventLabel,
      value: eventValue,
      locale: locale,
      page_path: pathname,
      timestamp: Date.now(),
      ...eventCustomParams
    })

    // Also send to custom analytics if available
    const customAnalytics = (window as any).customAnalytics
    if (customAnalytics) {
      customAnalytics.track(eventAction, {
        category: eventCategory,
        label: eventLabel,
        value: eventValue,
        locale,
        pathname,
        ...eventCustomParams
      })
    }
  }, [locale, pathname])

  const trackPageView = useCallback((page?: string) => {
    if (typeof window === 'undefined' || !(window as any).gtag) return

    const pagePath = page ?? pathname
    const gtag = (window as any).gtag

    gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: pagePath,
      page_title: document.title,
      page_location: window.location.href,
      custom_map: {
        locale: locale,
        page_type: getPageType(pagePath),
        session_timestamp: Date.now()
      }
    })
  }, [pathname, locale])

  const trackConversion = useCallback((type: string, value?: number, metadata?: Record<string, any>) => {
    trackEvent({
      action: 'conversion',
      category: 'conversions',
      label: type,
      ...(value !== undefined && { value }),
      custom_parameters: {
        conversion_type: type,
        ...(value !== undefined && { conversion_value: value }),
        locale: locale,
        page_path: pathname,
        ...metadata
      }
    })

    // Enhanced conversion tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'purchase', {
        transaction_id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        value: value || 0,
        currency: 'EUR',
        items: [{
          item_id: type,
          item_name: `Conversion: ${type}`,
          category: 'conversion',
          quantity: 1,
          price: value || 0
        }]
      })
    }
  }, [trackEvent, locale, pathname])

  const trackUserJourney = useCallback((step: string, source?: string, data?: Record<string, any>) => {
    // Store journey step in localStorage for session tracking
    const journeyKey = 'user_journey_steps'
    const existingJourney = localStorage.getItem(journeyKey)
    let journeySteps: ConversionFunnelStep[] = []

    if (existingJourney) {
      try {
        journeySteps = JSON.parse(existingJourney)
      } catch {
        journeySteps = []
      }
    }

    const newStep: ConversionFunnelStep = {
      step,
      timestamp: Date.now(),
      ...(source && { source }),
      ...(data && { additional_data: data })
    }

    journeySteps.push(newStep)

    // Keep only last 20 steps to prevent storage bloat
    if (journeySteps.length > 20) {
      journeySteps = journeySteps.slice(-20)
    }

    localStorage.setItem(journeyKey, JSON.stringify(journeySteps))

    // Track the journey step
    trackEvent({
      action: 'user_journey_step',
      category: 'user_journey',
      label: step,
      custom_parameters: {
        step: step,
        source: source,
        step_number: journeySteps.length,
        total_time_on_site: calculateTimeOnSite(),
        locale: locale,
        ...data
      }
    })
  }, [trackEvent, locale])

  const trackError = useCallback((error: Error, context?: string) => {
    trackEvent({
      action: 'error',
      category: 'errors',
      label: error.name,
      custom_parameters: {
        error_message: error.message,
        error_stack: error.stack?.substring(0, 500), // Limit stack trace length
        error_context: context,
        page_path: pathname,
        locale: locale,
        user_agent: navigator.userAgent.substring(0, 200)
      }
    })

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Analytics Error Tracking:', {
        error,
        context,
        pathname,
        locale
      })
    }
  }, [trackEvent, pathname, locale])

  const trackPerformance = useCallback((metric: string, value: number, context?: string) => {
    trackEvent({
      action: 'performance_metric',
      category: 'performance',
      label: metric,
      value: Math.round(value),
      custom_parameters: {
        metric_name: metric,
        metric_value: value,
        context: context,
        page_path: pathname,
        locale: locale,
        connection_type: getConnectionType(),
        device_memory: getDeviceMemory()
      }
    })
  }, [trackEvent, pathname, locale])

  const setUserProperty = useCallback((property: string, value: any) => {
    if (typeof window === 'undefined' || !(window as any).gtag) return

    (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
      custom_map: {
        [property]: value
      }
    })

    // Store in localStorage for session persistence
    const userPropsKey = 'analytics_user_properties'
    const existingProps = localStorage.getItem(userPropsKey)
    let props = {}

    if (existingProps) {
      try {
        props = JSON.parse(existingProps)
      } catch {
        props = {}
      }
    }

    const updatedProps = { ...props, [property]: value }
    localStorage.setItem(userPropsKey, JSON.stringify(updatedProps))
  }, [])

  return {
    trackEvent,
    trackPageView,
    trackConversion,
    trackUserJourney,
    trackError,
    trackPerformance,
    setUserProperty
  }
}

// Helper functions
function getPageType(path: string): string {
  if (path === '/' || path === '/en') return 'landing'
  if (path.includes('/dash')) return 'dashboard'
  if (path.includes('/onboarding')) return 'onboarding'
  if (path.includes('/login') || path.includes('/auth')) return 'auth'
  if (path.includes('/setup')) return 'setup'
  return 'other'
}

function calculateTimeOnSite(): number {
  const sessionStart = localStorage.getItem('session_start_time')
  if (sessionStart) {
    return Date.now() - parseInt(sessionStart)
  }
  return 0
}

function getConnectionType(): string {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection
    return connection.effectiveType || 'unknown'
  }
  return 'unknown'
}

function getDeviceMemory(): number {
  if ('deviceMemory' in navigator) {
    return (navigator as any).deviceMemory || 0
  }
  return 0
}

// Initialize session tracking
if (typeof window !== 'undefined' && !localStorage.getItem('session_start_time')) {
  localStorage.setItem('session_start_time', Date.now().toString())
}

export default useAdvancedAnalytics