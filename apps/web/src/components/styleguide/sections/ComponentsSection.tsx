'use client'

export default function ComponentsSection() {
  return (
    <section id="components" className="styleguide-section">
      <div className="section-header">
        <h1 className="section-title">Components</h1>
        <p className="section-subtitle">
          Reusable interface elements built with consistency and accessibility in mind
        </p>
      </div>

      {/* Buttons */}
      <div className="component-category">
        <h2 className="category-title">Buttons</h2>
        <div className="component-showcase">
          <div className="component-group">
            <h3>Primary Buttons</h3>
            <div className="button-examples">
              <button className="btn-primary">Primary</button>
              <button className="btn-primary" disabled>Disabled</button>
              <button className="btn-primary loading">
                <span className="loading-spinner"></span>
                Loading
              </button>
            </div>
          </div>
          
          <div className="component-group">
            <h3>Secondary Buttons</h3>
            <div className="button-examples">
              <button className="btn-secondary">Secondary</button>
              <button className="btn-secondary" disabled>Disabled</button>
              <button className="btn-secondary-outline">Outline</button>
            </div>
          </div>

          <div className="component-group">
            <h3>Button Sizes</h3>
            <div className="button-examples">
              <button className="btn-primary btn-small">Small</button>
              <button className="btn-primary btn-medium">Medium</button>
              <button className="btn-primary btn-large">Large</button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Elements */}
      <div className="component-category">
        <h2 className="category-title">Form Elements</h2>
        <div className="component-showcase">
          <div className="component-group">
            <h3>Input Fields</h3>
            <div className="form-examples">
              <div className="input-group">
                <label>Default Input</label>
                <input type="text" placeholder="Enter text here" />
              </div>
              <div className="input-group">
                <label>Email Input</label>
                <input type="email" placeholder="email@example.com" value="test@example.com" readOnly />
              </div>
              <div className="input-group error">
                <label>Error State</label>
                <input type="text" placeholder="Required field" className="error" />
                <span className="error-message">This field is required</span>
              </div>
            </div>
          </div>

          <div className="component-group">
            <h3>Select & Textarea</h3>
            <div className="form-examples">
              <div className="input-group">
                <label>Select Dropdown</label>
                <select>
                  <option>Choose an option</option>
                  <option>Option 1</option>
                  <option>Option 2</option>
                </select>
              </div>
              <div className="input-group">
                <label>Textarea</label>
                <textarea placeholder="Enter your message here" rows={4}></textarea>
              </div>
            </div>
          </div>

          <div className="component-group">
            <h3>Checkboxes & Radio</h3>
            <div className="form-examples">
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  Checkbox option
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked readOnly />
                  <span className="checkmark"></span>
                  Checked option
                </label>
              </div>
              <div className="radio-group">
                <label className="radio-label">
                  <input type="radio" name="radio-example" />
                  <span className="radio-mark"></span>
                  Radio option 1
                </label>
                <label className="radio-label">
                  <input type="radio" name="radio-example" checked readOnly />
                  <span className="radio-mark"></span>
                  Radio option 2
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="component-category">
        <h2 className="category-title">Cards</h2>
        <div className="component-showcase">
          <div className="component-group">
            <h3>Basic Cards</h3>
            <div className="card-examples">
              <div className="card basic-card">
                <h4>Simple Card</h4>
                <p>Basic card with minimal content and clean styling.</p>
              </div>
              
              <div className="card content-card">
                <div className="card-header">
                  <h4>Content Card</h4>
                  <span className="card-badge">New</span>
                </div>
                <div className="card-body">
                  <p>Card with header, body, and action sections for more complex content.</p>
                </div>
                <div className="card-actions">
                  <button className="btn-secondary btn-small">Learn More</button>
                  <button className="btn-primary btn-small">Get Started</button>
                </div>
              </div>

              <div className="card interactive-card">
                <div className="card-icon">📊</div>
                <h4>Interactive Card</h4>
                <p>Hover state and interactive elements for engaging user experiences.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="component-category">
        <h2 className="category-title">Navigation</h2>
        <div className="component-showcase">
          <div className="component-group">
            <h3>Tab Navigation</h3>
            <div className="tab-examples">
              <div className="tab-container">
                <button className="tab-button active">Overview</button>
                <button className="tab-button">Settings</button>
                <button className="tab-button">History</button>
                <button className="tab-button">Support</button>
              </div>
            </div>
          </div>

          <div className="component-group">
            <h3>Breadcrumbs</h3>
            <div className="breadcrumb-examples">
              <nav className="breadcrumb">
                <a href="#">Home</a>
                <span className="separator">/</span>
                <a href="#">Category</a>
                <span className="separator">/</span>
                <span className="current">Current Page</span>
              </nav>
            </div>
          </div>

          <div className="component-group">
            <h3>Pagination</h3>
            <div className="pagination-examples">
              <div className="pagination">
                <button className="page-btn" disabled>‹ Previous</button>
                <button className="page-btn">1</button>
                <button className="page-btn active">2</button>
                <button className="page-btn">3</button>
                <button className="page-btn">4</button>
                <button className="page-btn">Next ›</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Components */}
      <div className="component-category">
        <h2 className="category-title">Feedback</h2>
        <div className="component-showcase">
          <div className="component-group">
            <h3>Alerts & Messages</h3>
            <div className="alert-examples">
              <div className="alert alert-success">
                <span className="alert-icon">✓</span>
                <span>Success! Your changes have been saved.</span>
              </div>
              <div className="alert alert-warning">
                <span className="alert-icon">⚠</span>
                <span>Warning: Please review your input before continuing.</span>
              </div>
              <div className="alert alert-error">
                <span className="alert-icon">✗</span>
                <span>Error: Something went wrong. Please try again.</span>
              </div>
              <div className="alert alert-info">
                <span className="alert-icon">ℹ</span>
                <span>Info: New features are now available.</span>
              </div>
            </div>
          </div>

          <div className="component-group">
            <h3>Loading States</h3>
            <div className="loading-examples">
              <div className="loading-spinner-demo">
                <div className="spinner"></div>
                <span>Loading...</span>
              </div>
              <div className="skeleton-demo">
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text short"></div>
                <div className="skeleton skeleton-button"></div>
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

        .component-category {
          margin-bottom: 64px;
        }

        .category-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 32px;
        }

        .component-showcase {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 32px;
        }

        .component-group {
          background: var(--md-sys-color-surface-container);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .component-group h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 16px;
        }

        /* Button Styles */
        .button-examples {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
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
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: var(--md-sys-color-surface-container-high);
          color: var(--md-sys-color-on-surface);
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--md-sys-motion-duration-short1) var(--md-sys-motion-easing-standard);
        }

        .btn-secondary:hover:not(:disabled) {
          background: var(--md-sys-color-surface-container-highest);
        }

        .btn-secondary-outline {
          background: transparent;
          color: var(--md-sys-color-on-surface);
          border: 1px solid var(--md-sys-color-outline);
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--md-sys-motion-duration-short1) var(--md-sys-motion-easing-standard);
        }

        .btn-secondary-outline:hover {
          background: var(--md-sys-color-surface-container);
        }

        .btn-small {
          padding: 8px 16px;
          font-size: 0.75rem;
        }

        .btn-medium {
          padding: 12px 24px;
          font-size: 0.875rem;
        }

        .btn-large {
          padding: 16px 32px;
          font-size: 1rem;
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid var(--md-sys-color-on-primary);
          border-top: 2px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Form Styles */
        .form-examples {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-group label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--md-sys-color-on-surface);
        }

        .input-group input,
        .input-group select,
        .input-group textarea {
          padding: 12px;
          border: 1px solid var(--md-sys-color-outline);
          border-radius: 8px;
          background: var(--md-sys-color-surface);
          color: var(--md-sys-color-on-surface);
          font-size: 1rem;
          transition: border-color var(--md-sys-motion-duration-short1) var(--md-sys-motion-easing-standard);
        }

        .input-group input:focus,
        .input-group select:focus,
        .input-group textarea:focus {
          outline: none;
          border-color: var(--md-sys-color-primary);
        }

        .input-group.error input {
          border-color: #ef4444;
        }

        .error-message {
          font-size: 0.75rem;
          color: #ef4444;
        }

        .checkbox-group,
        .radio-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .checkbox-label,
        .radio-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
          color: var(--md-sys-color-on-surface);
          cursor: pointer;
        }

        .checkbox-label input,
        .radio-label input {
          width: 16px;
          height: 16px;
          margin: 0;
        }

        /* Card Styles */
        .card-examples {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .card {
          background: var(--md-sys-color-surface-container-low);
          border: 1px solid var(--md-sys-color-outline-variant);
          border-radius: 12px;
          padding: 20px;
          transition: all var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard);
        }

        .card h4 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 8px;
        }

        .card p {
          font-size: 0.875rem;
          color: var(--md-sys-color-on-surface-variant);
          line-height: 1.5;
        }

        .content-card .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .card-badge {
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.625rem;
          font-weight: 500;
        }

        .card-body {
          margin-bottom: 16px;
        }

        .card-actions {
          display: flex;
          gap: 8px;
        }

        .interactive-card {
          text-align: center;
          cursor: pointer;
        }

        .interactive-card:hover {
          transform: translateY(-4px);
          border-color: var(--md-sys-color-primary);
        }

        .card-icon {
          font-size: 48px;
          margin-bottom: 12px;
        }

        /* Navigation Styles */
        .tab-examples {
          margin-bottom: 16px;
        }

        .tab-container {
          display: flex;
          border-bottom: 1px solid var(--md-sys-color-outline-variant);
        }

        .tab-button {
          background: none;
          border: none;
          padding: 12px 20px;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--md-sys-color-on-surface-variant);
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all var(--md-sys-motion-duration-short1) var(--md-sys-motion-easing-standard);
        }

        .tab-button:hover {
          color: var(--md-sys-color-on-surface);
        }

        .tab-button.active {
          color: var(--md-sys-color-primary);
          border-bottom-color: var(--md-sys-color-primary);
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
        }

        .breadcrumb a {
          color: var(--md-sys-color-on-surface-variant);
          text-decoration: none;
        }

        .breadcrumb a:hover {
          color: var(--md-sys-color-primary);
        }

        .breadcrumb .separator {
          color: var(--md-sys-color-outline);
        }

        .breadcrumb .current {
          color: var(--md-sys-color-on-surface);
          font-weight: 500;
        }

        .pagination {
          display: flex;
          gap: 4px;
          align-items: center;
        }

        .page-btn {
          background: none;
          border: 1px solid var(--md-sys-color-outline-variant);
          color: var(--md-sys-color-on-surface);
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 0.875rem;
          cursor: pointer;
          min-width: 40px;
          transition: all var(--md-sys-motion-duration-short1) var(--md-sys-motion-easing-standard);
        }

        .page-btn:hover:not(:disabled) {
          background: var(--md-sys-color-surface-container);
        }

        .page-btn.active {
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
          border-color: var(--md-sys-color-primary);
        }

        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Alert Styles */
        .alert-examples {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .alert {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 0.875rem;
          border-left: 4px solid;
        }

        .alert-success {
          background: rgba(34, 197, 94, 0.1);
          border-left-color: #22c55e;
          color: var(--md-sys-color-on-surface);
        }

        .alert-warning {
          background: rgba(251, 191, 36, 0.1);
          border-left-color: #fbbf24;
          color: var(--md-sys-color-on-surface);
        }

        .alert-error {
          background: rgba(239, 68, 68, 0.1);
          border-left-color: #ef4444;
          color: var(--md-sys-color-on-surface);
        }

        .alert-info {
          background: rgba(59, 130, 246, 0.1);
          border-left-color: #3b82f6;
          color: var(--md-sys-color-on-surface);
        }

        .alert-icon {
          font-weight: bold;
        }

        /* Loading Styles */
        .loading-examples {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .loading-spinner-demo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .spinner {
          width: 24px;
          height: 24px;
          border: 3px solid var(--md-sys-color-outline-variant);
          border-top: 3px solid var(--md-sys-color-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .skeleton-demo {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .skeleton {
          background: var(--md-sys-color-surface-container-high);
          border-radius: 4px;
          animation: pulse 2s ease-in-out infinite;
        }

        .skeleton-text {
          height: 16px;
          width: 100%;
        }

        .skeleton-text.short {
          width: 60%;
        }

        .skeleton-button {
          height: 36px;
          width: 100px;
          border-radius: 8px;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @media (max-width: 768px) {
          .component-showcase {
            grid-template-columns: 1fr;
          }
          
          .button-examples {
            flex-direction: column;
            align-items: stretch;
          }
          
          .tab-container {
            overflow-x: auto;
          }
          
          .pagination {
            justify-content: center;
          }
        }
      `}</style>
    </section>
  )
}
