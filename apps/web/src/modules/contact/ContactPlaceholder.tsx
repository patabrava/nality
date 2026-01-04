'use client'

import { useState } from 'react'
import { Send, Calendar, Wrench, MessageSquare, Lightbulb, Mail } from 'lucide-react'

/**
 * Contact Module
 * Clean, functional contact interface matching dash page design
 */
export function ContactPlaceholder() {
  console.log('[ContactPlaceholder] Component mounted')

  const [formData, setFormData] = useState({
    category: '',
    name: '',
    email: '',
    message: ''
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)

  const categories = [
    { id: 'technical', label: 'Technical Issues', icon: Wrench },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'feature', label: 'Feature Request', icon: Lightbulb },
    { id: 'general', label: 'General Inquiry', icon: Mail }
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
    }
    
    if (!formData.category) {
      setFormData(prev => ({ ...prev, category: 'general' }))
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('[ContactForm] Form submitted', formData)
    
    if (!validateForm()) {
      console.log('[ContactForm] Validation failed', errors)
      return
    }
    
    setSubmitting(true)
    
    // TODO: API integration - placeholder for future backend
    setTimeout(() => {
      console.log('[ContactForm] Message sent successfully')
      setSubmitted(true)
      setSubmitting(false)
      setFormData({ category: '', name: '', email: '', message: '' })
      
      setTimeout(() => setSubmitted(false), 5000)
    }, 1000)
  }

  const handleCalendarClick = () => {
    console.log('[CalendarBooking] Calendar popup opened')
    setShowCalendar(true)
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Hero Section - Clean design without box */}
      <header style={{
        textAlign: 'center',
        marginBottom: '48px',
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '1.75rem', 
          fontFamily: 'var(--font-playfair, Playfair Display, serif)',
          color: '#fff',
          marginBottom: '12px',
        }}>
          Get in Touch
        </h1>
        <p style={{ 
          margin: 0,
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '0.95rem',
          lineHeight: 1.6,
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto',
          fontWeight: 300,
        }}>
          Whether you need guidance crafting your legacy or technical support for your timeline, 
          our dedicated team is here to ensure your story receives the attention it deserves.
        </p>
      </header>

      {/* Calendar Booking Section */}
      <section style={{
        padding: '32px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        textAlign: 'center',
        marginBottom: '48px',
      }}>
        <h2 style={{
          fontSize: '1.1rem',
          fontFamily: 'var(--font-playfair, Playfair Display, serif)',
          color: '#fff',
          marginBottom: '12px',
          marginTop: 0,
        }}>
          Work with Our Biography Experts
        </h2>
        <p style={{
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '0.9rem',
          marginBottom: '24px',
          lineHeight: 1.6,
          maxWidth: '500px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          Schedule a professional interview session with our experienced team to capture your life story. 
          We'll guide you through the process of creating your personalized autobiography.
        </p>
        <button
          type="button"
          onClick={handleCalendarClick}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '16px 32px',
            background: 'linear-gradient(135deg, #D4AF37, rgba(180, 140, 20, 1))',
            border: 'none',
            borderRadius: '100px',
            color: '#050505',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '1rem',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <Calendar size={20} />
          Book Your Interview Session
        </button>
      </section>

      {/* Category Selection */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '0.85rem',
          color: '#D4AF37',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '16px',
          fontWeight: 500,
        }}>
          How can we help?
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
        }}>
          {categories.map((category) => {
            const Icon = category.icon
            const isActive = formData.category === category.id
            
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, category: category.id }))
                  setErrors(prev => ({ ...prev, category: '' }))
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  background: isActive 
                    ? 'linear-gradient(135deg, #D4AF37, rgba(180, 140, 20, 1))'
                    : 'rgba(255, 255, 255, 0.05)',
                  color: isActive ? '#050505' : 'rgba(255, 255, 255, 0.7)',
                  border: isActive ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                  }
                }}
              >
                <Icon size={16} />
                {category.label}
              </button>
            )
          })}
        </div>
      </section>

      {/* Contact Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '32px' }}>
        {/* Name Field */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '0.85rem',
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, name: e.target.value }))
              setErrors(prev => ({ ...prev, name: '' }))
            }}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: errors.name ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.9rem',
              outline: 'none',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => {
              if (!errors.name) e.currentTarget.style.borderColor = '#D4AF37'
            }}
            onBlur={(e) => {
              if (!errors.name) e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
            }}
          />
          {errors.name && (
            <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', marginBottom: 0 }}>
              {errors.name}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '0.85rem',
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, email: e.target.value }))
              setErrors(prev => ({ ...prev, email: '' }))
            }}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: errors.email ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.9rem',
              outline: 'none',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => {
              if (!errors.email) e.currentTarget.style.borderColor = '#D4AF37'
            }}
            onBlur={(e) => {
              if (!errors.email) e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
            }}
          />
          {errors.email && (
            <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', marginBottom: 0 }}>
              {errors.email}
            </p>
          )}
        </div>

        {/* Message Field */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '0.85rem',
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Message
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, message: e.target.value }))
              setErrors(prev => ({ ...prev, message: '' }))
            }}
            rows={6}
            placeholder="Tell us how we can help you..."
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: errors.message ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.9rem',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit',
              lineHeight: 1.6,
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => {
              if (!errors.message) e.currentTarget.style.borderColor = '#D4AF37'
            }}
            onBlur={(e) => {
              if (!errors.message) e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
            }}
          />
          {errors.message && (
            <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', marginBottom: 0 }}>
              {errors.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '16px 32px',
            background: submitting 
              ? 'rgba(212, 175, 55, 0.5)'
              : 'linear-gradient(135deg, #D4AF37, rgba(180, 140, 20, 1))',
            border: 'none',
            borderRadius: '100px',
            color: '#050505',
            fontWeight: 600,
            cursor: submitting ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            transition: 'transform 0.2s ease, opacity 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (!submitting) e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          {submitting ? (
            'Sending...'
          ) : (
            <>
              <Send size={18} />
              Send Message
            </>
          )}
        </button>

        {/* Success Message */}
        {submitted && (
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '8px',
            color: '#22c55e',
            fontSize: '0.9rem',
            textAlign: 'center',
          }}>
            ✓ Message sent successfully! We'll get back to you soon.
          </div>
        )}
      </form>

      {/* Calendar Popup Modal */}
      {showCalendar && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
          onClick={() => setShowCalendar(false)}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '900px',
              height: '90vh',
              maxHeight: '700px',
              background: '#fff',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowCalendar(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.5)',
                border: 'none',
                color: '#fff',
                fontSize: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)'
              }}
            >
              ×
            </button>
            <iframe
              src="https://calendar.app.google/hTLQhe9koce2qVXp9"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
              title="Book Interview Session"
            />
          </div>
        </div>
      )}
    </div>
  )
}
