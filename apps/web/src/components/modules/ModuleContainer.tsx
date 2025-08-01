'use client'

import { Suspense, Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'

interface ModuleContainerProps {
  children: ReactNode
  moduleId: string
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ModuleErrorBoundary extends Component<
  { children: ReactNode; moduleId: string },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; moduleId: string }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`💥 Module error boundary triggered: ${this.props.moduleId}`, {
      error: error.message,
      componentStack: errorInfo.componentStack
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <ModuleErrorFallback 
          error={this.state.error!} 
          moduleId={this.props.moduleId} 
          resetError={() => this.setState({ hasError: false, error: null })} 
        />
      )
    }

    return this.props.children
  }
}

function ModuleLoadingFallback({ moduleId }: { moduleId: string }) {
  console.log(`⏳ Module loading: ${moduleId}`)
  
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center space-y-4">
        <div 
          className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent mx-auto"
          style={{ borderColor: 'var(--c-primary-invert)', borderTopColor: 'transparent' }}
        />
        <p style={{ color: 'var(--c-neutral-dark)' }}>
          Loading {moduleId}...
        </p>
      </div>
    </div>
  )
}

function ModuleErrorFallback({ 
  error, 
  moduleId, 
  resetError 
}: { 
  error: Error
  moduleId: string
  resetError: () => void 
}) {
  console.error(`💥 Module error boundary triggered: ${moduleId}`, error)
  
  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="text-center space-y-4 max-w-md">
        <div className="text-4xl">⚠️</div>
        <h3 className="text-lg font-semibold">Module Failed to Load</h3>
        <p style={{ color: 'var(--c-neutral-dark)' }} className="text-sm">
          {moduleId} encountered an error: {error.message}
        </p>
        <button
          onClick={resetError}
          className="px-4 py-2 rounded-lg transition-colors"
          style={{ 
            backgroundColor: 'var(--c-accent-100)', 
            color: 'var(--c-primary-invert)' 
          }}
        >
          Retry Loading
        </button>
      </div>
    </div>
  )
}

/**
 * Module container with suspense boundary and error handling
 * Implements Explicit Error Handling and Observable Implementation principles
 */
export function ModuleContainer({ 
  children, 
  moduleId, 
  fallback 
}: ModuleContainerProps) {
  return (
    <ModuleErrorBoundary moduleId={moduleId}>
      <Suspense fallback={fallback || <ModuleLoadingFallback moduleId={moduleId} />}>
        {children}
      </Suspense>
    </ModuleErrorBoundary>
  )
}
