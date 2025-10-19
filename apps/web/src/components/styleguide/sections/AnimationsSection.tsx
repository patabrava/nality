'use client'

export default function AnimationsSection() {
  return (
    <section id="animations" className="styleguide-section">
      <div className="section-header">
        <h1 className="section-title">Animations</h1>
        <p className="section-subtitle">
          Purposeful motion that enhances user experience through smooth, meaningful transitions
        </p>
      </div>

      {/* Animation Principles */}
      <div className="animation-category">
        <h2 className="category-title">Animation Principles</h2>
        <div className="principles-grid">
          <div className="principle-card">
            <h3>Purposeful</h3>
            <p>Every animation serves a function - guiding attention, providing feedback, or showing relationships.</p>
          </div>
          <div className="principle-card">
            <h3>Responsive</h3>
            <p>Animations feel immediate and responsive to user input, never blocking or slowing down interactions.</p>
          </div>
          <div className="principle-card">
            <h3>Natural</h3>
            <p>Motion follows real-world physics with appropriate easing and timing that feels organic.</p>
          </div>
          <div className="principle-card">
            <h3>Accessible</h3>
            <p>Respects user preferences for reduced motion and provides alternative ways to convey information.</p>
          </div>
        </div>
      </div>

      {/* Timing & Easing */}
      <div className="animation-category">
        <h2 className="category-title">Timing & Easing</h2>
        <div className="timing-examples">
          <div className="timing-demo">
            <h3>Duration Guidelines</h3>
            <div className="duration-list">
              <div className="duration-item">
                <span className="duration-label">Short (150ms)</span>
                <span className="duration-usage">Simple transitions, hover states</span>
                <div className="duration-demo short"></div>
              </div>
              <div className="duration-item">
                <span className="duration-label">Medium (300ms)</span>
                <span className="duration-usage">Component transitions, modal appearances</span>
                <div className="duration-demo medium"></div>
              </div>
              <div className="duration-item">
                <span className="duration-label">Long (500ms)</span>
                <span className="duration-usage">Page transitions, complex animations</span>
                <div className="duration-demo long"></div>
              </div>
            </div>
          </div>

          <div className="easing-demo">
            <h3>Easing Functions</h3>
            <div className="easing-list">
              <div className="easing-item">
                <span className="easing-label">Ease Out</span>
                <span className="easing-usage">Entering animations</span>
                <div className="easing-demo-box ease-out"></div>
              </div>
              <div className="easing-item">
                <span className="easing-label">Ease In</span>
                <span className="easing-usage">Exiting animations</span>
                <div className="easing-demo-box ease-in"></div>
              </div>
              <div className="easing-item">
                <span className="easing-label">Ease In Out</span>
                <span className="easing-usage">State changes</span>
                <div className="easing-demo-box ease-in-out"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interaction Animations */}
      <div className="animation-category">
        <h2 className="category-title">Interaction Animations</h2>
        <div className="interaction-examples">
          <div className="interaction-demo">
            <h3>Hover Effects</h3>
            <div className="hover-examples">
              <button className="hover-button lift">Lift on Hover</button>
              <button className="hover-button scale">Scale on Hover</button>
              <button className="hover-button glow">Glow on Hover</button>
              <div className="hover-card">
                <h4>Interactive Card</h4>
                <p>Hover me to see the effect</p>
              </div>
            </div>
          </div>

          <div className="interaction-demo">
            <h3>Click Feedback</h3>
            <div className="click-examples">
              <button className="click-button ripple">Ripple Effect</button>
              <button className="click-button press">Press Down</button>
              <button className="click-button bounce">Bounce</button>
            </div>
          </div>

          <div className="interaction-demo">
            <h3>Loading States</h3>
            <div className="loading-examples">
              <div className="loading-spinner"></div>
              <div className="loading-dots">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
              <div className="loading-bar">
                <div className="progress"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page Transitions */}
      <div className="animation-category">
        <h2 className="category-title">Page Transitions</h2>
        <div className="transition-examples">
          <div className="transition-demo">
            <h3>Slide Transitions</h3>
            <div className="slide-demo">
              <button className="slide-trigger" onClick={() => {}}>
                Trigger Slide
              </button>
              <div className="slide-container">
                <div className="slide-content">Content slides in from right</div>
              </div>
            </div>
          </div>

          <div className="transition-demo">
            <h3>Fade Transitions</h3>
            <div className="fade-demo">
              <button className="fade-trigger" onClick={() => {}}>
                Trigger Fade
              </button>
              <div className="fade-container">
                <div className="fade-content">Content fades in smoothly</div>
              </div>
            </div>
          </div>

          <div className="transition-demo">
            <h3>Scale Transitions</h3>
            <div className="scale-demo">
              <button className="scale-trigger" onClick={() => {}}>
                Trigger Scale
              </button>
              <div className="scale-container">
                <div className="scale-content">Content scales up from center</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Micro-interactions */}
      <div className="animation-category">
        <h2 className="category-title">Micro-interactions</h2>
        <div className="micro-examples">
          <div className="micro-demo">
            <h3>Form Interactions</h3>
            <div className="form-animations">
              <div className="animated-input">
                <input type="text" placeholder=" " />
                <label>Floating Label</label>
              </div>
              <div className="checkbox-animation">
                <input type="checkbox" id="animated-checkbox" />
                <label htmlFor="animated-checkbox">Animated Checkbox</label>
              </div>
              <div className="toggle-animation">
                <input type="checkbox" id="animated-toggle" />
                <label htmlFor="animated-toggle">Animated Toggle</label>
              </div>
            </div>
          </div>

          <div className="micro-demo">
            <h3>Navigation Animations</h3>
            <div className="nav-animations">
              <button className="hamburger-menu">
                <span></span>
                <span></span>
                <span></span>
              </button>
              <div className="tab-indicator">
                <div className="tab-nav">
                  <button className="tab active">Tab 1</button>
                  <button className="tab">Tab 2</button>
                  <button className="tab">Tab 3</button>
                </div>
                <div className="indicator"></div>
              </div>
            </div>
          </div>

          <div className="micro-demo">
            <h3>Status Animations</h3>
            <div className="status-animations">
              <div className="success-animation">
                <div className="checkmark">✓</div>
                <span>Success!</span>
              </div>
              <div className="error-animation">
                <div className="error-icon">✗</div>
                <span>Error occurred</span>
              </div>
              <div className="notification-animation">
                <div className="notification-icon">🔔</div>
                <span>New notification</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .styleguide-section {
          margin-bottom: 80px;
        }

        .section-header {
          text-align: center;
          margin-bottom: 64px;
        }

        .section-title {
          font-size: clamp(2.5rem, 5vw, 3.5rem);
          font-weight: 700;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 16px;
          letter-spacing: -0.02em;
        }

        .section-subtitle {
          font-size: 1.25rem;
          color: var(--md-sys-color-on-surface-variant);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.5;
        }

        .animation-category {
          margin-bottom: 64px;
        }

        .category-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 32px;
        }

        /* Animation Principles */
        .principles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
        }

        .principle-card {
          background: var(--md-sys-color-surface-container);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid var(--md-sys-color-outline-variant);
          text-align: center;
        }

        .principle-card h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 12px;
        }

        .principle-card p {
          font-size: 0.875rem;
          color: var(--md-sys-color-on-surface-variant);
          line-height: 1.5;
        }

        /* Timing Examples */
        .timing-examples {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }

        .timing-demo,
        .easing-demo {
          background: var(--md-sys-color-surface-container);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .timing-demo h3,
        .easing-demo h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 20px;
        }

        .duration-list,
        .easing-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .duration-item,
        .easing-item {
          display: grid;
          grid-template-columns: 1fr 1fr auto;
          gap: 12px;
          align-items: center;
        }

        .duration-label,
        .easing-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--md-sys-color-on-surface);
        }

        .duration-usage,
        .easing-usage {
          font-size: 0.75rem;
          color: var(--md-sys-color-on-surface-variant);
        }

        .duration-demo {
          width: 40px;
          height: 20px;
          background: var(--md-sys-color-primary);
          border-radius: 4px;
          animation: slide 2s ease-in-out infinite;
        }

        .duration-demo.short {
          animation-duration: 0.15s;
        }

        .duration-demo.medium {
          animation-duration: 0.3s;
        }

        .duration-demo.long {
          animation-duration: 0.5s;
        }

        .easing-demo-box {
          width: 40px;
          height: 20px;
          background: var(--md-sys-color-primary);
          border-radius: 4px;
          animation: slide 2s infinite;
        }

        .easing-demo-box.ease-out {
          animation-timing-function: ease-out;
        }

        .easing-demo-box.ease-in {
          animation-timing-function: ease-in;
        }

        .easing-demo-box.ease-in-out {
          animation-timing-function: ease-in-out;
        }

        @keyframes slide {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(20px); }
        }

        /* Interaction Examples */
        .interaction-examples {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 32px;
        }

        .interaction-demo {
          background: var(--md-sys-color-surface-container);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .interaction-demo h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 20px;
        }

        .hover-examples {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }

        .hover-button {
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .hover-button.lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }

        .hover-button.scale:hover {
          transform: scale(1.05);
        }

        .hover-button.glow:hover {
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
        }

        .hover-card {
          background: var(--md-sys-color-surface);
          border: 1px solid var(--md-sys-color-outline-variant);
          border-radius: 8px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
          margin-top: 16px;
        }

        .hover-card:hover {
          transform: translateY(-2px);
          border-color: var(--md-sys-color-primary);
        }

        .hover-card h4 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 8px;
        }

        .hover-card p {
          font-size: 0.875rem;
          color: var(--md-sys-color-on-surface-variant);
          margin: 0;
        }

        .click-examples {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }

        .click-button {
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .click-button.press:active {
          transform: scale(0.95);
        }

        .click-button.bounce:active {
          animation: bounce 0.3s ease;
        }

        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        /* Loading Examples */
        .loading-examples {
          display: flex;
          flex-wrap: wrap;
          gap: 24px;
          align-items: center;
        }

        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid var(--md-sys-color-outline-variant);
          border-top: 3px solid var(--md-sys-color-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-dots {
          display: flex;
          gap: 8px;
        }

        .dot {
          width: 8px;
          height: 8px;
          background: var(--md-sys-color-primary);
          border-radius: 50%;
          animation: pulse 1.4s ease-in-out infinite both;
        }

        .dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes pulse {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .loading-bar {
          width: 120px;
          height: 4px;
          background: var(--md-sys-color-outline-variant);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress {
          height: 100%;
          background: var(--md-sys-color-primary);
          animation: progress 2s ease-in-out infinite;
        }

        @keyframes progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }

        /* Transition Examples */
        .transition-examples {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
        }

        .transition-demo {
          background: var(--md-sys-color-surface-container);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .transition-demo h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 16px;
        }

        .slide-trigger,
        .fade-trigger,
        .scale-trigger {
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 0.875rem;
          cursor: pointer;
          margin-bottom: 16px;
        }

        /* Micro-interactions */
        .micro-examples {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 32px;
        }

        .micro-demo {
          background: var(--md-sys-color-surface-container);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .micro-demo h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 20px;
        }

        /* Form Animations */
        .form-animations {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .animated-input {
          position: relative;
        }

        .animated-input input {
          width: 100%;
          padding: 16px 12px 8px;
          border: 1px solid var(--md-sys-color-outline);
          border-radius: 8px;
          background: var(--md-sys-color-surface);
          color: var(--md-sys-color-on-surface);
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }

        .animated-input input:focus {
          outline: none;
          border-color: var(--md-sys-color-primary);
        }

        .animated-input label {
          position: absolute;
          left: 12px;
          top: 16px;
          font-size: 1rem;
          color: var(--md-sys-color-on-surface-variant);
          transition: all 0.3s ease;
          pointer-events: none;
        }

        .animated-input input:focus + label,
        .animated-input input:not(:placeholder-shown) + label {
          top: 4px;
          font-size: 0.75rem;
          color: var(--md-sys-color-primary);
        }

        .checkbox-animation,
        .toggle-animation {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .checkbox-animation input,
        .toggle-animation input {
          width: 20px;
          height: 20px;
          transition: all 0.3s ease;
        }

        .checkbox-animation label,
        .toggle-animation label {
          font-size: 0.875rem;
          color: var(--md-sys-color-on-surface);
          cursor: pointer;
        }

        /* Navigation Animations */
        .nav-animations {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .hamburger-menu {
          background: none;
          border: none;
          width: 40px;
          height: 40px;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          cursor: pointer;
          padding: 8px;
        }

        .hamburger-menu span {
          width: 100%;
          height: 2px;
          background: var(--md-sys-color-on-surface);
          transition: all 0.3s ease;
        }

        .hamburger-menu:hover span:nth-child(1) {
          transform: rotate(45deg) translate(6px, 6px);
        }

        .hamburger-menu:hover span:nth-child(2) {
          opacity: 0;
        }

        .hamburger-menu:hover span:nth-child(3) {
          transform: rotate(-45deg) translate(6px, -6px);
        }

        .tab-indicator {
          position: relative;
        }

        .tab-nav {
          display: flex;
          gap: 0;
          background: var(--md-sys-color-surface);
          border-radius: 8px;
          padding: 4px;
        }

        .tab {
          background: none;
          border: none;
          padding: 8px 16px;
          font-size: 0.875rem;
          color: var(--md-sys-color-on-surface-variant);
          cursor: pointer;
          border-radius: 6px;
          transition: color 0.3s ease;
          position: relative;
          z-index: 1;
        }

        .tab.active {
          color: var(--md-sys-color-on-primary);
        }

        .indicator {
          position: absolute;
          bottom: 4px;
          left: 4px;
          width: 60px;
          height: 32px;
          background: var(--md-sys-color-primary);
          border-radius: 6px;
          transition: transform 0.3s ease;
        }

        /* Status Animations */
        .status-animations {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .success-animation,
        .error-animation,
        .notification-animation {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
          animation: slideIn 0.5s ease-out;
        }

        .success-animation {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
        }

        .error-animation {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .notification-animation {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .checkmark,
        .error-icon,
        .notification-icon {
          font-size: 1.25rem;
          animation: bounce 0.5s ease 0.3s both;
        }

        @keyframes slideIn {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .timing-examples {
            grid-template-columns: 1fr;
          }
          
          .interaction-examples,
          .micro-examples {
            grid-template-columns: 1fr;
          }
          
          .transition-examples {
            grid-template-columns: 1fr;
          }
          
          .hover-examples,
          .click-examples,
          .loading-examples {
            justify-content: center;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </section>
  )
}
