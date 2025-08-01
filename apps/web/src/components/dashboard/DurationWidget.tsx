'use client'

interface DurationWidgetProps {
  startDate?: string | null | undefined
  endDate?: string | null | undefined
  totalYears?: number | null | undefined
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
}

export function DurationWidget({ 
  startDate, 
  endDate, 
  totalYears,
  isLoading = false, 
  error = null,
  onRetry
}: DurationWidgetProps) {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Unknown'
    try {
      return new Date(dateString).getFullYear().toString()
    } catch {
      return 'Invalid'
    }
  }

  const formatDuration = (years: number) => {
    if (years === 0) return 'No timeline data'
    if (years === 1) return '1 year'
    return `${years} years`
  }

  if (error) {
    return (
      <div 
        className="p-4 rounded-xl border border-red-200 bg-red-50"
        style={{ minHeight: '120px' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span style={{ color: 'var(--c-accent-100)' }}>⚠</span>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--c-accent-100)' }}>
            Timeline Duration
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
          <div className="h-4 bg-gray-300 rounded w-28"></div>
        </div>
        <div className="h-6 bg-gray-300 rounded w-32 mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-20"></div>
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
        <div className="flex-shrink-0" style={{ color: 'var(--c-primary-100)' }}>
          📅
        </div>
        <h3 
          className="font-semibold text-sm uppercase tracking-wider"
          style={{ color: 'var(--c-neutral-dark)' }}
        >
          Timeline Duration
        </h3>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span 
            className="text-lg font-medium"
            style={{ 
              color: 'var(--c-primary-100)',
              fontFamily: 'var(--font-primary)'
            }}
          >
            {formatDate(startDate)}
          </span>
          <span style={{ color: 'var(--c-neutral-dark)' }}>→</span>
          <span 
            className="text-lg font-medium"
            style={{ 
              color: 'var(--c-primary-100)',
              fontFamily: 'var(--font-primary)'
            }}
          >
            {formatDate(endDate)}
          </span>
        </div>
        
        <p 
          className="text-sm font-medium"
          style={{ color: 'var(--c-neutral-dark)' }}
        >
          {formatDuration(totalYears ?? 0)}
        </p>
      </div>
    </div>
  )
}
