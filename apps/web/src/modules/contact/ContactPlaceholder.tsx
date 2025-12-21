'use client'

/**
 * Contact Module Placeholder  
 * Preview interface for future contact functionality
 * Elegant luxury design matching landing page aesthetic
 */
export function ContactPlaceholder() {
  console.log('[ContactPlaceholder] Component mounted')

  return (
    <>
      {/* Luxury design styling matching landing page */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Inter:wght@200;300;400;500&family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400&display=swap');
        
        .contact-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 5vw;
          background: #050505;
          color: #e0e0e0;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          gap: 4rem;
          font-family: 'Inter', sans-serif;
          position: relative;
          -webkit-font-smoothing: antialiased;
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
          text-align: center;
          padding: 4rem 0;
          background: rgba(20, 20, 20, 0.4);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          position: relative;
          overflow: hidden;
          z-index: 2;
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
          font-size: 4rem;
          margin-bottom: 2rem;
          position: relative;
          z-index: 1;
          color: #D4AF37;
        }
        
        .contact-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.5rem, 4vw, 4rem);
          font-weight: 400;
          color: #e0e0e0;
          margin-bottom: 2rem;
          position: relative;
          z-index: 1;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }
        
        .contact-subtitle {
          font-family: 'Inter', sans-serif;
          font-size: clamp(1.1rem, 1.5vw, 1.4rem);
          font-weight: 300;
          color: #a0a0a0;
          line-height: 1.6;
          position: relative;
          z-index: 1;
          max-width: 500px;
          margin: 0 auto;
        }
        
        .contact-card {
          background: rgba(20, 20, 20, 0.4);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
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
          background: linear-gradient(90deg, #D4AF37, transparent);
          transform: scaleX(0);
          transition: transform 0.5s ease;
        }
        
        .contact-card:hover {
          transform: translateY(-10px);
          border-color: rgba(255, 255, 255, 0.1);
        }
        
        .contact-card:hover::before {
          transform: scaleX(1);
        }
        
        .form-group {
          margin-bottom: 2rem;
        }
        
        .form-label {
          display: block;
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          color: #e0e0e0;
          margin-bottom: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        
        .form-textarea {
          width: 100%;
          min-height: 150px;
          padding: 1.5rem;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(15, 15, 15, 0.8);
          color: #e0e0e0;
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          line-height: 1.6;
          resize: vertical;
          transition: all 0.4s ease;
        }
        
        .form-textarea:focus {
          outline: none;
          border-color: #D4AF37;
          box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.1);
        }
        
        .form-textarea::placeholder {
          color: #666;
          font-style: italic;
        }
        
        .button-primary {
          width: 100%;
          padding: 1rem 2.5rem;
          background: #e0e0e0;
          color: #050505;
          border: 1px solid #e0e0e0;
          border-radius: 0;
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: not-allowed;
          transition: all 0.4s ease;
          opacity: 0.6;
          position: relative;
          overflow: hidden;
        }
        
        .button-primary:hover {
          background: transparent;
          color: #e0e0e0;
        }
        
        .button-secondary {
          padding: 0.9rem 2rem;
          background: transparent;
          color: #e0e0e0;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 0;
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: not-allowed;
          transition: all 0.4s ease;
          opacity: 0.6;
        }
        
        .button-secondary:hover {
          border-color: #e0e0e0;
        }
        
        .button-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        
        .button-group {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .support-info {
          text-align: center;
          padding: 2rem;
          background: rgba(20, 20, 20, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 4px;
          z-index: 2;
          position: relative;
        }
        
        .support-title {
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem;
          font-weight: 500;
          color: #D4AF37;
          margin-bottom: 1.5rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
        }
        
        .support-list {
          list-style: none;
          padding: 0;
          margin: 0;
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          color: #a0a0a0;
          line-height: 1.8;
        }
        
        .support-list li {
          margin-bottom: 0.75rem;
          padding-left: 1.5rem;
          position: relative;
        }
        
        .support-list li::before {
          content: "—";
          position: absolute;
          left: 0;
          color: #D4AF37;
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
        @media (max-width: 1024px) {
          .contact-container {
            padding: 3rem 2rem;
            gap: 3rem;
          }
          
          .contact-hero {
            padding: 3rem 2rem;
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
          
          .button-grid {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 768px) {
          .contact-container {
            padding: 2rem 1rem;
            gap: 2rem;
          }
          
          .contact-hero {
            padding: 2rem 1rem;
          }
          
          .contact-card {
            padding: 1.5rem;
          }
          
          .support-info {
            padding: 1.5rem;
          }
        }
      `}</style>
      
      <section className="contact-container">
        {/* Hero Section */}
        <div className="contact-hero">
          <div className="contact-icon">✉</div>
          
          <h1 className="contact-title">
            Connect with <span style={{fontFamily: 'Cormorant Garamond', fontStyle: 'italic', background: 'linear-gradient(135deg, #fbf5b7 0%, #bf953f 50%, #b38728 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>elegance</span>
          </h1>
          
          <p className="contact-subtitle">
            Whether you need guidance crafting your legacy or technical support for your timeline, our dedicated team is here to ensure your story receives the attention it deserves.
          </p>
        </div>

        {/* Contact Form Card */}
        <div className="contact-card">
          <form>
            <div className="form-group">
              <label className="form-label">
                Your Message
              </label>
              <textarea 
                placeholder="Share how we can assist with your autobiography journey..."
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
                  Schedule Consultation
                </button>
                
                <button 
                  className="button-secondary"
                  disabled
                >
                  Request Callback
                </button>
              </div>
            </div>
          </form>
        </div>
        
        {/* Support Information */}
        <div className="support-info">
          <p className="support-title">
            Premium Support Services
          </p>
          <ul className="support-list">
            <li>Personal story consultation and guidance</li>
            <li>Technical assistance for timeline management</li>
            <li>Priority scheduling for narrative interviews</li>
            <li>Dedicated support for complex family histories</li>
          </ul>
        </div>
      </section>
    </>
  )
}
