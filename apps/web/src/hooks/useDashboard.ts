import { useDashboardStore } from '@/lib/dashboard-store'
import { useCallback, useEffect } from 'react'

/**
 * Comprehensive dashboard hook that provides all dashboard state and actions
 * with performance monitoring and logging capabilities
 */
export function useDashboard() {
  const store = useDashboardStore()
  
  // Initialize dashboard on mount
  useEffect(() => {
    const startTime = performance.now()
    console.log('🚀 Dashboard: Initializing dashboard hook')
    
    // Record initial route change
    store.recordRouteChange()
    
    // Log initialization time
    requestAnimationFrame(() => {
      const initTime = performance.now() - startTime
      console.log(`⚡ Dashboard hook initialized in ${initTime.toFixed(2)}ms`)
    })
  }, [])

  // Enhanced actions with performance monitoring
  const setActiveModuleWithMetrics = useCallback((moduleId: string | null) => {
    const startTime = performance.now()
    store.setActiveModule(moduleId)
    
    // Record module switch performance
    if (moduleId) {
      requestAnimationFrame(() => {
        const switchTime = performance.now() - startTime
        store.recordModuleLoadTime(moduleId, switchTime)
      })
    }
  }, [store])

  const refreshData = useCallback(() => {
    console.log('🔄 Dashboard: Refreshing data...')
    store.markDataRefresh()
    store.setDataStale(false)
  }, [store])

  const markDataAsStale = useCallback(() => {
    console.log('⚠️ Dashboard: Marking data as stale')
    store.setDataStale(true)
  }, [store])

  // Computed values
  const isDataStaleThreshold = 5 * 60 * 1000 // 5 minutes
  const isDataReallyStale = Date.now() - store.lastDataRefresh > isDataStaleThreshold

  const averageModuleLoadTime = Object.keys(store.moduleLoadTimes).length > 0
    ? Object.values(store.moduleLoadTimes).reduce((sum, time) => sum + time, 0) / Object.keys(store.moduleLoadTimes).length
    : 0

  return {
    // Core state
    activeModule: store.activeModule,
    isLayoutCollapsed: store.isLayoutCollapsed,
    isSidebarOpen: store.isSidebarOpen,
    theme: store.theme,
    compactMode: store.compactMode,
    
    // Data state
    lastDataRefresh: store.lastDataRefresh,
    isDataStale: store.isDataStale || isDataReallyStale,
    
    // Performance metrics
    moduleLoadTimes: store.moduleLoadTimes,
    lastRouteChange: store.lastRouteChange,
    averageModuleLoadTime,
    
    // Enhanced actions
    setActiveModule: setActiveModuleWithMetrics,
    toggleLayoutCollapse: store.toggleLayoutCollapse,
    toggleSidebar: store.toggleSidebar,
    setTheme: store.setTheme,
    toggleCompactMode: store.toggleCompactMode,
    refreshData,
    markDataAsStale,
    recordRouteChange: store.recordRouteChange,
    resetState: store.resetState,
    
    // Computed helpers
    isDataReallyStale,
    getModuleLoadTime: (moduleId: string) => store.moduleLoadTimes[moduleId] || null,
    getTimeSinceLastRefresh: () => Date.now() - store.lastDataRefresh,
    getFormattedLastRefresh: () => new Date(store.lastDataRefresh).toLocaleTimeString()
  }
}

/**
 * Lightweight hook for just the active module state
 */
export function useActiveModule() {
  return useDashboardStore((state) => state.activeModule)
}

/**
 * Hook for layout controls
 */
export function useLayoutControls() {
  return useDashboardStore((state) => ({
    isCollapsed: state.isLayoutCollapsed,
    isSidebarOpen: state.isSidebarOpen,
    toggleCollapse: state.toggleLayoutCollapse,
    toggleSidebar: state.toggleSidebar
  }))
}

/**
 * Hook for user preferences
 */
export function useUserPreferences() {
  return useDashboardStore((state) => ({
    theme: state.theme,
    compactMode: state.compactMode,
    setTheme: state.setTheme,
    toggleCompactMode: state.toggleCompactMode
  }))
}

/**
 * Hook for performance monitoring
 */
export function usePerformanceMonitor() {
  return useDashboardStore((state) => ({
    moduleLoadTimes: state.moduleLoadTimes,
    lastRouteChange: state.lastRouteChange,
    recordModuleLoadTime: state.recordModuleLoadTime,
    recordRouteChange: state.recordRouteChange
  }))
}
