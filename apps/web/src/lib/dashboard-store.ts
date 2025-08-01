import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { 
  DashboardStore, 
  initialDashboardState
} from './dashboard-store.types'

export const useDashboardStore = create<DashboardStore>()(
  devtools(
    persist(
      (set): DashboardStore => ({
        ...initialDashboardState,
        
        // Module management
        setActiveModule: (moduleId: string | null) => {
          const startTime = performance.now()
          console.log(`🎯 Dashboard: Setting active module to ${moduleId}`)
          
          set((state) => ({ 
            ...state, 
            activeModule: moduleId,
            lastRouteChange: Date.now()
          }))
          
          // Log performance
          requestAnimationFrame(() => {
            const updateTime = performance.now() - startTime
            console.log(`⚡ Dashboard state update: ${updateTime.toFixed(2)}ms`)
          })
        },

        toggleLayoutCollapse: () => {
          console.log('📐 Dashboard: Toggling layout collapse')
          set((state) => ({ 
            ...state, 
            isLayoutCollapsed: !state.isLayoutCollapsed 
          }))
        },

        toggleSidebar: () => {
          console.log('📋 Dashboard: Toggling sidebar')
          set((state) => ({ 
            ...state, 
            isSidebarOpen: !state.isSidebarOpen 
          }))
        },

        // Performance tracking
        recordModuleLoadTime: (moduleId: string, loadTime: number) => {
          console.log(`📊 Dashboard: Module ${moduleId} loaded in ${loadTime.toFixed(2)}ms`)
          set((state) => ({
            ...state,
            moduleLoadTimes: {
              ...state.moduleLoadTimes,
              [moduleId]: loadTime
            }
          }))
        },

        recordRouteChange: () => {
          const timestamp = Date.now()
          console.log(`🛣️ Dashboard: Route change recorded at ${timestamp}`)
          set((state) => ({ 
            ...state, 
            lastRouteChange: timestamp 
          }))
        },

        // User preferences
        setTheme: (theme: DashboardStore['theme']) => {
          console.log(`🎨 Dashboard: Setting theme to ${theme}`)
          set((state) => ({ 
            ...state, 
            theme 
          }))
        },

        toggleCompactMode: () => {
          console.log('📦 Dashboard: Toggling compact mode')
          set((state) => ({ 
            ...state, 
            compactMode: !state.compactMode 
          }))
        },

        // Data management
        markDataRefresh: () => {
          const timestamp = Date.now()
          console.log(`🔄 Dashboard: Data refreshed at ${timestamp}`)
          set((state) => ({ 
            ...state, 
            lastDataRefresh: timestamp,
            isDataStale: false
          }))
        },

        setDataStale: (isStale: boolean) => {
          console.log(`⚠️ Dashboard: Data staleness set to ${isStale}`)
          set((state) => ({ 
            ...state, 
            isDataStale: isStale 
          }))
        },

        // Reset functionality
        resetState: () => {
          console.log('🔄 Dashboard: Resetting state to initial values')
          set(initialDashboardState)
        }
      }),
      {
        name: 'nality-dashboard-store',
        // Only persist user preferences and non-volatile data
        partialize: (state) => ({
          theme: state.theme,
          compactMode: state.compactMode,
          isLayoutCollapsed: state.isLayoutCollapsed,
          isSidebarOpen: state.isSidebarOpen
        })
      }
    ),
    {
      name: 'dashboard-store'
    }
  )
)

// Selector hooks for specific state slices
export const useActiveModule = () => useDashboardStore((state) => state.activeModule)
export const useLayoutState = () => useDashboardStore((state) => ({
  isCollapsed: state.isLayoutCollapsed,
  isSidebarOpen: state.isSidebarOpen
}))
export const usePerformanceMetrics = () => useDashboardStore((state) => ({
  moduleLoadTimes: state.moduleLoadTimes,
  lastRouteChange: state.lastRouteChange
}))
export const useUserPreferences = () => useDashboardStore((state) => ({
  theme: state.theme,
  compactMode: state.compactMode
}))
export const useDataState = () => useDashboardStore((state) => ({
  lastRefresh: state.lastDataRefresh,
  isStale: state.isDataStale
}))
