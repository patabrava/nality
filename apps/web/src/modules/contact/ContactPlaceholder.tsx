'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import BookingModal from '@/components/booking/BookingModal'
import { HeroCTA } from '@/components/buttons/BookingCTA'

/**
 * Contact Module - Three primary contact options
 * 1. Schedule meeting with personal interviewer
 * 2. Contact form for questions/feedback
 * 3. Reference to AI chatbot assistant
 */
export function ContactPlaceholder() {
  console.log('[ContactPlaceholder] Component mounted')
  
  const router = useRouter()
  const { user } = useAuth()
  
  // State for booking modal
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  
  // State for contact form
  const [formData, setFormData] = useState({
    topic: 'question',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  
  // Handler functions for booking
  const handleBookingClick = () => {
    console.log('[ContactPlaceholder] Opening booking modal')
    setIsBookingModalOpen(true)
  }
  
  const handleBookingClose = () => {
    console.log('[ContactPlaceholder] Closing booking modal')
    setIsBookingModalOpen(false)
  }
  
  // Handler for chatbot navigation
  const handleChatbotClick = () => {
    console.log('[ContactPlaceholder] Navigating to chat')
    router.push('/dash/chat')
  }
  
  // Handler for contact form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.message.trim()) {
      return
    }
    
    setIsSubmitting(true)
    setSubmitStatus('idle')
    
    try {
      // Get user name from user metadata or email
      const userName = user?.user_metadata?.full_name || 
                      user?.user_metadata?.name || 
                      user?.email?.split('@')[0] || 
                      'User'
      
      // Get topic label
      const topicLabels: Record<string, string> = {
        'question': 'Question',
        'feedback': 'Feedback',
        'support': 'Technical Support',
        'interview': 'Interview Request',
        'other': 'Other'
      }
      const topicLabel = topicLabels[formData.topic] || 'Contact'
      
      // Prepare email data
      const emailData = {
        to: 'tobias.gberger@gmail.com',
        subject: `[${userName}] added ${topicLabel}`,
        message: formData.message,
        userEmail: user?.email || 'unknown',
        userName: userName,
        topic: formData.topic
      }
      
      // Send to API endpoint
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      })
      
      if (response.ok) {
        setSubmitStatus('success')
        setFormData({ topic: 'question', message: '' })
        
        // Reset success message after 5 seconds
        setTimeout(() => {
          setSubmitStatus('idle')
        }, 5000)
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('[ContactPlaceholder] Form submission error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Luxury design styling matching landing page with theme support */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Inter:wght@200;300;400;500&family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400&display=swap');
        
        .contact-container {
          background: var(--theme-bg-primary, #050505);
          color: var(--theme-text-primary, #e0e0e0);
          min-height: 100vh;
          font-family: Inter, system-ui, sans-serif;
          position: relative;
          -webkit-font-smoothing: antialiased;
        }
        
        .contact-header {
          text-align: center;
          margin-bottom: 4rem;
          margin-top: 6rem;
          margin-left: auto;
          margin-right: auto;
          padding: 0 5vw;
          max-width: 1400px;
          position: relative;
          z-index: 2;
        }
        
        .contact-label {
          font-family: Inter, system-ui, sans-serif;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--theme-accent-gold, #D4AF37);
          margin-bottom: 1.5rem;
          display: block;
        }
        
        .contact-content {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 5vw 5vw;
          display: flex;
          flex-direction: column;
          gap: 4rem;
          position: relative;
          z-index: 2;
        }
        
        /* Grain overlay for luxury texture */
        .contact-container::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
          opacity: 0.04;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
        
        .contact-hero {
          background: var(--theme-bg-glass, rgba(20, 20, 20, 0.4));
          backdrop-filter: blur(20px);
          border: 1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.05));
          border-radius: 4px;
          padding: 3rem;
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
          background: radial-gradient(circle, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 40px 40px;
          animation: float 8s ease-in-out infinite alternate;
        }
        
        .contact-icon {
          font-size: 3rem;
          margin-bottom: 1.5rem;
          color: var(--theme-accent-gold, #D4AF37);
        }
        
        .contact-title {
          font-family: Playfair Display, Georgia, serif;
          font-size: clamp(2.5rem, 4vw, 4rem);
          font-weight: 400;
          margin-bottom: 1.5rem;
          margin-left: auto;
          margin-right: auto;
          color: var(--theme-text-primary, #e0e0e0);
          line-height: 1.2;
          letter-spacing: -0.02em;
          text-align: center;
        }
        
        .contact-title-highlight {
          font-family: Playfair Display, Georgia, serif;
          font-style: italic;
          color: var(--theme-accent-gold, #D4AF37);
        }
        
        .contact-subtitle {
          font-family: Inter, system-ui, sans-serif;
          font-size: clamp(1rem, 1.3vw, 1.2rem);
          font-weight: 300;
          color: var(--theme-text-secondary, #a0a0a0);
          line-height: 1.6;
          max-width: 700px;
          margin: 0 auto;
          text-align: center;
        }
        
        .contact-card {
          background: var(--theme-bg-glass, rgba(20, 20, 20, 0.4));
          backdrop-filter: blur(20px);
          border: 1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.05));
          border-radius: 4px;
          padding: 3rem;
          transition: all 0.5s ease;
          position: relative;
          overflow: hidden;
          z-index: 2;
        }
        
        .contact-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--theme-accent-gold, #D4AF37), transparent);
          transform: scaleX(0);
          transition: transform 0.5s ease;
        }
        
        .contact-card:hover {
          transform: translateY(-10px);
          border-color: var(--theme-border-hover, rgba(255, 255, 255, 0.1));
        }
        
        .contact-card:hover::before {
          transform: scaleX(1);
        }
        
        /* Option Header */
        .option-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .option-icon {
          font-size: 2.5rem;
          line-height: 1;
        }
        
        .option-title {
          font-family: Playfair Display, Georgia, serif;
          font-size: 1.8rem;
          font-weight: 400;
          color: var(--theme-text-primary, #e0e0e0);
          margin: 0;
        }
        
        .option-description {
          font-family: Inter, system-ui, sans-serif;
          font-size: 1rem;
          color: var(--theme-text-secondary, #a0a0a0);
          line-height: 1.7;
          margin-bottom: 2rem;
        }
        
        /* Benefits List */
        .option-benefits {
          margin-bottom: 2rem;
        }
        
        .benefit-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
          font-family: Inter, system-ui, sans-serif;
          font-size: 0.95rem;
          color: var(--theme-text-secondary, #c0c0c0);
        }
        
        .benefit-check {
          color: var(--theme-accent-gold, #D4AF37);
          font-weight: bold;
          font-size: 1.1rem;
        }
        
        /* Contact Form */
        .contact-form {
          margin-top: 2rem;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-label {
          display: block;
          font-family: Inter, system-ui, sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--theme-text-primary, #e0e0e0);
          margin-bottom: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        
        .form-select {
          width: 100%;
          padding: 1rem 1.5rem;
          border-radius: 4px;
          border: 1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08));
          background: var(--theme-bg-secondary, rgba(15, 15, 15, 0.8));
          color: var(--theme-text-primary, #e0e0e0);
          font-family: Inter, system-ui, sans-serif;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .form-select:focus {
          outline: none;
          border-color: var(--theme-accent-gold, #D4AF37);
          box-shadow: 0 0 0 2px var(--theme-gradient-gold-subtle, rgba(212, 175, 55, 0.1));
        }
        
        .form-select option {
          background: var(--theme-bg-primary, #0a0a0a);
          color: var(--theme-text-primary, #e0e0e0);
          padding: 0.5rem;
        }
        
        .form-textarea {
          width: 100%;
          padding: 1.5rem;
          border-radius: 4px;
          border: 1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08));
          background: var(--theme-bg-secondary, rgba(15, 15, 15, 0.8));
          color: var(--theme-text-primary, #e0e0e0);
          font-family: Inter, system-ui, sans-serif;
          font-size: 1rem;
          line-height: 1.6;
          resize: vertical;
          transition: all 0.4s ease;
        }
        
        .form-textarea:focus {
          outline: none;
          border-color: var(--theme-accent-gold, #D4AF37);
          box-shadow: 0 0 0 2px var(--theme-gradient-gold-subtle, rgba(212, 175, 55, 0.1));
        }
        
        .form-textarea::placeholder {
          color: var(--theme-text-secondary, #666);
          font-style: italic;
        }
        
        .form-submit-button {
          width: 100%;
          padding: 1.25rem 2rem;
          background: var(--theme-gradient-gold-subtle, rgba(212, 175, 55, 0.1));
          border: 1px solid var(--theme-accent-gold, #D4AF37);
          color: var(--theme-accent-gold, #D4AF37);
          font-family: Inter, system-ui, sans-serif;
          font-size: 1rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.4s ease;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }
        
        .form-submit-button:hover:not(:disabled) {
          background: var(--theme-accent-gold, #D4AF37);
          color: var(--theme-bg-primary, #050505);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px var(--theme-gradient-gold-hover, rgba(212, 175, 55, 0.2));
        }
        
        .form-submit-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .submit-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid var(--theme-gradient-gold-subtle, rgba(212, 175, 55, 0.3));
          border-top-color: var(--theme-accent-gold, #D4AF37);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        
        .form-success {
          padding: 1rem 1.5rem;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 4px;
          color: #10b981;
          font-family: Inter, system-ui, sans-serif;
          font-size: 0.95rem;
          margin-bottom: 1rem;
          text-align: center;
        }
        
        .form-error {
          padding: 1rem 1.5rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 4px;
          color: #ef4444;
          font-family: Inter, system-ui, sans-serif;
          font-size: 0.95rem;
          margin-bottom: 1rem;
          text-align: center;
        }
        
        /* Chatbot Card */
        .chatbot-card {
          background: linear-gradient(135deg, var(--theme-gradient-gold-subtle, rgba(212, 175, 55, 0.05)) 0%, var(--theme-bg-glass, rgba(20, 20, 20, 0.4)) 100%);
        }
        
        .chatbot-button {
          width: 100%;
          padding: 1.25rem 2rem;
          background: transparent;
          border: 1px solid var(--theme-border-hover, rgba(255, 255, 255, 0.2));
          color: var(--theme-text-primary, #e0e0e0);
          font-family: Inter, system-ui, sans-serif;
          font-size: 1rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.4s ease;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }
        
        .chatbot-button:hover {
          background: var(--theme-gradient-gold-hover, rgba(255, 255, 255, 0.05));
          border-color: var(--theme-border-hover, rgba(255, 255, 255, 0.4));
          transform: translateY(-2px);
        }
        
        .chatbot-icon {
          font-size: 1.5rem;
        }
        
        .chatbot-arrow {
          font-size: 1.5rem;
          transition: transform 0.3s ease;
        }
        
        .chatbot-button:hover .chatbot-arrow {
          transform: translateX(5px);
        }
        
        .support-info {
          text-align: center;
          padding: 2.5rem;
          background: var(--theme-bg-glass, rgba(20, 20, 20, 0.2));
          border: 1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.03));
          border-radius: 4px;
          z-index: 2;
          position: relative;
        }
        
        .support-title {
          font-family: Playfair Display, Georgia, serif;
          font-size: 1.5rem;
          font-weight: 400;
          color: var(--theme-accent-gold, #D4AF37);
          margin-bottom: 1rem;
        }
        
        .support-text {
          font-family: Inter, system-ui, sans-serif;
          font-size: 1rem;
          color: var(--theme-text-secondary, #a0a0a0);
          line-height: 1.8;
          max-width: 600px;
          margin: 0 auto;
        }
        
        /* Animations */
        @keyframes float {
          from {
            transform: translateY(0px);
          }
          to {
            transform: translateY(-10px);
          }
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        /* Responsive design */
        @media (max-width: 1024px) {
          .contact-header {
            margin-top: 5rem;
            padding: 0 3rem;
          }
          
          .contact-content {
            padding: 0 3rem 3rem;
            gap: 3rem;
          }
          
          .contact-hero {
            padding: 2.5rem 2rem;
          }
          
          .contact-card {
            padding: 2rem;
          }
          
          .contact-title {
            font-size: clamp(2rem, 5vw, 3rem);
          }
          
          .contact-icon {
            font-size: 3rem;
          }
          
          .option-title {
            font-size: 1.5rem;
          }
        }
        
        @media (max-width: 768px) {
          .contact-header {
            margin-top: 4rem;
            padding: 0 2rem;
          }
          
          .contact-content {
            padding: 0 2rem 2rem;
            gap: 2rem;
          }
          
          .contact-hero {
            padding: 2rem 1.5rem;
          }
          
          .contact-card {
            padding: 1.5rem;
          }
          
          .support-info {
            padding: 1.5rem;
          }
          
          .option-header {
            flex-direction: column;
            text-align: center;
            gap: 0.5rem;
          }
          
          .option-icon {
            font-size: 2rem;
          }
          
          .option-title {
            font-size: 1.3rem;
          }
          
          .form-submit-button,
          .chatbot-button {
            padding: 1rem 1.5rem;
            font-size: 0.9rem;
          }
        }
        
        /* CTA Wrapper Centering */
        .cta-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          margin-top: 2rem;
        }
        
        .cta-wrapper :global(.booking-cta-container) {
          width: auto;
          max-width: 100%;
        }
      `}</style>
      
      <section className="contact-container">
        {/* Section Header */}
        <div className="contact-header">
          <span className="contact-label">Get in Touch</span>
          <h1 className="contact-title">
            We're here to <span className="contact-title-highlight">help</span>
          </h1>
        </div>
        
        {/* Contact Content */}
        <div className="contact-content">
          {/* Hero Description */}
          <div className="contact-hero">
            <p className="contact-subtitle">
              Choose how you'd like to connect with us. Whether you need personal guidance, have questions, or want instant assistance—we're ready to support your journey.
            </p>
          </div>

          {/* Option 1: Schedule Personal Interview */}
          <div className="contact-card">
          <div className="option-header">
            <div className="option-icon">🎤</div>
            <h2 className="option-title">Personal Interview Service</h2>
          </div>
          
          <p className="option-description">
            Experience professional storytelling with a dedicated interviewer who brings out the depth and richness of your life story. Perfect for capturing complex narratives, family histories, and meaningful moments that deserve expert attention.
          </p>
          
          <div className="option-benefits">
            <div className="benefit-item">
              <span className="benefit-check">✓</span>
              <span>Expert storytellers trained in life narrative techniques</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-check">✓</span>
              <span>HD recording with professional transcription service</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-check">✓</span>
              <span>Seamless integration into your timeline</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-check">✓</span>
              <span>Ideal for elder stories and family legacy preservation</span>
            </div>
          </div>
          
          <div className="cta-wrapper">
            <HeroCTA 
              onClick={handleBookingClick}
              source="contact-page-interview"
              animated
              urgency={false}
              showCounter={false}
            />
          </div>
        </div>

        {/* Option 2: AI Chatbot Reference */}
        <div className="contact-card chatbot-card">
          <div className="option-header">
            <div className="option-icon">🤖</div>
            <h2 className="option-title">Try Our AI Assistant</h2>
          </div>
          
          <p className="option-description">
            Get instant help from our intelligent AI assistant. Perfect for quick questions, 
            adding life events, or exploring features at your own pace.
          </p>
          
          <div className="option-benefits">
            <div className="benefit-item">
              <span className="benefit-check">✓</span>
              <span>Available 24/7 for instant assistance</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-check">✓</span>
              <span>Helps you add and organize life events</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-check">✓</span>
              <span>Answers common questions immediately</span>
            </div>
          </div>
          
          <button
            onClick={handleChatbotClick}
            className="chatbot-button"
          >
            <span className="chatbot-icon">💬</span>
            <span>Open AI Assistant</span>
            <span className="chatbot-arrow">→</span>
          </button>
        </div>

        {/* Option 3: Contact Form */}
        <div className="contact-card">
          <div className="option-header">
            <div className="option-icon">✉️</div>
            <h2 className="option-title">Send Us a Message</h2>
          </div>
          
          <p className="option-description">
            Have questions, feedback, or need support? Send us a message and we'll get back to you promptly.
          </p>
          
          <form onSubmit={handleFormSubmit} className="contact-form">
            <div className="form-group">
              <label className="form-label">Topic</label>
              <select
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="form-select"
              >
                <option value="question">Question</option>
                <option value="feedback">Feedback</option>
                <option value="support">Technical Support</option>
                <option value="interview">Interview Request</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Your Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Share your thoughts, questions, or concerns..."
                className="form-textarea"
                rows={6}
                required
              />
            </div>
            
            {submitStatus === 'success' && (
              <div className="form-success">
                ✓ Message sent successfully! We'll respond within 24 hours.
              </div>
            )}
            
            {submitStatus === 'error' && (
              <div className="form-error">
                ✗ Failed to send message. Please try again or contact us directly.
              </div>
            )}
            
            <button
              type="submit"
              className="form-submit-button"
              disabled={isSubmitting || !formData.message.trim()}
            >
              {isSubmitting ? (
                <>
                  <span className="submit-spinner"></span>
                  Sending...
                </>
              ) : (
                'Send Message'
              )}
            </button>
          </form>
        </div>
        
        {/* Support Information */}
        <div className="support-info">
          <p className="support-title">
            Premium Support Promise
          </p>
          <p className="support-text">
            Your story matters. We're committed to providing exceptional support through every step of your journey. 
            Choose any contact method above, and our team will ensure you receive the guidance and assistance you deserve.
          </p>
        </div>
        </div>
      </section>
      
      {/* Booking Modal - Full integration with Cal.com */}
      <BookingModal 
        isOpen={isBookingModalOpen}
        onClose={handleBookingClose}
        source="contact-page"
        animated
      />
    </>
  )
}
