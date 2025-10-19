'use client'

export default function ColorsSection() {
  const colorTokens = [
    {
      category: "Primary",
      colors: [
        { name: "Primary", token: "--md-sys-color-primary", hex: "#FFFFFF" },
        { name: "On Primary", token: "--md-sys-color-on-primary", hex: "#000000" },
        { name: "Primary Container", token: "--md-sys-color-primary-container", hex: "#2E2E2E" },
        { name: "On Primary Container", token: "--md-sys-color-on-primary-container", hex: "#FFFFFF" },
      ]
    },
    {
      category: "Surface",
      colors: [
        { name: "Background", token: "--md-sys-color-background", hex: "#121212" },
        { name: "On Background", token: "--md-sys-color-on-background", hex: "#E0E0E0" },
        { name: "Surface", token: "--md-sys-color-surface", hex: "#1A1A1A" },
        { name: "On Surface", token: "--md-sys-color-on-surface", hex: "#E0E0E0" },
        { name: "Surface Variant", token: "--md-sys-color-surface-variant", hex: "#2E2E2E" },
        { name: "On Surface Variant", token: "--md-sys-color-on-surface-variant", hex: "#B0B0B0" },
      ]
    },
    {
      category: "Surface Containers",
      colors: [
        { name: "Surface Container Lowest", token: "--md-sys-color-surface-container-lowest", hex: "#0F0F0F" },
        { name: "Surface Container Low", token: "--md-sys-color-surface-container-low", hex: "#161616" },
        { name: "Surface Container", token: "--md-sys-color-surface-container", hex: "#1E1E1E" },
        { name: "Surface Container High", token: "--md-sys-color-surface-container-high", hex: "#262626" },
        { name: "Surface Container Highest", token: "--md-sys-color-surface-container-highest", hex: "#2E2E2E" },
      ]
    },
    {
      category: "Outline",
      colors: [
        { name: "Outline", token: "--md-sys-color-outline", hex: "#525252" },
        { name: "Outline Variant", token: "--md-sys-color-outline-variant", hex: "#404040" },
      ]
    },
    {
      category: "State",
      colors: [
        { name: "Inverse Surface", token: "--md-sys-color-inverse-surface", hex: "#E0E0E0" },
        { name: "Inverse On Surface", token: "--md-sys-color-inverse-on-surface", hex: "#1A1A1A" },
        { name: "Inverse Primary", token: "--md-sys-color-inverse-primary", hex: "#000000" },
      ]
    }
  ]

  return (
    <section id="colors" className="styleguide-section">
      <div className="section-header">
        <h1 className="section-title">Color System</h1>
        <p className="section-subtitle">
          A sophisticated monochromatic palette built on Material Design 3 tokens
        </p>
      </div>

      {/* Color Philosophy */}
      <div className="philosophy-block">
        <h2 className="subsection-title">Monochromatic Philosophy</h2>
        <p className="philosophy-text">
          Our color system embraces a refined monochromatic approach that creates focus 
          and sophistication. By working within grayscale, we ensure content remains 
          the hero while maintaining excellent accessibility and timeless appeal.
        </p>
      </div>

      {/* Color Tokens Grid */}
      {colorTokens.map((category) => (
        <div key={category.category} className="color-category">
          <h3 className="category-title">{category.category}</h3>
          <div className="color-grid">
            {category.colors.map((color) => (
              <div key={color.name} className="color-card">
                <div 
                  className="color-swatch"
                  style={{ backgroundColor: `var(${color.token})` }}
                />
                <div className="color-info">
                  <div className="color-name">{color.name}</div>
                  <div className="color-token">{color.token}</div>
                  <div className="color-hex">{color.hex}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Usage Guidelines */}
      <div className="guidelines-section">
        <h2 className="subsection-title">Usage Guidelines</h2>
        <div className="guidelines-grid">
          <div className="guideline-card">
            <h4>Backgrounds</h4>
            <p>Use surface containers to create layered experiences. Higher containers for elevated content.</p>
            <div className="example-stack">
              <div className="layer" style={{ background: 'var(--md-sys-color-background)' }}>Background</div>
              <div className="layer" style={{ background: 'var(--md-sys-color-surface-container-low)' }}>Low</div>
              <div className="layer" style={{ background: 'var(--md-sys-color-surface-container)' }}>Standard</div>
              <div className="layer" style={{ background: 'var(--md-sys-color-surface-container-high)' }}>High</div>
            </div>
          </div>

          <div className="guideline-card">
            <h4>Text Hierarchy</h4>
            <p>Use on-surface variants to create clear information hierarchy.</p>
            <div className="text-example">
              <div style={{ color: 'var(--md-sys-color-on-surface)' }}>Primary text</div>
              <div style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>Secondary text</div>
              <div style={{ color: 'var(--md-sys-color-outline)' }}>Tertiary text</div>
            </div>
          </div>

          <div className="guideline-card">
            <h4>Borders & Dividers</h4>
            <p>Use outline tokens for subtle separation and definition.</p>
            <div className="border-example">
              <div style={{ border: '1px solid var(--md-sys-color-outline-variant)' }}>Subtle border</div>
              <div style={{ border: '1px solid var(--md-sys-color-outline)' }}>Standard border</div>
            </div>
          </div>

          <div className="guideline-card">
            <h4>Interactive Elements</h4>
            <p>Primary tokens for buttons and key actions.</p>
            <div className="button-example">
              <button style={{ 
                background: 'var(--md-sys-color-primary)', 
                color: 'var(--md-sys-color-on-primary)',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px'
              }}>
                Primary Button
              </button>
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

        .philosophy-block {
          background: var(--md-sys-color-surface-container);
          border-radius: 16px;
          padding: 32px;
          margin-bottom: 48px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .subsection-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 16px;
        }

        .philosophy-text {
          font-size: 1.125rem;
          color: var(--md-sys-color-on-surface-variant);
          line-height: 1.6;
        }

        .color-category {
          margin-bottom: 48px;
        }

        .category-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 24px;
        }

        .color-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }

        .color-card {
          background: var(--md-sys-color-surface-container);
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid var(--md-sys-color-outline-variant);
          transition: transform var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard);
        }

        .color-card:hover {
          transform: scale(1.02);
        }

        .color-swatch {
          height: 80px;
          width: 100%;
        }

        .color-info {
          padding: 16px;
        }

        .color-name {
          font-size: 1rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 4px;
        }

        .color-token {
          font-size: 0.75rem;
          font-family: 'Roboto Mono', monospace;
          color: var(--md-sys-color-on-surface-variant);
          margin-bottom: 4px;
        }

        .color-hex {
          font-size: 0.75rem;
          font-family: 'Roboto Mono', monospace;
          color: var(--md-sys-color-outline);
        }

        .guidelines-section {
          margin-top: 64px;
        }

        .guidelines-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
        }

        .guideline-card {
          background: var(--md-sys-color-surface-container);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .guideline-card h4 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 8px;
        }

        .guideline-card p {
          font-size: 0.875rem;
          color: var(--md-sys-color-on-surface-variant);
          line-height: 1.5;
          margin-bottom: 16px;
        }

        .example-stack {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .layer {
          padding: 8px 12px;
          font-size: 0.75rem;
          font-weight: 500;
          border-radius: 4px;
          color: var(--md-sys-color-on-surface);
        }

        .text-example {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .text-example div {
          font-size: 0.875rem;
          font-weight: 500;
        }

        .border-example {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .border-example div {
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 0.75rem;
          color: var(--md-sys-color-on-surface);
          background: var(--md-sys-color-surface);
        }

        .button-example {
          display: flex;
          justify-content: flex-start;
        }

        .button-example button {
          font-family: inherit;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: opacity var(--md-sys-motion-duration-short1) var(--md-sys-motion-easing-standard);
        }

        .button-example button:hover {
          opacity: 0.9;
        }

        @media (max-width: 768px) {
          .color-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          }
          
          .guidelines-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  )
}
