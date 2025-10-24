'use client'

export default function ThemeSection() {
  return (
    <section id="themes" className="styleguide-section">
      <div className="section-header">
        <h1 className="section-title">Theme System</h1>
        <p className="section-subtitle">
          Dark and light theme support with automatic device preference detection
        </p>
      </div>

      {/* Theme Philosophy */}
      <div className="philosophy-block">
        <h2 className="subsection-title">Theme Philosophy</h2>
        <p className="philosophy-text">
          Our theme system provides seamless dark and light mode support while maintaining 
          the sophisticated monochromatic aesthetic. The system automatically detects device 
          preferences and allows manual override, ensuring optimal user experience across 
          all lighting conditions.
        </p>
      </div>

      {/* Theme Usage */}
      <div className="usage-section">
        <h2 className="subsection-title">Usage</h2>
        <div className="usage-grid">
          <div className="usage-example">
            <h3>Theme Toggle Component</h3>
            <div className="code-block">
              <pre>{`import { ThemeToggle } from '@/components/theme/ThemeToggle'

export default function Header() {
  return (
    <header>
      <ThemeToggle />
    </header>
  )
}`}</pre>
            </div>
          </div>

          <div className="usage-example">
            <h3>Compact Theme Toggle</h3>
            <div className="code-block">
              <pre>{`import { ThemeToggleCompact } from '@/components/theme/ThemeToggle'

export default function MobileHeader() {
  return (
    <header>
      <ThemeToggleCompact />
    </header>
  )
}`}</pre>
            </div>
          </div>

          <div className="usage-example">
            <h3>Using Theme Hook</h3>
            <div className="code-block">
              <pre>{`import { useTheme } from '@/stores/theme'

export default function Component() {
  const { mode, resolvedTheme, toggleTheme } = useTheme()
  
  return (
    <div>
      <p>Current mode: {mode}</p>
      <p>Resolved theme: {resolvedTheme}</p>
      <button onClick={toggleTheme}>
        Toggle Theme
      </button>
    </div>
  )
}`}</pre>
            </div>
          </div>

          <div className="usage-example">
            <h3>CSS Custom Properties</h3>
            <div className="code-block">
              <pre>{`/* Automatic theme switching */
.my-component {
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  border: 1px solid var(--md-sys-color-outline);
}

/* Component automatically adapts to theme */`}</pre>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Tokens Comparison */}
      <div className="tokens-section">
        <h2 className="subsection-title">Theme Token Comparison</h2>
        <div className="tokens-comparison">
          <div className="theme-column">
            <h3>Dark Theme (Default)</h3>
            <div className="token-list">
              <div className="token-item">
                <div className="token-swatch" style={{ background: '#ffffff' }}></div>
                <div className="token-info">
                  <span className="token-name">--md-sys-color-primary</span>
                  <span className="token-value">#ffffff</span>
                </div>
              </div>
              <div className="token-item">
                <div className="token-swatch" style={{ background: '#000000' }}></div>
                <div className="token-info">
                  <span className="token-name">--md-sys-color-background</span>
                  <span className="token-value">#000000</span>
                </div>
              </div>
              <div className="token-item">
                <div className="token-swatch" style={{ background: '#1a1a1a' }}></div>
                <div className="token-info">
                  <span className="token-name">--md-sys-color-surface</span>
                  <span className="token-value">#0a0a0a</span>
                </div>
              </div>
              <div className="token-item">
                <div className="token-swatch" style={{ background: '#666666' }}></div>
                <div className="token-info">
                  <span className="token-name">--md-sys-color-outline</span>
                  <span className="token-value">#666666</span>
                </div>
              </div>
            </div>
          </div>

          <div className="theme-column">
            <h3>Light Theme</h3>
            <div className="token-list">
              <div className="token-item">
                <div className="token-swatch" style={{ background: '#000000' }}></div>
                <div className="token-info">
                  <span className="token-name">--md-sys-color-primary</span>
                  <span className="token-value">#000000</span>
                </div>
              </div>
              <div className="token-item">
                <div className="token-swatch" style={{ background: '#ffffff' }}></div>
                <div className="token-info">
                  <span className="token-name">--md-sys-color-background</span>
                  <span className="token-value">#ffffff</span>
                </div>
              </div>
              <div className="token-item">
                <div className="token-swatch" style={{ background: '#fafafa' }}></div>
                <div className="token-info">
                  <span className="token-name">--md-sys-color-surface</span>
                  <span className="token-value">#fafafa</span>
                </div>
              </div>
              <div className="token-item">
                <div className="token-swatch" style={{ background: '#999999' }}></div>
                <div className="token-info">
                  <span className="token-name">--md-sys-color-outline</span>
                  <span className="token-value">#999999</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Implementation Details */}
      <div className="implementation-section">
        <h2 className="subsection-title">Implementation Details</h2>
        <div className="implementation-grid">
          <div className="implementation-item">
            <h4>Theme Detection</h4>
            <p>
              System automatically detects device preference using `prefers-color-scheme` 
              media query and applies appropriate theme on page load.
            </p>
          </div>
          <div className="implementation-item">
            <h4>State Persistence</h4>
            <p>
              User preferences are stored in localStorage and persist across browser 
              sessions. Falls back gracefully if storage is unavailable.
            </p>
          </div>
          <div className="implementation-item">
            <h4>FOUC Prevention</h4>
            <p>
              Inline script applies theme before React hydration to prevent flash 
              of unstyled content during page loads.
            </p>
          </div>
          <div className="implementation-item">
            <h4>Accessibility</h4>
            <p>
              All theme variants maintain WCAG AA contrast ratios. Theme toggle 
              includes proper ARIA labels and keyboard navigation support.
            </p>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="practices-section">
        <h2 className="subsection-title">Best Practices</h2>
        <div className="practices-list">
          <div className="practice-item">
            <h4>✅ Use CSS Custom Properties</h4>
            <p>Always use design tokens (--md-sys-color-*) instead of hardcoded colors.</p>
          </div>
          <div className="practice-item">
            <h4>✅ Test Both Themes</h4>
            <p>Verify all components work correctly in both dark and light themes.</p>
          </div>
          <div className="practice-item">
            <h4>✅ Maintain Semantic Meaning</h4>
            <p>Ensure color relationships remain meaningful across theme switches.</p>
          </div>
          <div className="practice-item">
            <h4>❌ Avoid Theme-Specific Logic</h4>
            <p>Don't write conditional logic based on current theme in components.</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .tokens-comparison {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-top: 1.5rem;
        }

        .theme-column h3 {
          color: var(--md-sys-color-primary);
          margin-bottom: 1rem;
          font-size: 1.25rem;
        }

        .token-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .token-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: var(--md-sys-color-surface-container);
          border-radius: 8px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .token-swatch {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: 1px solid var(--md-sys-color-outline-variant);
          flex-shrink: 0;
        }

        .token-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .token-name {
          font-family: 'Roboto Mono', monospace;
          font-size: 0.875rem;
          color: var(--md-sys-color-on-surface);
          font-weight: 500;
        }

        .token-value {
          font-family: 'Roboto Mono', monospace;
          font-size: 0.75rem;
          color: var(--md-sys-color-on-surface-variant);
        }

        .usage-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        .usage-example {
          background: var(--md-sys-color-surface-container);
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .usage-example h3 {
          color: var(--md-sys-color-primary);
          margin-bottom: 1rem;
          font-size: 1rem;
        }

        .code-block {
          background: var(--md-sys-color-surface-container-low);
          border-radius: 8px;
          padding: 1rem;
          overflow-x: auto;
        }

        .code-block pre {
          margin: 0;
          font-family: 'Roboto Mono', monospace;
          font-size: 0.875rem;
          color: var(--md-sys-color-on-surface);
          line-height: 1.5;
        }

        .implementation-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        .implementation-item {
          background: var(--md-sys-color-surface-container);
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .implementation-item h4 {
          color: var(--md-sys-color-primary);
          margin-bottom: 0.75rem;
          font-size: 1rem;
        }

        .implementation-item p {
          color: var(--md-sys-color-on-surface-variant);
          line-height: 1.6;
          margin: 0;
        }

        .practices-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .practice-item {
          background: var(--md-sys-color-surface-container);
          padding: 1.25rem;
          border-radius: 12px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .practice-item h4 {
          color: var(--md-sys-color-on-surface);
          margin-bottom: 0.5rem;
          font-size: 1rem;
        }

        .practice-item p {
          color: var(--md-sys-color-on-surface-variant);
          margin: 0;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .tokens-comparison {
            grid-template-columns: 1fr;
          }
          
          .usage-grid {
            grid-template-columns: 1fr;
          }
          
          .implementation-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  )
}
