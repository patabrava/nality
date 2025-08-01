'use client'

/**
 * View Module Placeholder
 * Preview interface for future timeline view configurator
 */
export function ViewPlaceholder() {
  console.log('[ViewPlaceholder] Component mounted')

  return (
    <section 
      className="grid place-items-center h-full text-center space-y-8 p-8"
      style={{ 
        backgroundColor: 'var(--c-primary-invert)',
        minHeight: '100vh'
      }}
    >
      <div className="max-w-lg space-y-6">
        <div className="text-6xl mb-4">⚙️</div>
        
        <h2 
          className="text-3xl font-semibold"
          style={{ color: 'var(--c-primary-100)' }}
        >
          Timeline View Configurator
        </h2>
        
        <p 
          className="text-lg leading-relaxed"
          style={{ color: 'var(--c-neutral-dark)' }}
        >
          Soon you'll be able to tailor how your entire life story is displayed—pick categories, 
          zoom levels, visual styles, and create custom views that highlight what matters most to you.
        </p>
        
        <div className="pt-4">
          <button 
            className="h-12 px-8 rounded-xl font-semibold text-lg transition-all duration-200 opacity-60 cursor-not-allowed"
            style={{
              backgroundColor: 'var(--c-neutral-medium)',
              color: 'var(--c-primary-invert)'
            }}
            disabled
          >
            Design My View (Coming Soon)
          </button>
        </div>
      </div>
      
      <div className="max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
        <div 
          className="p-6 rounded-xl border"
          style={{ 
            backgroundColor: 'var(--c-neutral-light)',
            borderColor: 'var(--c-neutral-medium)'
          }}
        >
          <h3 
            className="text-lg font-semibold mb-3"
            style={{ color: 'var(--c-primary-100)' }}
          >
            Category Filters
          </h3>
          <p 
            className="text-sm"
            style={{ color: 'var(--c-neutral-dark)' }}
          >
            Show only specific life areas: career, family, travel, achievements, and more.
          </p>
        </div>
        
        <div 
          className="p-6 rounded-xl border"
          style={{ 
            backgroundColor: 'var(--c-neutral-light)',
            borderColor: 'var(--c-neutral-medium)'
          }}
        >
          <h3 
            className="text-lg font-semibold mb-3"
            style={{ color: 'var(--c-primary-100)' }}
          >
            Time Zoom Levels
          </h3>
          <p 
            className="text-sm"
            style={{ color: 'var(--c-neutral-dark)' }}
          >
            Focus on decades, years, or drill down to individual months and days.
          </p>
        </div>
        
        <div 
          className="p-6 rounded-xl border"
          style={{ 
            backgroundColor: 'var(--c-neutral-light)',
            borderColor: 'var(--c-neutral-medium)'
          }}
        >
          <h3 
            className="text-lg font-semibold mb-3"
            style={{ color: 'var(--c-primary-100)' }}
          >
            Visual Themes
          </h3>
          <p 
            className="text-sm"
            style={{ color: 'var(--c-neutral-dark)' }}
          >
            Choose layouts: detailed cards, compact lists, or photo-focused galleries.
          </p>
        </div>
        
        <div 
          className="p-6 rounded-xl border"
          style={{ 
            backgroundColor: 'var(--c-neutral-light)',
            borderColor: 'var(--c-neutral-medium)'
          }}
        >
          <h3 
            className="text-lg font-semibold mb-3"
            style={{ color: 'var(--c-primary-100)' }}
          >
            Story Flows
          </h3>
          <p 
            className="text-sm"
            style={{ color: 'var(--c-neutral-dark)' }}
          >
            Create narrative sequences that connect related events across time.
          </p>
        </div>
      </div>
    </section>
  )
}
