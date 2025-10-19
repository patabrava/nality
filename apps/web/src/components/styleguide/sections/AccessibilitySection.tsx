'use client'

export default function AccessibilitySection() {
  return (
    <section id="accessibility" className="styleguide-section">
      <div className="section-header">
        <h1 className="section-title">Accessibility</h1>
        <p className="section-subtitle">
          Inclusive design patterns that ensure our application is usable by everyone, regardless of ability
        </p>
      </div>

      {/* WCAG Guidelines */}
      <div className="accessibility-category">
        <h2 className="category-title">WCAG 2.1 AA Compliance</h2>
        <div className="wcag-principles">
          <div className="principle-card">
            <div className="principle-icon">👁️</div>
            <h3>Perceivable</h3>
            <p>Information must be presentable in ways users can perceive</p>
            <ul>
              <li>Sufficient color contrast (4.5:1 minimum)</li>
              <li>Text alternatives for images</li>
              <li>Captions for videos</li>
              <li>Resizable text up to 200%</li>
            </ul>
          </div>

          <div className="principle-card">
            <div className="principle-icon">⌨️</div>
            <h3>Operable</h3>
            <p>Interface components must be operable by all users</p>
            <ul>
              <li>Full keyboard navigation</li>
              <li>No seizure-inducing content</li>
              <li>Sufficient time limits</li>
              <li>Clear navigation and orientation</li>
            </ul>
          </div>

          <div className="principle-card">
            <div className="principle-icon">🧠</div>
            <h3>Understandable</h3>
            <p>Information and UI operation must be understandable</p>
            <ul>
              <li>Readable and predictable content</li>
              <li>Consistent navigation patterns</li>
              <li>Clear error identification</li>
              <li>Help and documentation</li>
            </ul>
          </div>

          <div className="principle-card">
            <div className="principle-icon">🔧</div>
            <h3>Robust</h3>
            <p>Content must be robust enough for various assistive technologies</p>
            <ul>
              <li>Valid semantic HTML</li>
              <li>Compatible with screen readers</li>
              <li>Progressive enhancement</li>
              <li>Standards compliance</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Color Contrast */}
      <div className="accessibility-category">
        <h2 className="category-title">Color & Contrast</h2>
        <div className="contrast-examples">
          <div className="contrast-demo">
            <h3>Text Contrast Ratios</h3>
            <div className="contrast-grid">
              <div className="contrast-item good">
                <div className="contrast-swatch">
                  <span className="contrast-text">AA Compliant</span>
                </div>
                <div className="contrast-info">
                  <span className="contrast-ratio">4.5:1</span>
                  <span className="contrast-label">Normal Text</span>
                </div>
              </div>

              <div className="contrast-item excellent">
                <div className="contrast-swatch">
                  <span className="contrast-text large">AAA Compliant</span>
                </div>
                <div className="contrast-info">
                  <span className="contrast-ratio">7:1</span>
                  <span className="contrast-label">Enhanced Text</span>
                </div>
              </div>

              <div className="contrast-item poor">
                <div className="contrast-swatch">
                  <span className="contrast-text">Poor Contrast</span>
                </div>
                <div className="contrast-info">
                  <span className="contrast-ratio">2.1:1</span>
                  <span className="contrast-label">Fails AA</span>
                </div>
              </div>
            </div>
          </div>

          <div className="contrast-demo">
            <h3>Color Independence</h3>
            <div className="color-independence">
              <div className="bad-example">
                <h4>❌ Bad: Color Only</h4>
                <div className="form-group">
                  <input type="text" className="error-color-only" />
                  <span className="error-text-red">Error: This field is required</span>
                </div>
              </div>

              <div className="good-example">
                <h4>✅ Good: Color + Icon + Text</h4>
                <div className="form-group">
                  <input type="text" className="error-accessible" />
                  <span className="error-text-accessible">
                    <span className="error-icon">⚠️</span>
                    Error: This field is required
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard Navigation */}
      <div className="accessibility-category">
        <h2 className="category-title">Keyboard Navigation</h2>
        <div className="keyboard-examples">
          <div className="keyboard-demo">
            <h3>Focus Management</h3>
            <div className="focus-examples">
              <button className="focus-button">Tab to focus</button>
              <button className="focus-button">Next focusable</button>
              <a href="#" className="focus-link">Focusable link</a>
              <input type="text" className="focus-input" placeholder="Focusable input" />
              <select className="focus-select">
                <option>Focusable select</option>
                <option>Option 2</option>
              </select>
            </div>
          </div>

          <div className="keyboard-demo">
            <h3>Skip Links</h3>
            <div className="skip-link-demo">
              <a href="#main-content" className="skip-link">Skip to main content</a>
              <nav className="demo-nav">
                <a href="#">Home</a>
                <a href="#">About</a>
                <a href="#">Contact</a>
              </nav>
              <main id="main-content" className="demo-main">
                <h4>Main Content</h4>
                <p>Skip links allow keyboard users to bypass repetitive navigation.</p>
              </main>
            </div>
          </div>

          <div className="keyboard-demo">
            <h3>Keyboard Shortcuts</h3>
            <div className="shortcuts-list">
              <div className="shortcut-item">
                <kbd>Tab</kbd>
                <span>Navigate forward through focusable elements</span>
              </div>
              <div className="shortcut-item">
                <kbd>Shift</kbd> + <kbd>Tab</kbd>
                <span>Navigate backward through focusable elements</span>
              </div>
              <div className="shortcut-item">
                <kbd>Enter</kbd> / <kbd>Space</kbd>
                <span>Activate buttons and links</span>
              </div>
              <div className="shortcut-item">
                <kbd>Esc</kbd>
                <span>Close modals and dropdown menus</span>
              </div>
              <div className="shortcut-item">
                <kbd>Arrow Keys</kbd>
                <span>Navigate within component groups</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Screen Reader Support */}
      <div className="accessibility-category">
        <h2 className="category-title">Screen Reader Support</h2>
        <div className="screen-reader-examples">
          <div className="sr-demo">
            <h3>Semantic HTML</h3>
            <div className="semantic-example">
              <article className="article-example">
                <header>
                  <h4>Article Title</h4>
                  <p className="article-meta">Published on <time dateTime="2024-01-15">January 15, 2024</time></p>
                </header>
                <main>
                  <p>This article uses proper semantic HTML elements for better screen reader navigation.</p>
                </main>
                <footer>
                  <p>Tags: <span className="tag">accessibility</span>, <span className="tag">design</span></p>
                </footer>
              </article>
            </div>
          </div>

          <div className="sr-demo">
            <h3>ARIA Labels & Descriptions</h3>
            <div className="aria-examples">
              <div className="aria-example">
                <label htmlFor="search-input">Search</label>
                <input 
                  type="search" 
                  id="search-input"
                  aria-describedby="search-help"
                  placeholder="Enter search terms..."
                />
                <div id="search-help" className="help-text">
                  Search across all life events and memories
                </div>
              </div>

              <div className="aria-example">
                <button 
                  aria-label="Close dialog"
                  aria-describedby="close-description"
                  className="close-button"
                >
                  ✕
                </button>
                <div id="close-description" className="sr-only">
                  Closes the current dialog and returns to the previous page
                </div>
              </div>

              <div className="aria-example">
                <div role="status" aria-live="polite" className="status-message">
                  <span className="sr-only">Status update: </span>
                  Your changes have been saved automatically
                </div>
              </div>
            </div>
          </div>

          <div className="sr-demo">
            <h3>Screen Reader Only Content</h3>
            <div className="sr-only-examples">
              <div className="example-item">
                <h4>Hidden Context</h4>
                <button className="icon-button">
                  <span className="sr-only">Delete item</span>
                  🗑️
                </button>
              </div>

              <div className="example-item">
                <h4>Progress Indication</h4>
                <div className="progress-bar" role="progressbar" aria-valuenow={60} aria-valuemin={0} aria-valuemax={100}>
                  <div className="progress-fill" style={{ width: '60%' }}></div>
                  <span className="sr-only">60% complete</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Accessibility */}
      <div className="accessibility-category">
        <h2 className="category-title">Form Accessibility</h2>
        <div className="form-a11y-examples">
          <div className="form-demo">
            <h3>Accessible Form Example</h3>
            <form className="accessible-form">
              <fieldset>
                <legend>Personal Information</legend>
                
                <div className="form-group">
                  <label htmlFor="full-name">
                    Full Name <span className="required" aria-label="required">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="full-name" 
                    required 
                    aria-describedby="name-help name-error"
                  />
                  <div id="name-help" className="help-text">
                    Enter your first and last name
                  </div>
                  <div id="name-error" className="error-text" role="alert">
                    This field is required
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email-address">Email Address</label>
                  <input 
                    type="email" 
                    id="email-address" 
                    aria-describedby="email-help"
                    placeholder="your@email.com"
                  />
                  <div id="email-help" className="help-text">
                    We'll use this to send you important updates
                  </div>
                </div>

                <fieldset className="radio-group">
                  <legend>Preferred Contact Method</legend>
                  <div className="radio-option">
                    <input type="radio" id="contact-email" name="contact" value="email" />
                    <label htmlFor="contact-email">Email</label>
                  </div>
                  <div className="radio-option">
                    <input type="radio" id="contact-phone" name="contact" value="phone" />
                    <label htmlFor="contact-phone">Phone</label>
                  </div>
                  <div className="radio-option">
                    <input type="radio" id="contact-both" name="contact" value="both" />
                    <label htmlFor="contact-both">Both</label>
                  </div>
                </fieldset>
              </fieldset>

              <button type="submit" className="submit-button">
                Submit Form
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Testing Tools */}
      <div className="accessibility-category">
        <h2 className="category-title">Testing & Validation</h2>
        <div className="testing-info">
          <div className="testing-tools">
            <h3>Recommended Testing Tools</h3>
            <div className="tools-grid">
              <div className="tool-card">
                <h4>Automated Testing</h4>
                <ul>
                  <li>axe DevTools browser extension</li>
                  <li>WAVE Web Accessibility Evaluator</li>
                  <li>Lighthouse accessibility audit</li>
                  <li>Pa11y command line tool</li>
                </ul>
              </div>

              <div className="tool-card">
                <h4>Manual Testing</h4>
                <ul>
                  <li>Keyboard-only navigation</li>
                  <li>Screen reader testing (NVDA, JAWS, VoiceOver)</li>
                  <li>High contrast mode</li>
                  <li>Text scaling to 200%</li>
                </ul>
              </div>

              <div className="tool-card">
                <h4>User Testing</h4>
                <ul>
                  <li>Testing with disabled users</li>
                  <li>Usability studies with assistive technology</li>
                  <li>Feedback from accessibility communities</li>
                  <li>Regular accessibility reviews</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="checklist">
            <h3>Accessibility Checklist</h3>
            <div className="checklist-items">
              <label className="checklist-item">
                <input type="checkbox" defaultChecked />
                <span className="checkmark">✓</span>
                All images have descriptive alt text
              </label>
              <label className="checklist-item">
                <input type="checkbox" defaultChecked />
                <span className="checkmark">✓</span>
                Color contrast meets WCAG AA standards
              </label>
              <label className="checklist-item">
                <input type="checkbox" defaultChecked />
                <span className="checkmark">✓</span>
                All interactive elements are keyboard accessible
              </label>
              <label className="checklist-item">
                <input type="checkbox" defaultChecked />
                <span className="checkmark">✓</span>
                Form inputs have associated labels
              </label>
              <label className="checklist-item">
                <input type="checkbox" defaultChecked />
                <span className="checkmark">✓</span>
                Focus indicators are visible and clear
              </label>
              <label className="checklist-item">
                <input type="checkbox" defaultChecked />
                <span className="checkmark">✓</span>
                Page structure uses semantic HTML
              </label>
              <label className="checklist-item">
                <input type="checkbox" defaultChecked />
                <span className="checkmark">✓</span>
                Error messages are descriptive and helpful
              </label>
              <label className="checklist-item">
                <input type="checkbox" defaultChecked />
                <span className="checkmark">✓</span>
                Skip links are provided for navigation
              </label>
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

        .accessibility-category {
          margin-bottom: 64px;
        }

        .category-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 32px;
        }

        /* WCAG Principles */
        .wcag-principles {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }

        .principle-card {
          background: var(--md-sys-color-surface-container);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .principle-icon {
          font-size: 2rem;
          margin-bottom: 12px;
        }

        .principle-card h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 8px;
        }

        .principle-card p {
          font-size: 0.875rem;
          color: var(--md-sys-color-on-surface-variant);
          margin-bottom: 16px;
        }

        .principle-card ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .principle-card li {
          font-size: 0.75rem;
          color: var(--md-sys-color-on-surface-variant);
          margin-bottom: 4px;
          padding-left: 16px;
          position: relative;
        }

        .principle-card li::before {
          content: '•';
          color: var(--md-sys-color-primary);
          position: absolute;
          left: 0;
        }

        /* Contrast Examples */
        .contrast-examples {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 32px;
        }

        .contrast-demo {
          background: var(--md-sys-color-surface-container);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .contrast-demo h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 20px;
        }

        .contrast-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .contrast-item {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .contrast-swatch {
          width: 120px;
          height: 60px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .contrast-item.good .contrast-swatch {
          background: #ffffff;
          color: #6b7280;
        }

        .contrast-item.excellent .contrast-swatch {
          background: #ffffff;
          color: #374151;
        }

        .contrast-item.poor .contrast-swatch {
          background: #f3f4f6;
          color: #d1d5db;
        }

        .contrast-text {
          font-size: 0.875rem;
          font-weight: 500;
        }

        .contrast-text.large {
          font-size: 1.125rem;
        }

        .contrast-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .contrast-ratio {
          font-size: 1rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          font-family: 'Roboto Mono', monospace;
        }

        .contrast-label {
          font-size: 0.75rem;
          color: var(--md-sys-color-on-surface-variant);
        }

        .color-independence {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .bad-example,
        .good-example {
          padding: 16px;
          border-radius: 8px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .bad-example {
          background: rgba(239, 68, 68, 0.1);
        }

        .good-example {
          background: rgba(34, 197, 94, 0.1);
        }

        .bad-example h4,
        .good-example h4 {
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .error-color-only {
          border: 2px solid #ef4444;
          padding: 8px;
          border-radius: 4px;
          width: 100%;
          margin-bottom: 4px;
        }

        .error-accessible {
          border: 2px solid #ef4444;
          padding: 8px;
          border-radius: 4px;
          width: 100%;
          margin-bottom: 4px;
          background-image: url("data:image/svg+xml,%3csvg width='12' height='12' fill='%23ef4444' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M6 0a6 6 0 100 12A6 6 0 006 0zM5 3h2v5H5V3zm0 6h2v2H5V9z'/%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 8px center;
          padding-right: 28px;
        }

        .error-text-red {
          color: #ef4444;
          font-size: 0.75rem;
        }

        .error-text-accessible {
          color: #ef4444;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .error-icon {
          font-size: 0.875rem;
        }

        /* Keyboard Navigation */
        .keyboard-examples {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 32px;
        }

        .keyboard-demo {
          background: var(--md-sys-color-surface-container);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .keyboard-demo h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 20px;
        }

        .focus-examples {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .focus-button,
        .focus-input,
        .focus-select {
          padding: 8px 12px;
          border: 1px solid var(--md-sys-color-outline);
          border-radius: 6px;
          background: var(--md-sys-color-surface);
          color: var(--md-sys-color-on-surface);
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }

        .focus-button {
          cursor: pointer;
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
          border-color: var(--md-sys-color-primary);
        }

        .focus-link {
          color: var(--md-sys-color-primary);
          text-decoration: underline;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .focus-button:focus,
        .focus-input:focus,
        .focus-select:focus,
        .focus-link:focus {
          outline: 2px solid var(--md-sys-color-primary);
          outline-offset: 2px;
        }

        .skip-link-demo {
          position: relative;
        }

        .skip-link {
          position: absolute;
          top: -40px;
          left: 6px;
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
          padding: 8px;
          text-decoration: none;
          border-radius: 4px;
          font-size: 0.875rem;
          z-index: 100;
          transition: top 0.3s ease;
        }

        .skip-link:focus {
          top: 6px;
        }

        .demo-nav {
          background: var(--md-sys-color-surface-container-high);
          padding: 16px;
          border-radius: 8px;
          margin: 20px 0;
          display: flex;
          gap: 16px;
        }

        .demo-nav a {
          color: var(--md-sys-color-on-surface);
          text-decoration: none;
          padding: 4px 8px;
        }

        .demo-main {
          background: var(--md-sys-color-surface);
          padding: 20px;
          border-radius: 8px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .demo-main h4 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 8px;
        }

        .demo-main p {
          font-size: 0.875rem;
          color: var(--md-sys-color-on-surface-variant);
          margin: 0;
        }

        .shortcuts-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .shortcut-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 8px;
          background: var(--md-sys-color-surface);
          border-radius: 6px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        kbd {
          background: var(--md-sys-color-surface-container-high);
          color: var(--md-sys-color-on-surface);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-family: 'Roboto Mono', monospace;
          border: 1px solid var(--md-sys-color-outline);
        }

        .shortcut-item span {
          font-size: 0.875rem;
          color: var(--md-sys-color-on-surface-variant);
        }

        /* Screen Reader */
        .screen-reader-examples {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 32px;
        }

        .sr-demo {
          background: var(--md-sys-color-surface-container);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .sr-demo h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 20px;
        }

        .semantic-example {
          background: var(--md-sys-color-surface);
          border-radius: 8px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .article-example {
          padding: 16px;
        }

        .article-example header {
          margin-bottom: 12px;
        }

        .article-example h4 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 4px;
        }

        .article-meta {
          font-size: 0.75rem;
          color: var(--md-sys-color-on-surface-variant);
          margin: 0;
        }

        .article-example main p {
          font-size: 0.875rem;
          color: var(--md-sys-color-on-surface-variant);
          line-height: 1.5;
          margin: 0 0 12px 0;
        }

        .article-example footer {
          border-top: 1px solid var(--md-sys-color-outline-variant);
          padding-top: 12px;
        }

        .tag {
          background: var(--md-sys-color-primary-container);
          color: var(--md-sys-color-on-primary-container);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.625rem;
          margin-right: 4px;
        }

        .aria-examples {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .aria-example {
          background: var(--md-sys-color-surface);
          padding: 16px;
          border-radius: 8px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .aria-example label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 8px;
        }

        .aria-example input {
          width: 100%;
          padding: 8px;
          border: 1px solid var(--md-sys-color-outline);
          border-radius: 4px;
          font-size: 0.875rem;
        }

        .help-text {
          font-size: 0.75rem;
          color: var(--md-sys-color-on-surface-variant);
          margin-top: 4px;
        }

        .close-button {
          background: var(--md-sys-color-error);
          color: var(--md-sys-color-on-error);
          border: none;
          padding: 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
        }

        .status-message {
          background: var(--md-sys-color-primary-container);
          color: var(--md-sys-color-on-primary-container);
          padding: 12px;
          border-radius: 6px;
          font-size: 0.875rem;
        }

        .sr-only {
          position: absolute;
          left: -10000px;
          width: 1px;
          height: 1px;
          overflow: hidden;
        }

        .sr-only-examples {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .example-item {
          background: var(--md-sys-color-surface);
          padding: 16px;
          border-radius: 8px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .example-item h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 8px;
        }

        .icon-button {
          background: var(--md-sys-color-surface-container);
          border: 1px solid var(--md-sys-color-outline);
          padding: 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: var(--md-sys-color-outline-variant);
          border-radius: 4px;
          overflow: hidden;
          position: relative;
        }

        .progress-fill {
          height: 100%;
          background: var(--md-sys-color-primary);
          transition: width 0.3s ease;
        }

        /* Form Accessibility */
        .form-a11y-examples {
          background: var(--md-sys-color-surface-container);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .form-demo h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 20px;
        }

        .accessible-form {
          background: var(--md-sys-color-surface);
          padding: 24px;
          border-radius: 8px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .accessible-form fieldset {
          border: 1px solid var(--md-sys-color-outline);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 20px;
        }

        .accessible-form legend {
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          padding: 0 8px;
        }

        .accessible-form .form-group {
          margin-bottom: 16px;
        }

        .accessible-form label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 4px;
        }

        .required {
          color: #ef4444;
        }

        .accessible-form input {
          width: 100%;
          padding: 8px;
          border: 1px solid var(--md-sys-color-outline);
          border-radius: 4px;
          font-size: 0.875rem;
        }

        .accessible-form input:focus {
          outline: 2px solid var(--md-sys-color-primary);
          outline-offset: 1px;
        }

        .error-text {
          color: #ef4444;
          font-size: 0.75rem;
          margin-top: 4px;
        }

        .radio-group {
          border: 1px solid var(--md-sys-color-outline);
          border-radius: 8px;
          padding: 16px;
          margin-top: 16px;
        }

        .radio-option {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .radio-option input {
          width: auto;
          margin: 0;
        }

        .radio-option label {
          margin: 0;
          cursor: pointer;
        }

        .submit-button {
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          margin-top: 16px;
        }

        /* Testing Tools */
        .testing-info {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 32px;
        }

        .testing-tools {
          background: var(--md-sys-color-surface-container);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .testing-tools h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 20px;
        }

        .tools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .tool-card {
          background: var(--md-sys-color-surface);
          padding: 16px;
          border-radius: 8px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .tool-card h4 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 12px;
        }

        .tool-card ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .tool-card li {
          font-size: 0.75rem;
          color: var(--md-sys-color-on-surface-variant);
          margin-bottom: 4px;
          padding-left: 12px;
          position: relative;
        }

        .tool-card li::before {
          content: '•';
          color: var(--md-sys-color-primary);
          position: absolute;
          left: 0;
        }

        .checklist {
          background: var(--md-sys-color-surface-container);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .checklist h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 20px;
        }

        .checklist-items {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .checklist-item {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 0.875rem;
          color: var(--md-sys-color-on-surface);
        }

        .checklist-item input {
          margin: 0;
          width: 16px;
          height: 16px;
        }

        .checkmark {
          color: var(--md-sys-color-primary);
          font-weight: bold;
        }

        @media (max-width: 768px) {
          .wcag-principles {
            grid-template-columns: 1fr;
          }
          
          .contrast-examples,
          .keyboard-examples,
          .screen-reader-examples {
            grid-template-columns: 1fr;
          }
          
          .testing-info {
            grid-template-columns: 1fr;
          }
          
          .tools-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  )
}
