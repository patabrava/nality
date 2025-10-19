'use client'

export default function FormsSection() {
  return (
    <section id="forms" className="styleguide-section">
      <div className="section-header">
        <h1 className="section-title">Forms</h1>
        <p className="section-subtitle">
          Accessible and user-friendly form patterns for data collection and user input
        </p>
      </div>

      {/* Form Layout Examples */}
      <div className="form-layouts">
        <h2 className="subsection-title">Form Layouts</h2>
        
        <div className="layout-examples">
          <div className="layout-example">
            <h3>Single Column</h3>
            <form className="form-single-column">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input type="text" id="name" placeholder="Enter your full name" />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" placeholder="your@email.com" />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea id="message" rows={4} placeholder="Your message here..."></textarea>
              </div>
              <button type="submit" className="btn-primary">Submit</button>
            </form>
          </div>

          <div className="layout-example">
            <h3>Two Column</h3>
            <form className="form-two-column">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input type="text" id="firstName" placeholder="First name" />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input type="text" id="lastName" placeholder="Last name" />
                </div>
              </div>
              <div className="form-group span-full">
                <label htmlFor="company">Company</label>
                <input type="text" id="company" placeholder="Company name" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input type="tel" id="phone" placeholder="(555) 123-4567" />
                </div>
                <div className="form-group">
                  <label htmlFor="role">Role</label>
                  <select id="role">
                    <option>Select role</option>
                    <option>Developer</option>
                    <option>Designer</option>
                    <option>Manager</option>
                  </select>
                </div>
              </div>
              <div className="form-actions span-full">
                <button type="submit" className="btn-primary">Create Account</button>
                <button type="button" className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Form States */}
      <div className="form-states">
        <h2 className="subsection-title">Form States</h2>
        <div className="states-examples">
          <div className="state-group">
            <h3>Default State</h3>
            <div className="form-group">
              <label>Default Input</label>
              <input type="text" placeholder="Enter text" />
            </div>
          </div>

          <div className="state-group">
            <h3>Focus State</h3>
            <div className="form-group">
              <label>Focused Input</label>
              <input type="text" className="focused" value="Focused input" readOnly />
            </div>
          </div>

          <div className="state-group">
            <h3>Error State</h3>
            <div className="form-group error">
              <label>Error Input</label>
              <input type="text" className="error" value="Invalid input" readOnly />
              <span className="error-message">This field is required</span>
            </div>
          </div>

          <div className="state-group">
            <h3>Success State</h3>
            <div className="form-group success">
              <label>Success Input</label>
              <input type="text" className="success" value="Valid input" readOnly />
              <span className="success-message">Looks good!</span>
            </div>
          </div>

          <div className="state-group">
            <h3>Disabled State</h3>
            <div className="form-group">
              <label>Disabled Input</label>
              <input type="text" disabled value="Disabled input" />
            </div>
          </div>
        </div>
      </div>

      {/* Form Validation */}
      <div className="form-validation">
        <h2 className="subsection-title">Form Validation</h2>
        <div className="validation-example">
          <form className="validation-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input type="text" id="username" placeholder="Enter username" />
              <div className="field-help">Must be 3-20 characters, letters and numbers only</div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" placeholder="Enter password" />
              <div className="password-requirements">
                <div className="requirement">✓ At least 8 characters</div>
                <div className="requirement incomplete">○ One uppercase letter</div>
                <div className="requirement">✓ One number</div>
                <div className="requirement incomplete">○ One special character</div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input type="password" id="confirmPassword" placeholder="Confirm password" />
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span className="checkmark"></span>
                I agree to the Terms of Service and Privacy Policy
              </label>
            </div>

            <button type="submit" className="btn-primary">Create Account</button>
          </form>
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

        .form-layouts,
        .form-states,
        .form-validation {
          margin-bottom: 64px;
        }

        .subsection-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 32px;
        }

        .layout-examples {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 32px;
        }

        .layout-example {
          background: var(--md-sys-color-surface-container);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .layout-example h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 20px;
        }

        .form-single-column {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-two-column {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-row {
          display: contents;
        }

        .span-full {
          grid-column: 1 / -1;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--md-sys-color-on-surface);
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 12px;
          border: 1px solid var(--md-sys-color-outline);
          border-radius: 8px;
          background: var(--md-sys-color-surface);
          color: var(--md-sys-color-on-surface);
          font-size: 1rem;
          transition: all var(--md-sys-motion-duration-short1) var(--md-sys-motion-easing-standard);
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus,
        .form-group input.focused {
          outline: none;
          border-color: var(--md-sys-color-primary);
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
        }

        .form-group.error input,
        .form-group input.error {
          border-color: #ef4444;
        }

        .form-group.success input,
        .form-group input.success {
          border-color: #22c55e;
        }

        .form-group input:disabled {
          opacity: 0.5;
          background: var(--md-sys-color-surface-container);
          cursor: not-allowed;
        }

        .btn-primary {
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--md-sys-motion-duration-short1) var(--md-sys-motion-easing-standard);
        }

        .btn-primary:hover {
          opacity: 0.9;
        }

        .btn-secondary {
          background: transparent;
          color: var(--md-sys-color-on-surface-variant);
          border: 1px solid var(--md-sys-color-outline);
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--md-sys-motion-duration-short1) var(--md-sys-motion-easing-standard);
        }

        .btn-secondary:hover {
          background: var(--md-sys-color-surface-container);
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }

        .states-examples {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px;
        }

        .state-group {
          background: var(--md-sys-color-surface-container);
          border-radius: 12px;
          padding: 20px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .state-group h3 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 16px;
        }

        .error-message {
          font-size: 0.75rem;
          color: #ef4444;
        }

        .success-message {
          font-size: 0.75rem;
          color: #22c55e;
        }

        .validation-example {
          background: var(--md-sys-color-surface-container);
          border-radius: 12px;
          padding: 32px;
          border: 1px solid var(--md-sys-color-outline-variant);
          max-width: 500px;
        }

        .validation-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .field-help {
          font-size: 0.75rem;
          color: var(--md-sys-color-on-surface-variant);
          line-height: 1.4;
        }

        .password-requirements {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 8px;
        }

        .requirement {
          font-size: 0.75rem;
          color: #22c55e;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .requirement.incomplete {
          color: var(--md-sys-color-on-surface-variant);
        }

        .checkbox-group {
          margin-top: 8px;
        }

        .checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 0.875rem;
          color: var(--md-sys-color-on-surface);
          cursor: pointer;
          line-height: 1.4;
        }

        .checkbox-label input {
          width: 16px;
          height: 16px;
          margin: 0;
          margin-top: 2px;
        }

        @media (max-width: 768px) {
          .layout-examples {
            grid-template-columns: 1fr;
          }
          
          .form-two-column {
            grid-template-columns: 1fr;
          }
          
          .states-examples {
            grid-template-columns: 1fr;
          }
          
          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </section>
  )
}
