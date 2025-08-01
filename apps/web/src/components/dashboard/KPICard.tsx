'use client'

interface KPICardProps {
  title: string
  value?: string | number | null | undefined
  subtitle?: string
  icon?: React.ReactNode
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
}

export function KPICard({ 
  title, 
  value, 
  subtitle, 
  icon,
  isLoading = false, 
  error = null,
  onRetry
}: KPICardProps) {
  if (error) {
    return (
      <div 
        className="p-4 rounded-xl border border-red-200 bg-red-50"
        style={{ minHeight: '120px' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span style={{ color: 'var(--c-accent-100)' }}>⚠</span>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--c-accent-100)' }}>
            {title}
          </h3>
        </div>
        <p className="text-sm mb-3" style={{ color: 'var(--c-neutral-dark)' }}>
          {error}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-3 py-1 text-xs rounded border transition-colors"
            style={{
              backgroundColor: 'var(--c-primary-invert)',
              borderColor: 'var(--c-primary-100)',
              color: 'var(--c-primary-100)'
            }}
          >
            Retry
          </button>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div 
        className="p-4 rounded-xl border animate-pulse"
        style={{ 
          backgroundColor: 'var(--c-neutral-light)',
          borderColor: 'var(--c-neutral-medium)',
          minHeight: '120px'
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-4 h-4 rounded bg-gray-300"></div>
          <div className="h-4 bg-gray-300 rounded w-20"></div>
        </div>
        <div className="h-8 bg-gray-300 rounded w-16 mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-24"></div>
      </div>
    )
  }

  return (
    <div 
      className="p-4 rounded-xl border transition-shadow hover:shadow-lg"
      style={{ 
        backgroundColor: 'var(--c-primary-invert)',
        borderColor: 'var(--c-neutral-medium)',
        minHeight: '120px'
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        {icon && (
          <div className="flex-shrink-0" style={{ color: 'var(--c-primary-100)' }}>
            {icon}
          </div>
        )}
        <h3 
          className="font-semibold text-sm uppercase tracking-wider"
          style={{ color: 'var(--c-neutral-dark)' }}
        >
          {title}
        </h3>
      </div>
      
      <div className="space-y-1">
        <div 
          className="text-3xl font-bold"
          style={{ 
            color: 'var(--c-primary-100)',
            fontFamily: 'var(--font-primary)'
          }}
        >
          {value ?? '—'}
        </div>
        
        {subtitle && (
          <p 
            className="text-sm"
            style={{ color: 'var(--c-neutral-dark)' }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
