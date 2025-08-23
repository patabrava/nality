'use client'

/**
 * Contact Module Placeholder  
 * Preview interface for future contact functionality
 * Material Design 3 compliant implementation
 */
export function ContactPlaceholder() {
  console.log('[ContactPlaceholder] Component mounted')

  return (
    <>
      {/* Material Design 3 styling for contact module */}
      <style jsx>{`
        .contact-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 2rem;
          background: var(--md-sys-color-background);
          color: var(--md-sys-color-on-background);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        
        .contact-hero {
          text-align: center;
          padding: 2rem 0;
          background: linear-gradient(135deg, var(--md-sys-color-surface-container), var(--md-sys-color-surface-container-high));
          border-radius: 24px;
          border: 1px solid var(--md-sys-color-outline-variant);
          position: relative;
          overflow: hidden;
        }
        
        .contact-hero::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 40px 40px;
          animation: float var(--md-sys-motion-duration-long2) ease-in-out infinite alternate;
        }
        
        .contact-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          position: relative;
          z-index: 1;
        }
        
        .contact-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 1rem;
          position: relative;
          z-index: 1;
          line-height: 1.3;
        }
        
        .contact-subtitle {
          font-size: 1rem;
          color: var(--md-sys-color-on-surface-variant);
          line-height: 1.5;
          position: relative;
          z-index: 1;
          opacity: 0.9;
        }
        
        .contact-card {
          background: var(--md-sys-color-surface-container);
          border-radius: 16px;
          padding: 2rem;
          border: 1px solid var(--md-sys-color-outline-variant);
          transition: all var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard);
          position: relative;
          overflow: hidden;
        }
        
        .contact-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--md-sys-color-on-surface), var(--md-sys-color-on-surface-variant));
          transform: scaleX(0);
          transition: transform var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard);
        }
        
        .contact-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
          border-color: var(--md-sys-color-outline);
        }
        
        .contact-card:hover::before {
          transform: scaleX(1);
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 0.5rem;
        }
        
        .form-textarea {
          width: 100%;
          min-height: 128px;
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid var(--md-sys-color-outline-variant);
          background: var(--md-sys-color-surface-container-low);
          color: var(--md-sys-color-on-surface);
          font-family: 'Roboto', system-ui, sans-serif;
          font-size: 1rem;
          line-height: 1.5;
          resize: vertical;
          transition: all var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
        }
        
        .form-textarea:focus {
          outline: 2px solid var(--md-sys-color-primary);
          outline-offset: 0;
          border-color: var(--md-sys-color-primary);
        }
        
        .form-textarea::placeholder {
          color: var(--md-sys-color-on-surface-variant);
          opacity: 0.7;
        }
        
        .button-primary {
          width: 100%;
          height: 48px;
          padding: 0 2rem;
          background: var(--md-sys-color-primary-container);
          color: var(--md-sys-color-on-primary-container);
          border: none;
          border-radius: 24px;
          font-size: 1rem;
          font-weight: 600;
          cursor: not-allowed;
          transition: all var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard);
          opacity: 0.6;
          font-family: 'Roboto', system-ui, sans-serif;
        }
        
        .button-secondary {
          height: 48px;
          padding: 0 1rem;
          background: var(--md-sys-color-surface-container-high);
          color: var(--md-sys-color-on-surface-variant);
          border: 1px solid var(--md-sys-color-outline-variant);
          border-radius: 24px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: not-allowed;
          transition: all var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard);
          opacity: 0.6;
          font-family: 'Roboto', system-ui, sans-serif;
        }
        
        .button-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }
        
        .button-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .support-info {
          text-align: center;
          padding-top: 1rem;
        }
        
        .support-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 0.75rem;
        }
        
        .support-list {
          list-style: none;
          padding: 0;
          margin: 0;
          font-size: 0.875rem;
          color: var(--md-sys-color-on-surface-variant);
          line-height: 1.6;
        }
        
        .support-list li {
          margin-bottom: 0.5rem;
        }
        
        /* Animation keyframes */
        @keyframes float {
          from {
            transform: translateY(0px);
          }
          to {
            transform: translateY(-10px);
          }
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
          .contact-container {
            padding: 1rem;
            gap: 1.5rem;
          }
          
          .contact-hero {
            padding: 1.5rem;
          }
          
          .contact-card {
            padding: 1.5rem;
          }
          
          .contact-title {
            font-size: 1.75rem;
          }
          
          .contact-icon {
            font-size: 3rem;
          }
        }
      `}</style>
      
      <section className="contact-container">
        {/* Hero Section */}
        <div className="contact-hero">
          <div className="contact-icon">📞</div>
          
          <h2 className="contact-title">
            Get in touch
          </h2>
          
          <p className="contact-subtitle">
            Need help with your timeline? Have feedback or questions? We&apos;re here to support your storytelling journey.
          </p>
        </div>

        {/* Contact Form Card */}
        <div className="contact-card">
          <form>
            <div className="form-group">
              <label className="form-label">
                Your message
              </label>
              <textarea 
                placeholder="Tell us how we can help you with your timeline..."
                className="form-textarea"
                disabled
              />
            </div>

            <div className="button-group">
              <button 
                className="button-primary"
                disabled
              >
                Send Message (Coming Soon)
              </button>
              
              <div className="button-grid">
                <button 
                  className="button-secondary"
                  disabled
                >
                  Request Call‑Back
                </button>
                
                <button 
                  className="button-secondary"
                  disabled
                >
                  Start Video Call
                </button>
              </div>
            </div>
          </form>
        </div>
        
        {/* Support Information */}
        <div className="support-info">
          <p className="support-title">
            Support Options:
          </p>
          <ul className="support-list">
            <li>📧 Email support for timeline questions</li>
            <li>📞 Phone consultations for complex stories</li>
            <li>🎥 Video calls for personalized guidance</li>
            <li>💬 Live chat for quick assistance</li>
          </ul>
        </div>
      </section>
    </>
  )
}
