'use client'

interface ModuleLoadingStateProps {
  moduleName: string
  message?: string
  showProgress?: boolean
  progress?: number
}

/**
 * Module Loading State Component
 * Displays loading feedback for dashboard modules
 */
export function ModuleLoadingState({ 
  moduleName, 
  message,
  showProgress = false,
  progress = 0
}: ModuleLoadingStateProps) {
  const defaultMessage = `Loading ${moduleName.toLowerCase()} module...`
  
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-8"
      style={{ 
        backgroundColor: 'var(--c-primary-invert)',
        color: 'var(--c-primary-100)'
      }}
    >
      <div className="text-center space-y-6">
        {/* Loading Spinner */}
        <div className="relative">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"
            style={{ borderColor: 'var(--c-primary-100)' }}
          />
          {showProgress && (
            <div 
              className="absolute inset-0 flex items-center justify-center text-xs font-bold"
              style={{ color: 'var(--c-primary-100)' }}
            >
              {Math.round(progress)}%
            </div>
          )}
        </div>
        
        {/* Loading Message */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">
            {message || defaultMessage}
          </h3>
          
          {showProgress && (
            <div className="w-48 mx-auto">
              <div 
                className="w-full h-2 rounded-full"
                style={{ backgroundColor: 'var(--c-neutral-light)' }}
              >
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: 'var(--c-primary-100)',
                    width: `${progress}%`
                  }}
                />
              </div>
            </div>
          )}
          
          <p 
            className="text-sm"
            style={{ color: 'var(--c-neutral-dark)' }}
          >
            Setting up your {moduleName.toLowerCase()} experience...
          </p>
        </div>
        
        {/* Module Features Preview */}
        <div className="pt-4 max-w-sm">
          <p 
            className="text-xs"
            style={{ color: 'var(--c-neutral-dark)' }}
          >
            {getModuleDescription(moduleName)}
          </p>
        </div>
      </div>
    </div>
  )
}

function getModuleDescription(moduleName: string): string {
  const descriptions: Record<string, string> = {
    'Dashboard': 'Your life timeline overview with key metrics and insights',
    'Timeline': 'Chronological view of your life events and milestones',
    'Chat': 'AI-powered conversations about your life story',
    'Contact': 'Support and assistance for your timeline journey',
    'View': 'Customizable perspectives on your life narrative'
  }
  
  return descriptions[moduleName] || 'Personalized experience loading...'
}
