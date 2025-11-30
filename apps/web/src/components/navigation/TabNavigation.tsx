'use client'

import { useRouter } from 'next/navigation'
import { TabButton } from './TabButton'
import { useDashboard } from '@/hooks/useDashboard'

// Navigation contract from new_component.md  
const tabs = [
  { id: 'dashboard', label: 'Dashboard', route: '/dash', icon: 'house' },
  { id: 'timeline', label: 'Timeline', route: '/dash/timeline', icon: 'timeline' },
  { id: 'chat', label: 'Chat', route: '/dash/chat', icon: 'chat' },
  { id: 'contact', label: 'Contact', route: '/dash/contact', icon: 'user' }
] as const

export function TabNavigation() {
  const router = useRouter()
  const { 
    activeModule, 
    setActiveModule, 
    averageModuleLoadTime,
    compactMode 
  } = useDashboard()

  const handleTabSwitch = (tabId: string) => {
    const startTime = performance.now()
    console.log(`📍 Tab switch: ${activeModule} → ${tabId}`)
    
    // Find the route for this tab
    const tab = tabs.find(t => t.id === tabId)
    if (tab) {
      console.log(`🛣️ Navigating to: ${tab.route}`)
      router.push(tab.route)
    }
    
    setActiveModule(tabId)
    
    // Log tab switch performance
    requestAnimationFrame(() => {
      const switchTime = performance.now() - startTime
      console.log(`⚡ Tab switch completed in ${switchTime.toFixed(2)}ms`)
    })
  }

  return (
    <nav 
      className={`flex flex-col py-4 transition-all duration-200 ${compactMode ? 'w-16' : 'w-20'}`}
      style={{
        backgroundColor: 'var(--c-primary-100)',
        borderLeft: '1px solid var(--c-neutral-dark)'
      }}
      aria-label="Dashboard Navigation"
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeModule === tab.id
        
        return (
          <TabButton
            key={tab.id}
            tab={tab}
            isActive={isActive}
            isLoading={false} // Will be enhanced with real loading states later
            hasError={false} // Will be enhanced with real error states later
            onClick={() => handleTabSwitch(tab.id)}
          />
        )
      })}
      
      {/* Debug info */}
      {!compactMode && (
        <div className="mt-auto p-2 text-xs space-y-1" style={{ color: 'var(--c-neutral-dark)' }}>
          <div>Avg: {averageModuleLoadTime.toFixed(1)}ms</div>
          <div>Active: {activeModule || 'none'}</div>
        </div>
      )}
    </nav>
  )
}
