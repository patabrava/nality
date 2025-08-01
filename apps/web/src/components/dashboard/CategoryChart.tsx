'use client'

interface CategoryChartProps {
  categories?: Record<string, number> | undefined
  total?: number | undefined
  isLoading?: boolean
  error?: string | null
}

export function CategoryChart({ 
  categories = {}, 
  total = 0,
  isLoading = false, 
  error = null
}: CategoryChartProps) {
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'personal': 'Personal',
      'education': 'Education',
      'career': 'Career',
      'family': 'Family',
      'travel': 'Travel',
      'achievement': 'Achievement',
      'health': 'Health',
      'relationship': 'Relationship',
      'other': 'Other'
    }
    return labels[category] || category
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'personal': '👤',
      'education': '🎓',
      'career': '💼',
      'family': '👨‍👩‍👧‍👦',
      'travel': '✈️',
      'achievement': '🏆',
      'health': '🏥',
      'relationship': '💕',
      'other': '📋'
    }
    return icons[category] || '📋'
  }

  const getPercentage = (count: number) => {
    if (total === 0) return 0
    return Math.round((count / total) * 100)
  }

  if (error) {
    return (
      <div 
        className="p-4 rounded-xl border border-red-200 bg-red-50"
        style={{ minHeight: '200px' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span style={{ color: 'var(--c-accent-100)' }}>⚠</span>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--c-accent-100)' }}>
            Category Breakdown
          </h3>
        </div>
        <p className="text-sm" style={{ color: 'var(--c-neutral-dark)' }}>
          {error}
        </p>
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
          minHeight: '200px'
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-4 h-4 rounded bg-gray-300"></div>
          <div className="h-4 bg-gray-300 rounded w-32"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-gray-300"></div>
              <div className="h-3 bg-gray-300 rounded flex-1"></div>
              <div className="h-3 bg-gray-300 rounded w-8"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const sortedCategories = Object.entries(categories)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5) // Show top 5 categories

  if (total === 0) {
    return (
      <div 
        className="p-4 rounded-xl border"
        style={{ 
          backgroundColor: 'var(--c-primary-invert)',
          borderColor: 'var(--c-neutral-medium)',
          minHeight: '200px'
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-shrink-0" style={{ color: 'var(--c-primary-100)' }}>
            📊
          </div>
          <h3 
            className="font-semibold text-sm uppercase tracking-wider"
            style={{ color: 'var(--c-neutral-dark)' }}
          >
            Category Breakdown
          </h3>
        </div>
        <div className="flex items-center justify-center h-24">
          <p 
            className="text-sm text-center"
            style={{ color: 'var(--c-neutral-dark)' }}
          >
            No events to categorize yet
          </p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="p-4 rounded-xl border transition-shadow hover:shadow-lg"
      style={{ 
        backgroundColor: 'var(--c-primary-invert)',
        borderColor: 'var(--c-neutral-medium)',
        minHeight: '200px'
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-shrink-0" style={{ color: 'var(--c-primary-100)' }}>
          📊
        </div>
        <h3 
          className="font-semibold text-sm uppercase tracking-wider"
          style={{ color: 'var(--c-neutral-dark)' }}
        >
          Category Breakdown
        </h3>
      </div>
      
      <div className="space-y-3">
        {sortedCategories.map(([category, count]) => {
          const percentage = getPercentage(count)
          return (
            <div key={category} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{getCategoryIcon(category)}</span>
                  <span 
                    className="text-sm font-medium"
                    style={{ color: 'var(--c-primary-100)' }}
                  >
                    {getCategoryLabel(category)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span 
                    className="text-sm font-medium"
                    style={{ color: 'var(--c-primary-100)' }}
                  >
                    {count}
                  </span>
                  <span 
                    className="text-xs"
                    style={{ color: 'var(--c-neutral-dark)' }}
                  >
                    ({percentage}%)
                  </span>
                </div>
              </div>
              <div 
                className="w-full h-2 rounded-full"
                style={{ backgroundColor: 'var(--c-neutral-light)' }}
              >
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: 'var(--c-primary-100)',
                    width: `${percentage}%`
                  }}
                />
              </div>
            </div>
          )
        })}
        
        {sortedCategories.length > 5 && (
          <p 
            className="text-xs text-center pt-2"
            style={{ color: 'var(--c-neutral-dark)' }}
          >
            Showing top 5 categories
          </p>
        )}
      </div>
    </div>
  )
}
