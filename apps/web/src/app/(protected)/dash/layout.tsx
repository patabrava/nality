'use client'

import { TabNavigation } from '@/components/navigation/TabNavigation'
import { ModuleErrorBoundary } from '@/components/errors/ModuleErrorBoundary'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log('🏗️ Dashboard shell mounted')

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
