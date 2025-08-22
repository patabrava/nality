'use client'

import { Header } from '@/components/layout/Header'
import { ModuleErrorBoundary } from '@/components/errors/ModuleErrorBoundary'

export default function DashboardHeaderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log('🏗️ Dashboard header shell mounted')

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
      <main className="flex-1 overflow-hidden" style={{ paddingTop: '0' }}>
        <ModuleErrorBoundary moduleName="Dashboard">
          {children}
        </ModuleErrorBoundary>
      </main>
    </div>
  )
}
