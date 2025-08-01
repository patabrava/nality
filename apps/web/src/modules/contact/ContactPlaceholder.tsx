'use client'

/**
 * Contact Module Placeholder  
 * Preview interface for future contact functionality
 */
export function ContactPlaceholder() {
  console.log('[ContactPlaceholder] Component mounted')

  return (
    <section 
      className="max-w-md mx-auto p-8 space-y-8"
      style={{ 
        backgroundColor: 'var(--c-primary-invert)',
        minHeight: '100vh'
      }}
    >
      <div className="text-center space-y-4">
        <div className="text-5xl mb-4">📞</div>
        
        <h2 
          className="text-2xl font-semibold"
          style={{ color: 'var(--c-primary-100)' }}
        >
          Get in touch
        </h2>
        
        <p 
          className="text-base leading-relaxed"
          style={{ color: 'var(--c-neutral-dark)' }}
        >
          Need help with your timeline? Have feedback or questions? We're here to support your storytelling journey.
        </p>
      </div>

      <form className="space-y-6">
        <div>
          <label 
            className="block text-sm font-semibold mb-2"
            style={{ color: 'var(--c-primary-100)' }}
          >
            Your message
          </label>
          <textarea 
            placeholder="Tell us how we can help you with your timeline..."
            className="w-full h-32 p-4 rounded-xl border-2 transition-colors resize-none"
            style={{
              backgroundColor: 'var(--c-neutral-light)',
              borderColor: 'var(--c-neutral-medium)',
              color: 'var(--c-primary-100)'
            }}
            disabled
          />
        </div>

        <div className="space-y-3">
          <button 
            className="w-full h-12 px-6 rounded-xl font-semibold text-base transition-all duration-200 opacity-60 cursor-not-allowed"
            style={{
              backgroundColor: 'var(--c-neutral-medium)',
              color: 'var(--c-primary-invert)'
            }}
            disabled
          >
            Send Message (Coming Soon)
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              className="h-12 px-4 rounded-xl font-semibold text-sm transition-all duration-200 opacity-60 cursor-not-allowed"
              style={{
                backgroundColor: 'var(--c-neutral-light)',
                borderColor: 'var(--c-neutral-medium)',
                color: 'var(--c-neutral-dark)',
                border: '1px solid'
              }}
              disabled
            >
              Request Call‑Back
            </button>
            
            <button 
              className="h-12 px-4 rounded-xl font-semibold text-sm transition-all duration-200 opacity-60 cursor-not-allowed"
              style={{
                backgroundColor: 'var(--c-neutral-light)',
                borderColor: 'var(--c-neutral-medium)',
                color: 'var(--c-neutral-dark)',
                border: '1px solid'
              }}
              disabled
            >
              Start Video Call
            </button>
          </div>
        </div>
      </form>
      
      <div className="pt-4 space-y-3 text-center">
        <p 
          className="text-sm font-medium"
          style={{ color: 'var(--c-primary-100)' }}
        >
          Support Options:
        </p>
        <ul 
          className="text-sm space-y-1"
          style={{ color: 'var(--c-neutral-dark)' }}
        >
          <li>📧 Email support for timeline questions</li>
          <li>📞 Phone consultations for complex stories</li>
          <li>🎥 Video calls for personalized guidance</li>
          <li>💬 Live chat for quick assistance</li>
        </ul>
      </div>
    </section>
  )
}
