// Global Dashboard State Types
export interface DashboardState {
  // Active module and layout state
  activeModule: string | null
  isLayoutCollapsed: boolean
  isSidebarOpen: boolean
  
  // Performance metrics
  moduleLoadTimes: Record<string, number>
  lastRouteChange: number
  
  // User preferences
  theme: 'light' | 'dark' | 'system'
  compactMode: boolean
  
  // Data state
  lastDataRefresh: number
  isDataStale: boolean
}

export interface DashboardActions {
  // Module management
  setActiveModule: (moduleId: string | null) => void
  toggleLayoutCollapse: () => void
  toggleSidebar: () => void
  
  // Performance tracking
  recordModuleLoadTime: (moduleId: string, loadTime: number) => void
  recordRouteChange: () => void
  
  // User preferences
  setTheme: (theme: DashboardState['theme']) => void
  toggleCompactMode: () => void
  
  // Data management
  markDataRefresh: () => void
  setDataStale: (isStale: boolean) => void
  
  // Reset functionality
  resetState: () => void
}

export type DashboardStore = DashboardState & DashboardActions

// Initial state
export const initialDashboardState: DashboardState = {
  activeModule: null,
  isLayoutCollapsed: false,
  isSidebarOpen: true,
  moduleLoadTimes: {},
  lastRouteChange: Date.now(),
  theme: 'system',
  compactMode: false,
  lastDataRefresh: Date.now(),
  isDataStale: false
}
