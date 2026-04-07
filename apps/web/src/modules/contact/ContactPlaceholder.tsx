'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, Calendar, X, Wrench, MessageSquare, Lightbulb, Mail } from 'lucide-react'

/**
 * Contact Module
 * Clean, functional contact interface matching dash page design
 */
export function ContactPlaceholder() {

  const bookingButtonRef = useRef<HTMLButtonElement | null>(null)
  const closeBookingButtonRef = useRef<HTMLButtonElement | null>(null)

  const [formData, setFormData] = useState({
    category: '',
    name: '',
    email: '',
    message: ''
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

  const categories = [
    { id: 'technical', label: 'Technische Probleme', icon: Wrench },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'feature', label: 'Funktionswunsch', icon: Lightbulb },
    { id: 'general', label: 'Allgemeine Anfrage', icon: Mail }
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name ist erforderlich'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-Mail ist erforderlich'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Bitte gib eine gültige E-Mail-Adresse ein'
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Eine Nachricht ist erforderlich'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Die Nachricht muss mindestens 10 Zeichen lang sein'
    }
    
    if (!formData.category) {
      setFormData(prev => ({ ...prev, category: 'general' }))
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    // TODO: API integration - placeholder for future backend
    setTimeout(() => {
      setSubmitted(true)
      setSubmitting(false)
      setFormData({ category: '', name: '', email: '', message: '' })
      
      setTimeout(() => setSubmitted(false), 5000)
    }, 1000)
  }

  const handleCalendarClick = () => {
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
          Kontakt aufnehmen
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
          Ob du Unterstützung beim Festhalten deines Vermächtnisses oder technische Hilfe für deine Zeitleiste brauchst:
          Unser Team sorgt dafür, dass deine Geschichte die Aufmerksamkeit bekommt, die sie verdient.
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
          Mit unseren Biografie-Expertinnen und -Experten arbeiten
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
          Vereinbare ein professionelles Interview mit unserem erfahrenen Team, um deine Lebensgeschichte festzuhalten.
          Wir begleiten dich durch den gesamten Weg zu deiner persönlichen Autobiografie.
        </p>
        <button
          ref={bookingButtonRef}
          type="button"
          onClick={openBookingModal}
          aria-haspopup="dialog"
          aria-expanded={isBookingModalOpen}
          aria-controls="contact-cal-booking-modal"
          aria-label="Open Cal.com booking popup"
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
          Interviewtermin buchen
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
          Wobei können wir helfen?
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
          <label htmlFor="contact-name" style={{
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
            id="contact-name"
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
          <label htmlFor="contact-email" style={{
            display: 'block',
            fontSize: '0.85rem',
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            E-Mail
          </label>
          <input
            id="contact-email"
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
          <label htmlFor="contact-message" style={{
            display: 'block',
            fontSize: '0.85rem',
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Nachricht
          </label>
          <textarea
            id="contact-message"
            value={formData.message}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, message: e.target.value }))
              setErrors(prev => ({ ...prev, message: '' }))
            }}
            rows={6}
            placeholder="Erzähl uns, wie wir dir helfen können..."
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
            'Wird gesendet...'
          ) : (
            <>
              <Send size={18} />
              Nachricht senden
            </>
          )}
        </button>

        {/* Success Message */}
        {submitted && (
          <div
            role="status"
            aria-live="polite"
            style={{
              marginTop: '16px',
              padding: '12px 16px',
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '8px',
              color: '#22c55e',
              fontSize: '0.9rem',
              textAlign: 'center',
            }}
          >
            ✓ Nachricht erfolgreich gesendet. Wir melden uns bald bei dir.
          </div>
        )}
      </form>

      {isBookingModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Interviewtermin buchen"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <button
            type="button"
            aria-label="Close Cal.com booking popup"
            onClick={closeBookingModal}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.75)',
              border: 'none',
              cursor: 'pointer',
            }}
          />

          <section
            id="contact-cal-booking-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-cal-booking-modal-title"
            style={{
              position: 'relative',
              zIndex: 1,
              width: '100%',
              maxWidth: '980px',
              height: '85vh',
              background: 'rgba(12, 12, 12, 0.98)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
            }}
          >
            <header
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <h3
                id="contact-cal-booking-modal-title"
                style={{
                  margin: 0,
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              >
                Book your interview with Cal.com
              </h3>

              <button
                ref={closeBookingButtonRef}
                type="button"
                onClick={closeBookingModal}
                aria-label="Close booking popup"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  borderRadius: '999px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'transparent',
                  color: 'rgba(255, 255, 255, 0.9)',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </header>

            <iframe
                            src="https://cal.com/nality"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                background: '#fff',
              }}
              title="Interviewtermin buchen"
            />
          </section>
        </div>
      )}

    </div>
  )
}
