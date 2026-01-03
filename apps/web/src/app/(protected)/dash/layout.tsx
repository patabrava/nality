'use client'

import { TabNavigation } from '@/components/navigation/TabNavigation'
import { Header } from '@/components/layout/Header'
import { ModuleErrorBoundary } from '@/components/errors/ModuleErrorBoundary'

// Feature flag to test header navigation while preserving working right-rail navigation
// Default to header navigation (true) unless explicitly disabled
const USE_HEADER_NAVIGATION = process.env.NEXT_PUBLIC_USE_HEADER_NAV !== 'false'

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
          backgroundColor: 'var(--theme-bg-primary, #050505)', 
          color: 'var(--theme-text-primary, #e0e0e0)',
          position: 'relative'
        }}
      >
        {/* Grain texture overlay */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
          opacity: 0.04,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")"
        }} />
        
        {/* Header navigation */}
        <Header />
        
        {/* Main content area with error boundary */}
        <main className="flex-1 overflow-hidden" style={{ position: 'relative', zIndex: 2 }}>
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
        backgroundColor: 'var(--theme-bg-primary, #050505)', 
        color: 'var(--theme-text-primary, #e0e0e0)',
        position: 'relative'
      }}
    >
      {/* Grain texture overlay */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        opacity: 0.04,
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")"
      }} />
      
      {/* Main content area with error boundary */}
      <main className="flex-1 overflow-hidden" style={{ position: 'relative', zIndex: 2 }}>
        <ModuleErrorBoundary moduleName="Dashboard">
          {children}
        </ModuleErrorBoundary>
      </main>
      
      {/* Right-side tab navigation */}
      <TabNavigation />
    </div>
  )
}
