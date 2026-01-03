'use client'

import { useEffect, useCallback, useState } from 'react'

interface PerformanceMetrics {
  lcp: number | null // Largest Contentful Paint
  fid: number | null // First Input Delay
  cls: number | null // Cumulative Layout Shift
  fcp: number | null // First Contentful Paint
  ttfb: number | null // Time to First Byte
}

interface UsePerformanceReturn {
  metrics: PerformanceMetrics
  trackInteraction: (name: string, startTime?: number) => void
  trackCustomMetric: (name: string, value: number, unit?: string) => void
}

export function usePerformanceMonitoring(): UsePerformanceReturn {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null
  })

  // Track Core Web Vitals
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Function to send metrics to analytics
    const sendToAnalytics = (metricName: string, value: number, unit = 'ms') => {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'performance_metric', {
          metric_name: metricName,
          metric_value: Math.round(value),
          metric_unit: unit,
          page_path: window.location.pathname
        })
      }
    }

    // LCP - Largest Contentful Paint
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      const lcpValue = lastEntry?.startTime || 0
      
      setMetrics(prev => ({ ...prev, lcp: lcpValue }))
      sendToAnalytics('lcp', lcpValue)
    })

    observer.observe({ entryTypes: ['largest-contentful-paint'] })

    // FCP - First Contentful Paint
    const paintObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          const fcpValue = entry.startTime
          setMetrics(prev => ({ ...prev, fcp: fcpValue }))
          sendToAnalytics('fcp', fcpValue)
        }
      }
    })

    paintObserver.observe({ entryTypes: ['paint'] })

    // FID - First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fidEntry = entry as PerformanceEventTiming
        const fidValue = fidEntry.processingStart - fidEntry.startTime
        setMetrics(prev => ({ ...prev, fid: fidValue }))
        sendToAnalytics('fid', fidValue)
      }
    })

    fidObserver.observe({ entryTypes: ['first-input'] })

    // CLS - Cumulative Layout Shift
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as any[]) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      }
      
      setMetrics(prev => ({ ...prev, cls: clsValue }))
      sendToAnalytics('cls', clsValue * 1000, 'score') // Convert to more readable number
    })

    clsObserver.observe({ entryTypes: ['layout-shift'] })

    // TTFB - Time to First Byte
    if ('navigation' in performance) {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigationEntry) {
        const ttfbValue = navigationEntry.responseStart - navigationEntry.requestStart
        setMetrics(prev => ({ ...prev, ttfb: ttfbValue }))
        sendToAnalytics('ttfb', ttfbValue)
      }
    }

    // Cleanup function
    return () => {
      observer.disconnect()
      paintObserver.disconnect()
      fidObserver.disconnect()
      clsObserver.disconnect()
    }
  }, [])

  // Track custom interactions
  const trackInteraction = useCallback((name: string, startTime?: number) => {
    const endTime = performance.now()
    const duration = startTime ? endTime - startTime : 0

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'user_interaction', {
        interaction_name: name,
        duration: Math.round(duration),
        timestamp: Date.now()
      })
    }
  }, [])

  // Track custom metrics
  const trackCustomMetric = useCallback((name: string, value: number, unit = 'ms') => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'custom_metric', {
        metric_name: name,
        metric_value: Math.round(value),
        metric_unit: unit
      })
    }
  }, [])

  return {
    metrics,
    trackInteraction,
    trackCustomMetric
  }
}

// Hook for monitoring component render performance
export function useRenderPerformance(componentName: string) {
  const [renderCount, setRenderCount] = useState(0)
  const { trackCustomMetric } = usePerformanceMonitoring()

  useEffect(() => {
    const startTime = performance.now()
    setRenderCount(prev => prev + 1)

    return () => {
      const endTime = performance.now()
      const renderDuration = endTime - startTime
      trackCustomMetric(`${componentName}_render_time`, renderDuration)
    }
  })

  useEffect(() => {
    if (renderCount > 1) {
      trackCustomMetric(`${componentName}_rerender_count`, renderCount, 'count')
    }
  }, [renderCount, componentName, trackCustomMetric])

  return { renderCount }
}

// Hook for intersection observer performance
export function useIntersectionPerformance(ref: React.RefObject<Element>, componentName: string) {
  const { trackInteraction } = usePerformanceMonitoring()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry && entry.isIntersecting && !isVisible) {
          setIsVisible(true)
          trackInteraction(`${componentName}_first_view`)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [ref, componentName, trackInteraction, isVisible])

  return { isVisible }
}

export default usePerformanceMonitoring