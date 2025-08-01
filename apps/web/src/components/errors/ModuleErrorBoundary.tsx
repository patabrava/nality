'use client'

import { Component, ReactNode } from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error | undefined
  errorInfo?: any
}

interface ErrorBoundaryProps {
  children: ReactNode
  moduleName: string
  fallback?: ReactNode
}

/**
 * Module Error Boundary
 * Catches and handles errors within dashboard modules
 * Provides recovery mechanisms and error reporting
 */
export class ModuleErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error(`[ModuleErrorBoundary] Error caught:`, error)
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error(`[ModuleErrorBoundary] ${this.props.moduleName} module error:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    })

    // Log error for monitoring
    this.setState({
      error,
      errorInfo
    })
  }

  handleReset = () => {
    console.log(`[ModuleErrorBoundary] Resetting ${this.props.moduleName} module`)
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined 
    })
    
    // Force page reload as last resort
    setTimeout(() => {
      if (this.state.hasError) {
        window.location.reload()
      }
    }, 100)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div 
          className="min-h-screen flex items-center justify-center p-8"
          style={{ 
            backgroundColor: 'var(--c-primary-invert)',
            color: 'var(--c-primary-100)'
          }}
        >
          <div className="text-center max-w-md space-y-6">
            <div className="text-4xl mb-4">⚠️</div>
            
            <h2 className="text-2xl font-semibold">
              {this.props.moduleName} Module Error
            </h2>
            
            <p 
              className="text-base leading-relaxed"
              style={{ color: 'var(--c-neutral-dark)' }}
            >
              Something went wrong loading the {this.props.moduleName.toLowerCase()} module. 
              This error has been logged for investigation.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details 
                className="text-left text-sm p-4 rounded border"
                style={{ 
                  backgroundColor: 'var(--c-neutral-light)',
                  borderColor: 'var(--c-neutral-medium)' 
                }}
              >
                <summary className="cursor-pointer font-medium mb-2">
                  Error Details (Development)
                </summary>
                <pre 
                  className="whitespace-pre-wrap text-xs"
                  style={{ color: 'var(--c-accent-100)' }}
                >
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="h-12 px-6 rounded-xl font-semibold transition-all duration-200"
                style={{
                  backgroundColor: 'var(--c-primary-100)',
                  color: 'var(--c-primary-invert)'
                }}
              >
                Try Again
              </button>
              
              <div className="space-x-3">
                <button
                  onClick={() => window.location.href = '/dash'}
                  className="px-4 py-2 rounded border font-medium transition-all duration-200"
                  style={{
                    borderColor: 'var(--c-neutral-medium)',
                    color: 'var(--c-neutral-dark)'
                  }}
                >
                  Back to Dashboard
                </button>
                
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 rounded border font-medium transition-all duration-200"
                  style={{
                    borderColor: 'var(--c-neutral-medium)',
                    color: 'var(--c-neutral-dark)'
                  }}
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
