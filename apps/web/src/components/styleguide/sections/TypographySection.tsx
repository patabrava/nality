'use client'

export default function TypographySection() {
  const typeScale = [
    { name: "Display Large", size: "57px", weight: "400", lineHeight: "64px", token: "--md-sys-typescale-display-large-size" },
    { name: "Display Medium", size: "45px", weight: "400", lineHeight: "52px", token: "--md-sys-typescale-display-medium-size" },
    { name: "Display Small", size: "36px", weight: "400", lineHeight: "44px", token: "--md-sys-typescale-display-small-size" },
    { name: "Headline Large", size: "32px", weight: "400", lineHeight: "40px", token: "--md-sys-typescale-headline-large-size" },
    { name: "Headline Medium", size: "28px", weight: "400", lineHeight: "36px", token: "--md-sys-typescale-headline-medium-size" },
    { name: "Headline Small", size: "24px", weight: "400", lineHeight: "32px", token: "--md-sys-typescale-headline-small-size" },
    { name: "Title Large", size: "22px", weight: "400", lineHeight: "28px", token: "--md-sys-typescale-title-large-size" },
    { name: "Title Medium", size: "16px", weight: "500", lineHeight: "24px", token: "--md-sys-typescale-title-medium-size" },
    { name: "Title Small", size: "14px", weight: "500", lineHeight: "20px", token: "--md-sys-typescale-title-small-size" },
    { name: "Body Large", size: "16px", weight: "400", lineHeight: "24px", token: "--md-sys-typescale-body-large-size" },
    { name: "Body Medium", size: "14px", weight: "400", lineHeight: "20px", token: "--md-sys-typescale-body-medium-size" },
    { name: "Body Small", size: "12px", weight: "400", lineHeight: "16px", token: "--md-sys-typescale-body-small-size" },
    { name: "Label Large", size: "14px", weight: "500", lineHeight: "20px", token: "--md-sys-typescale-label-large-size" },
    { name: "Label Medium", size: "12px", weight: "500", lineHeight: "16px", token: "--md-sys-typescale-label-medium-size" },
    { name: "Label Small", size: "11px", weight: "500", lineHeight: "16px", token: "--md-sys-typescale-label-small-size" },
  ]

  const fontWeights = [
    { name: "Light", weight: "300", usage: "Large display text, decorative headlines" },
    { name: "Regular", weight: "400", usage: "Body text, paragraphs, most content" },
    { name: "Medium", weight: "500", usage: "Buttons, labels, emphasized text" },
    { name: "Semi Bold", weight: "600", usage: "Section headings, important labels" },
    { name: "Bold", weight: "700", usage: "Page titles, primary headings" },
  ]

  return (
    <section id="typography" className="styleguide-section">
      <div className="section-header">
        <h1 className="section-title">Typography</h1>
        <p className="section-subtitle">
          A systematic approach to text that creates clear hierarchy and excellent readability
        </p>
      </div>

      {/* Font Family */}
      <div className="font-family-section">
        <h2 className="subsection-title">Font Family</h2>
        <div className="font-demo">
          <div className="font-specimen">
            <div className="specimen-large">Roboto</div>
            <div className="specimen-alphabet">
              ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
              abcdefghijklmnopqrstuvwxyz<br />
              0123456789 !@#$%^&*()
            </div>
            <div className="specimen-description">
              Roboto is a neo-grotesque sans-serif typeface designed by Christian Robertson 
              for Google. Its friendly and open curves provide excellent readability across 
              all devices and screen sizes.
            </div>
          </div>
        </div>
      </div>

      {/* Type Scale */}
      <div className="type-scale-section">
        <h2 className="subsection-title">Type Scale</h2>
        <p className="scale-description">
          Our type scale follows Material Design 3 guidelines, providing 15 distinct text styles 
          for clear hierarchy and consistent spacing.
        </p>
        <div className="type-scale-list">
          {typeScale.map((style) => (
            <div key={style.name} className="type-specimen">
              <div className="specimen-info">
                <div className="specimen-name">{style.name}</div>
                <div className="specimen-specs">
                  {style.size} • {style.weight} • {style.lineHeight}
                </div>
                <div className="specimen-token">{style.token}</div>
              </div>
              <div 
                className="specimen-text"
                style={{
                  fontSize: style.size,
                  fontWeight: style.weight,
                  lineHeight: style.lineHeight,
                }}
              >
                The quick brown fox jumps over the lazy dog
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Font Weights */}
      <div className="font-weights-section">
        <h2 className="subsection-title">Font Weights</h2>
        <div className="weights-grid">
          {fontWeights.map((weight) => (
            <div key={weight.name} className="weight-card">
              <div 
                className="weight-display"
                style={{ fontWeight: weight.weight }}
              >
                Aa
              </div>
              <div className="weight-info">
                <div className="weight-name">{weight.name}</div>
                <div className="weight-value">{weight.weight}</div>
                <div className="weight-usage">{weight.usage}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Examples */}
      <div className="usage-examples-section">
        <h2 className="subsection-title">Usage Examples</h2>
        <div className="examples-grid">
          <div className="example-card">
            <h3>Article Layout</h3>
            <div className="article-example">
              <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>
                Headline Large
              </h1>
              <p style={{ fontSize: '16px', fontWeight: '400', lineHeight: '24px', marginBottom: '16px', color: 'var(--md-sys-color-on-surface-variant)' }}>
                Body Large - This is how body text appears in articles and long-form content. 
                It provides excellent readability with proper line height and spacing.
              </p>
              <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px' }}>
                Headline Small
              </h2>
              <p style={{ fontSize: '14px', fontWeight: '400', lineHeight: '20px', color: 'var(--md-sys-color-on-surface-variant)' }}>
                Body Medium - Used for secondary content and descriptions.
              </p>
            </div>
          </div>

          <div className="example-card">
            <h3>Interface Elements</h3>
            <div className="interface-example">
              <button className="example-button">
                Label Large
              </button>
              <div className="form-field">
                <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--md-sys-color-on-surface-variant)' }}>
                  Label Medium
                </label>
                <input 
                  type="text" 
                  placeholder="Body Large input text"
                  style={{ 
                    fontSize: '16px', 
                    fontWeight: '400',
                    padding: '12px',
                    border: '1px solid var(--md-sys-color-outline)',
                    borderRadius: '8px',
                    background: 'var(--md-sys-color-surface)',
                    color: 'var(--md-sys-color-on-surface)',
                    width: '100%'
                  }}
                />
              </div>
            </div>
          </div>

          <div className="example-card">
            <h3>Navigation</h3>
            <div className="nav-example">
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href="#" style={{ fontSize: '14px', fontWeight: '500', color: 'var(--md-sys-color-primary)', textDecoration: 'none' }}>
                  Title Medium - Active Link
                </a>
                <a href="#" style={{ fontSize: '14px', fontWeight: '400', color: 'var(--md-sys-color-on-surface-variant)', textDecoration: 'none' }}>
                  Body Medium - Navigation Link
                </a>
                <a href="#" style={{ fontSize: '12px', fontWeight: '400', color: 'var(--md-sys-color-outline)', textDecoration: 'none' }}>
                  Body Small - Secondary Link
                </a>
              </nav>
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

        .font-family-section,
        .type-scale-section,
        .font-weights-section,
        .usage-examples-section {
          margin-bottom: 64px;
        }

        .subsection-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 24px;
        }

        .font-demo {
          background: var(--md-sys-color-surface-container);
          border-radius: 16px;
          padding: 48px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .font-specimen {
          text-align: center;
        }

        .specimen-large {
          font-size: 96px;
          font-weight: 300;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 32px;
          letter-spacing: -0.02em;
        }

        .specimen-alphabet {
          font-size: 18px;
          font-weight: 400;
          color: var(--md-sys-color-on-surface-variant);
          line-height: 1.6;
          margin-bottom: 24px;
          font-family: 'Roboto', sans-serif;
        }

        .specimen-description {
          font-size: 16px;
          font-weight: 400;
          color: var(--md-sys-color-on-surface-variant);
          line-height: 1.6;
          max-width: 600px;
          margin: 0 auto;
        }

        .scale-description {
          font-size: 1.125rem;
          color: var(--md-sys-color-on-surface-variant);
          line-height: 1.6;
          margin-bottom: 32px;
        }

        .type-scale-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .type-specimen {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 32px;
          align-items: center;
          padding: 24px;
          background: var(--md-sys-color-surface-container);
          border-radius: 12px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .specimen-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .specimen-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
        }

        .specimen-specs {
          font-size: 12px;
          font-weight: 400;
          color: var(--md-sys-color-on-surface-variant);
        }

        .specimen-token {
          font-size: 10px;
          font-family: 'Roboto Mono', monospace;
          color: var(--md-sys-color-outline);
        }

        .specimen-text {
          color: var(--md-sys-color-on-surface);
          font-family: 'Roboto', sans-serif;
        }

        .weights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px;
        }

        .weight-card {
          background: var(--md-sys-color-surface-container);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid var(--md-sys-color-outline-variant);
          text-align: center;
        }

        .weight-display {
          font-size: 64px;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 16px;
          font-family: 'Roboto', sans-serif;
        }

        .weight-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .weight-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
        }

        .weight-value {
          font-size: 14px;
          font-weight: 400;
          color: var(--md-sys-color-on-surface-variant);
          font-family: 'Roboto Mono', monospace;
        }

        .weight-usage {
          font-size: 12px;
          font-weight: 400;
          color: var(--md-sys-color-outline);
          line-height: 1.4;
        }

        .examples-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }

        .example-card {
          background: var(--md-sys-color-surface-container);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .example-card h3 {
          font-size: 18px;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 16px;
        }

        .article-example h1,
        .article-example h2 {
          color: var(--md-sys-color-on-surface);
          font-family: 'Roboto', sans-serif;
        }

        .article-example p {
          font-family: 'Roboto', sans-serif;
        }

        .example-button {
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          font-family: 'Roboto', sans-serif;
          cursor: pointer;
          margin-bottom: 16px;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .nav-example nav a {
          padding: 8px 0;
          display: block;
          font-family: 'Roboto', sans-serif;
        }

        .nav-example nav a:hover {
          opacity: 0.8;
        }

        @media (max-width: 768px) {
          .type-specimen {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 16px;
          }
          
          .weights-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          }
          
          .examples-grid {
            grid-template-columns: 1fr;
          }
          
          .specimen-large {
            font-size: 64px;
          }
        }
      `}</style>
    </section>
  )
}
