'use client'

import { TabNavigation } from '@/components/navigation/TabNavigation'
import { Header } from '@/components/layout/Header'
import { ModuleErrorBoundary } from '@/components/errors/ModuleErrorBoundary'

// Feature flag to test header navigation while preserving working right-rail navigation
const USE_HEADER_NAVIGATION = process.env.NEXT_PUBLIC_USE_HEADER_NAV === 'true'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log(`🏗️ Dashboard shell mounted (header nav: ${USE_HEADER_NAVIGATION})`)
  console.log('🔍 Environment variable NEXT_PUBLIC_USE_HEADER_NAV:', process.env.NEXT_PUBLIC_USE_HEADER_NAV)
  console.log('🔍 USE_HEADER_NAVIGATION constant:', USE_HEADER_NAVIGATION)

  if (USE_HEADER_NAVIGATION) {
    console.log('✅ Rendering HEADER navigation layout')
    // New header navigation layout (Phase 2)
    return (
      <div 
        className="min-h-screen flex flex-col"
        style={{ 
          backgroundColor: 'var(--c-primary-100)', 
          color: 'var(--c-primary-invert)' 
        }}
      >
        {/* Header navigation */}
        <Header />
        
        {/* Main content area with error boundary */}
        <main className="flex-1 overflow-hidden">
          <ModuleErrorBoundary moduleName="Dashboard">
            {children}
          </ModuleErrorBoundary>
        </main>
      </div>
    )
  }

  console.log('⚠️  Rendering RIGHT-RAIL navigation layout (fallback)')
  // Original working right-rail navigation layout (preserved)
  return (
    <div 
      className="min-h-screen flex"
      style={{ 
        backgroundColor: 'var(--c-primary-100)', 
        color: 'var(--c-primary-invert)' 
      }}
    >
      {/* Main content area with error boundary */}
      <main className="flex-1 overflow-hidden">
        <ModuleErrorBoundary moduleName="Dashboard">
          {children}
        </ModuleErrorBoundary>
      </main>
      
      {/* Right-side tab navigation */}
      <TabNavigation />
    </div>
  )
}
