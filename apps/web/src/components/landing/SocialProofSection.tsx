'use client'

import { useLocale } from '@/components/i18n/useLocale'

const partnerLogos = [
  { name: "National Archives", placeholder: "NAT" },
  { name: "Genealogy Society", placeholder: "GEN" },
  { name: "Senior Living Corp", placeholder: "SLC" },
  { name: "Memorial Foundation", placeholder: "MEM" },
  { name: "Heritage Trust", placeholder: "HTR" }
]

export default function SocialProofSection() {
  const { t } = useLocale()
  
  const testimonials = t('socialProof.testimonials') as Array<{
    text: string
    author: string
  }>

  return (
    <section 
      id="social-proof" 
      className="section social-proof-section"
    >
      <div className="social-proof-container">
        <h2 className="social-proof-title">
          {t('socialProof.title')}
        </h2>

        {/* Partner Logos */}
        <div className="partner-logos">
          {partnerLogos.map((logo, index) => (
            <div
              key={index}
              className="partner-logo"
              aria-label={`${logo.name} logo`}
            >
              {logo.placeholder}
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <blockquote
              key={index}
              className="testimonial-card"
            >
              <div className="testimonial-quote-mark">
                "
              </div>
              <p className="testimonial-text">
                {testimonial.text}
              </p>
              <cite className="testimonial-author">
                — {testimonial.author}
              </cite>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
