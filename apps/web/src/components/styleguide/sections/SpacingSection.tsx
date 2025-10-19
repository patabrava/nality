'use client'

export default function SpacingSection() {
  const spacingTokens = [
    { name: "Extra Small", token: "--md-sys-spacing-xs", value: "4px", usage: "Icon padding, micro interactions" },
    { name: "Small", token: "--md-sys-spacing-sm", value: "8px", usage: "Button padding, form field gaps" },
    { name: "Medium", token: "--md-sys-spacing-md", value: "16px", usage: "Card padding, section gaps" },
    { name: "Large", token: "--md-sys-spacing-lg", value: "24px", usage: "Component spacing, layout margins" },
    { name: "Extra Large", token: "--md-sys-spacing-xl", value: "32px", usage: "Section padding, major layout gaps" },
    { name: "2X Large", token: "--md-sys-spacing-2xl", value: "48px", usage: "Page sections, hero spacing" },
    { name: "3X Large", token: "--md-sys-spacing-3xl", value: "64px", usage: "Major page sections" },
    { name: "4X Large", token: "--md-sys-spacing-4xl", value: "80px", usage: "Page-level spacing" },
  ]

  const spacingPrinciples = [
    {
      title: "Consistent Rhythm",
      description: "Use the 8px base unit system to create predictable, harmonious spacing throughout the interface.",
      example: "8px base unit"
    },
    {
      title: "Logical Hierarchy", 
      description: "Larger spacing indicates stronger relationships. Related elements are closer together.",
      example: "Related: 8px, Sections: 32px"
    },
    {
      title: "Touch Targets",
      description: "Ensure interactive elements have minimum 44px touch targets for accessibility.",
      example: "44px minimum"
    },
    {
      title: "Breathing Room",
      description: "White space improves readability and creates focus. Don't be afraid of generous spacing.",
      example: "Content + space = clarity"
    }
  ]

  return (
    <section id="spacing" className="styleguide-section">
      <div className="section-header">
        <h1 className="section-title">Spacing System</h1>
        <p className="section-subtitle">
          Consistent spacing creates rhythm, hierarchy, and improved usability across all interfaces
        </p>
      </div>

      {/* Spacing Principles */}
      <div className="principles-section">
        <h2 className="subsection-title">Spacing Principles</h2>
        <div className="principles-grid">
          {spacingPrinciples.map((principle) => (
            <div key={principle.title} className="principle-card">
              <h3 className="principle-title">{principle.title}</h3>
              <p className="principle-description">{principle.description}</p>
              <div className="principle-example">{principle.example}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Spacing Scale */}
      <div className="spacing-scale-section">
        <h2 className="subsection-title">Spacing Scale</h2>
        <p className="scale-description">
          Our spacing system is based on an 8px grid, providing consistent and scalable spacing options.
        </p>
        <div className="spacing-tokens">
          {spacingTokens.map((token) => (
            <div key={token.name} className="spacing-token">
              <div className="token-info">
                <div className="token-name">{token.name}</div>
                <div className="token-value">{token.value}</div>
                <div className="token-css">{token.token}</div>
                <div className="token-usage">{token.usage}</div>
              </div>
              <div className="token-visual">
                <div 
                  className="spacing-bar"
                  style={{ width: token.value }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Layout Examples */}
      <div className="layout-examples-section">
        <h2 className="subsection-title">Layout Examples</h2>
        
        {/* Card Layout */}
        <div className="example-block">
          <h3 className="example-title">Card Layout</h3>
          <div className="card-example">
            <div className="example-card">
              <div className="card-header">
                <h4>Card Title</h4>
                <p className="card-subtitle">Subtitle with medium spacing</p>
              </div>
              <div className="card-content">
                <p>Content area with proper spacing between elements. This demonstrates how consistent spacing creates visual hierarchy.</p>
                <div className="card-actions">
                  <button className="action-button">Primary</button>
                  <button className="action-button secondary">Secondary</button>
                </div>
              </div>
            </div>
            <div className="spacing-annotations">
              <div className="annotation" style={{ top: '0', left: '0', right: '0', height: '24px' }}>
                <span>lg (24px) padding</span>
              </div>
              <div className="annotation" style={{ top: '60px', left: '24px', right: '24px', height: '16px' }}>
                <span>md (16px) gap</span>
              </div>
              <div className="annotation" style={{ bottom: '20px', left: '24px', width: '80px', height: '8px' }}>
                <span>sm (8px)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Layout */}
        <div className="example-block">
          <h3 className="example-title">Form Layout</h3>
          <div className="form-example">
            <form className="example-form">
              <div className="form-group">
                <label>Label</label>
                <input type="text" placeholder="Input field" />
              </div>
              <div className="form-group">
                <label>Another Label</label>
                <input type="email" placeholder="email@example.com" />
              </div>
              <div className="form-actions">
                <button type="submit">Submit</button>
                <button type="button" className="secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="example-block">
          <h3 className="example-title">Grid Layout</h3>
          <div className="grid-example">
            <div className="grid-container">
              <div className="grid-item">Item 1</div>
              <div className="grid-item">Item 2</div>
              <div className="grid-item">Item 3</div>
              <div className="grid-item">Item 4</div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Spacing */}
      <div className="responsive-section">
        <h2 className="subsection-title">Responsive Spacing</h2>
        <div className="responsive-examples">
          <div className="responsive-card">
            <h4>Mobile (320px+)</h4>
            <ul>
              <li>Reduce outer margins to 16px</li>
              <li>Smaller padding on cards (16px)</li>
              <li>Tighter vertical rhythm</li>
            </ul>
          </div>
          <div className="responsive-card">
            <h4>Tablet (768px+)</h4>
            <ul>
              <li>Standard spacing tokens</li>
              <li>Balanced horizontal/vertical spacing</li>
              <li>24px card padding</li>
            </ul>
          </div>
          <div className="responsive-card">
            <h4>Desktop (1024px+)</h4>
            <ul>
              <li>Generous spacing (32px+)</li>
              <li>Wider content margins</li>
              <li>Enhanced breathing room</li>
            </ul>
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

        .principles-section,
        .spacing-scale-section,
        .layout-examples-section,
        .responsive-section {
          margin-bottom: 64px;
        }

        .subsection-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 24px;
        }

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
        }

        .principle-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 8px;
        }

        .principle-description {
          font-size: 0.875rem;
          color: var(--md-sys-color-on-surface-variant);
          line-height: 1.5;
          margin-bottom: 12px;
        }

        .principle-example {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--md-sys-color-primary);
          background: var(--md-sys-color-primary-container);
          padding: 8px 12px;
          border-radius: 6px;
          font-family: 'Roboto Mono', monospace;
        }

        .scale-description {
          font-size: 1.125rem;
          color: var(--md-sys-color-on-surface-variant);
          line-height: 1.6;
          margin-bottom: 32px;
        }

        .spacing-tokens {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .spacing-token {
          display: grid;
          grid-template-columns: 1fr 200px;
          gap: 32px;
          align-items: center;
          padding: 20px;
          background: var(--md-sys-color-surface-container);
          border-radius: 8px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .token-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .token-name {
          font-size: 1rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
        }

        .token-value {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--md-sys-color-on-surface-variant);
          font-family: 'Roboto Mono', monospace;
        }

        .token-css {
          font-size: 0.75rem;
          color: var(--md-sys-color-outline);
          font-family: 'Roboto Mono', monospace;
        }

        .token-usage {
          font-size: 0.75rem;
          color: var(--md-sys-color-on-surface-variant);
          line-height: 1.4;
        }

        .token-visual {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .spacing-bar {
          height: 24px;
          background: var(--md-sys-color-primary);
          border-radius: 2px;
          min-width: 4px;
        }

        .example-block {
          margin-bottom: 48px;
        }

        .example-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 24px;
        }

        .card-example {
          position: relative;
        }

        .example-card {
          background: var(--md-sys-color-surface-container);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid var(--md-sys-color-outline-variant);
          max-width: 400px;
        }

        .card-header {
          margin-bottom: 16px;
        }

        .card-header h4 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 4px;
        }

        .card-subtitle {
          font-size: 0.875rem;
          color: var(--md-sys-color-on-surface-variant);
        }

        .card-content p {
          font-size: 0.875rem;
          color: var(--md-sys-color-on-surface-variant);
          line-height: 1.5;
          margin-bottom: 16px;
        }

        .card-actions {
          display: flex;
          gap: 8px;
        }

        .action-button {
          padding: 8px 16px;
          border-radius: 6px;
          border: none;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
        }

        .action-button.secondary {
          background: transparent;
          color: var(--md-sys-color-on-surface-variant);
          border: 1px solid var(--md-sys-color-outline);
        }

        .spacing-annotations {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }

        .annotation {
          position: absolute;
          background: rgba(255, 255, 255, 0.1);
          border: 1px dashed var(--md-sys-color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .annotation span {
          font-size: 0.625rem;
          color: var(--md-sys-color-primary);
          background: var(--md-sys-color-background);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Roboto Mono', monospace;
        }

        .form-example {
          max-width: 400px;
        }

        .example-form {
          background: var(--md-sys-color-surface-container);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 8px;
        }

        .form-group input {
          width: 100%;
          padding: 12px;
          border: 1px solid var(--md-sys-color-outline);
          border-radius: 8px;
          background: var(--md-sys-color-surface);
          color: var(--md-sys-color-on-surface);
          font-size: 1rem;
        }

        .form-actions {
          display: flex;
          gap: 8px;
          margin-top: 24px;
        }

        .form-actions button {
          padding: 12px 24px;
          border-radius: 8px;
          border: none;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
        }

        .form-actions button.secondary {
          background: transparent;
          color: var(--md-sys-color-on-surface-variant);
          border: 1px solid var(--md-sys-color-outline);
        }

        .grid-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
        }

        .grid-item {
          background: var(--md-sys-color-surface-container);
          border: 1px solid var(--md-sys-color-outline-variant);
          border-radius: 8px;
          padding: 24px;
          text-align: center;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--md-sys-color-on-surface);
        }

        .responsive-examples {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
        }

        .responsive-card {
          background: var(--md-sys-color-surface-container);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .responsive-card h4 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 12px;
        }

        .responsive-card ul {
          list-style: none;
          padding: 0;
        }

        .responsive-card li {
          font-size: 0.875rem;
          color: var(--md-sys-color-on-surface-variant);
          line-height: 1.5;
          margin-bottom: 8px;
          padding-left: 16px;
          position: relative;
        }

        .responsive-card li::before {
          content: '•';
          color: var(--md-sys-color-primary);
          position: absolute;
          left: 0;
        }

        @media (max-width: 768px) {
          .spacing-token {
            grid-template-columns: 1fr;
            text-align: center;
          }
          
          .principles-grid {
            grid-template-columns: 1fr;
          }
          
          .responsive-examples {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  )
}
