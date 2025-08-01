'use client'

/**
 * Chat Module Placeholder
 * Preview interface for future chat functionality
 */
export function ChatPlaceholder() {
  console.log('[ChatPlaceholder] Component mounted')

  return (
    <section 
      className="flex h-full items-center justify-center p-8"
      style={{ 
        backgroundColor: 'var(--c-primary-invert)',
        minHeight: '100vh'
      }}
    >
      <div className="text-center space-y-6 max-w-md">
        <div className="text-6xl mb-4">🤖</div>
        
        <h2 
          className="text-3xl font-semibold"
          style={{ color: 'var(--c-primary-100)' }}
        >
          Chat coming soon
        </h2>
        
        <p 
          className="text-lg leading-relaxed"
          style={{ color: 'var(--c-neutral-dark)' }}
        >
          You'll be able to discuss life events in real‑time with our AI assistant. 
          Get help organizing memories, filling gaps in your timeline, and discovering new perspectives on your story.
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
            Start Chat (Coming Soon)
          </button>
        </div>
        
        <div className="pt-6 space-y-3">
          <p 
            className="text-sm font-medium"
            style={{ color: 'var(--c-primary-100)' }}
          >
            Planned Features:
          </p>
          <ul 
            className="text-sm space-y-1"
            style={{ color: 'var(--c-neutral-dark)' }}
          >
            <li>💬 Natural conversation about your timeline</li>
            <li>🔍 Help finding and organizing memories</li>
            <li>📝 Assistance with event descriptions</li>
            <li>🎯 Personalized timeline insights</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
