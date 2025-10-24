'use client';

import React, { useState } from 'react';
import { designTokens } from '../../lib/design-tokens';
import { useDesignTokens, createSpacingStyles, createTypographyStyles, createButtonStyles } from '../../lib/design-token-utils';

export default function StyleguideTokens() {
  const tokens = useDesignTokens();
  const [activeTab, setActiveTab] = useState('colors');

  return (
    <div className="styleguide-section">
      {/* Header */}
      <div className="section-header">
        <h2>Design Tokens</h2>
        <p>Central source of truth for all design values in the system</p>
      </div>

      {/* Navigation Tabs */}
      <div className="token-tabs">
        {['colors', 'spacing', 'typography', 'shadows', 'animations', 'utilities'].map((tab) => (
          <button
            key={tab}
            className={`token-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            style={createButtonStyles({ variant: activeTab === tab ? 'primary' : 'text', size: 'small' })}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Color Tokens */}
      {activeTab === 'colors' && (
        <div className="token-section">
          <h3>Color System</h3>
          <p>Material Design 3 color tokens with dark theme support</p>
          
          <div className="color-grid">
            {/* Primary Colors */}
            <div className="color-group">
              <h4>Primary Colors</h4>
              <div className="color-palette">
                <div className="color-swatch">
                  <div className="color-preview" style={{ backgroundColor: tokens.colors.primary }}></div>
                  <div className="color-info">
                    <span className="color-name">Primary</span>
                    <span className="color-value">{tokens.colors.primary}</span>
                    <span className="color-token">--md-sys-color-primary</span>
                  </div>
                </div>
                <div className="color-swatch">
                  <div className="color-preview" style={{ backgroundColor: tokens.colors.onPrimary }}></div>
                  <div className="color-info">
                    <span className="color-name">On Primary</span>
                    <span className="color-value">{tokens.colors.onPrimary}</span>
                    <span className="color-token">--md-sys-color-on-primary</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Surface Colors */}
            <div className="color-group">
              <h4>Surface Colors</h4>
              <div className="color-palette">
                <div className="color-swatch">
                  <div className="color-preview" style={{ backgroundColor: tokens.colors.surface }}></div>
                  <div className="color-info">
                    <span className="color-name">Surface</span>
                    <span className="color-value">{tokens.colors.surface}</span>
                    <span className="color-token">--md-sys-color-surface</span>
                  </div>
                </div>
                <div className="color-swatch">
                  <div className="color-preview" style={{ backgroundColor: tokens.colors.surfaceContainer }}></div>
                  <div className="color-info">
                    <span className="color-name">Surface Container</span>
                    <span className="color-value">{tokens.colors.surfaceContainer}</span>
                    <span className="color-token">--md-sys-color-surface-container</span>
                  </div>
                </div>
                <div className="color-swatch">
                  <div className="color-preview" style={{ backgroundColor: tokens.colors.surfaceContainerHigh }}></div>
                  <div className="color-info">
                    <span className="color-name">Surface Container High</span>
                    <span className="color-value">{tokens.colors.surfaceContainerHigh}</span>
                    <span className="color-token">--md-sys-color-surface-container-high</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Utility Colors */}
            <div className="color-group">
              <h4>Utility Colors</h4>
              <div className="color-palette">
                <div className="color-swatch">
                  <div className="color-preview" style={{ backgroundColor: tokens.colors.error }}></div>
                  <div className="color-info">
                    <span className="color-name">Error</span>
                    <span className="color-value">{tokens.colors.error}</span>
                    <span className="color-token">--md-sys-color-error</span>
                  </div>
                </div>
                <div className="color-swatch">
                  <div className="color-preview" style={{ backgroundColor: tokens.colors.warning }}></div>
                  <div className="color-info">
                    <span className="color-name">Warning</span>
                    <span className="color-value">{tokens.colors.warning}</span>
                    <span className="color-token">--md-sys-color-warning</span>
                  </div>
                </div>
                <div className="color-swatch">
                  <div className="color-preview" style={{ backgroundColor: tokens.colors.success }}></div>
                  <div className="color-info">
                    <span className="color-name">Success</span>
                    <span className="color-value">{tokens.colors.success}</span>
                    <span className="color-token">--md-sys-color-success</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spacing Tokens */}
      {activeTab === 'spacing' && (
        <div className="token-section">
          <h3>Spacing System</h3>
          <p>4px base unit spacing scale for consistent layout rhythm</p>
          
          <div className="spacing-grid">
            {Object.entries(tokens.spacing).map(([key, value]) => {
              if (typeof value === 'string') {
                return (
                  <div key={key} className="spacing-item">
                    <div className="spacing-visual">
                      <div 
                        className="spacing-block" 
                        style={{ 
                          width: value, 
                          height: value,
                          backgroundColor: 'var(--md-sys-color-primary)',
                          borderRadius: 'var(--md-sys-border-radius-xs)'
                        }}
                      ></div>
                    </div>
                    <div className="spacing-info">
                      <span className="spacing-name">{key}</span>
                      <span className="spacing-value">{value}</span>
                      <span className="spacing-token">--md-sys-spacing-{key}</span>
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>

          <div className="spacing-examples">
            <h4>Usage Examples</h4>
            <div className="example-grid">
              <div className="example-item">
                <div className="example-visual" style={createSpacingStyles({ padding: 'lg', gap: 'md' })}>
                  <div className="example-box">Box 1</div>
                  <div className="example-box">Box 2</div>
                </div>
                <code>createSpacingStyles({{ padding: 'lg', gap: 'md' }})</code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Typography Tokens */}
      {activeTab === 'typography' && (
        <div className="token-section">
          <h3>Typography System</h3>
          <p>Responsive typography scale with Roboto font family</p>
          
          <div className="typography-grid">
            {Object.entries(tokens.typography.fontSize).map(([key, value]) => (
              <div key={key} className="typography-item">
                <div className="typography-preview" style={{ fontSize: value }}>
                  The quick brown fox jumps over the lazy dog
                </div>
                <div className="typography-info">
                  <span className="typography-name">{key}</span>
                  <span className="typography-value">{value}</span>
                  <span className="typography-token">--md-sys-typography-font-size-{key}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="typography-weights">
            <h4>Font Weights</h4>
            <div className="weight-grid">
              {Object.entries(tokens.typography.fontWeight).map(([key, value]) => (
                <div key={key} className="weight-item">
                  <div className="weight-preview" style={{ fontWeight: value }}>
                    {key.charAt(0).toUpperCase() + key.slice(1)} Weight
                  </div>
                  <span className="weight-value">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="typography-examples">
            <h4>Usage Examples</h4>
            <div className="example-item">
              <div 
                className="example-text" 
                style={createTypographyStyles({ 
                  size: 'xl', 
                  weight: 'semibold', 
                  lineHeight: 'tight',
                  color: 'primary'
                })}
              >
                Example heading with utility function
              </div>
              <code>createTypographyStyles({{ size: 'xl', weight: 'semibold', lineHeight: 'tight' }})</code>
            </div>
          </div>
        </div>
      )}

      {/* Shadow Tokens */}
      {activeTab === 'shadows' && (
        <div className="token-section">
          <h3>Shadow System</h3>
          <p>Elevation shadows for depth and layering</p>
          
          <div className="shadow-grid">
            {Object.entries(tokens.shadows).map(([key, value]) => {
              if (key.startsWith('elevation')) {
                return (
                  <div key={key} className="shadow-item">
                    <div 
                      className="shadow-preview"
                      style={{
                        backgroundColor: 'var(--md-sys-color-surface-container)',
                        boxShadow: value,
                        borderRadius: 'var(--md-sys-border-radius-lg)',
                        padding: 'var(--md-sys-spacing-lg)',
                        border: '1px solid var(--md-sys-color-outline-variant)'
                      }}
                    >
                      Shadow Preview
                    </div>
                    <div className="shadow-info">
                      <span className="shadow-name">{key}</span>
                      <span className="shadow-value">{value}</span>
                      <span className="shadow-token">--md-sys-shadow-{key}</span>
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}

      {/* Animation Tokens */}
      {activeTab === 'animations' && (
        <div className="token-section">
          <h3>Animation System</h3>
          <p>Motion tokens for consistent timing and easing</p>
          
          <div className="animation-section">
            <h4>Duration Tokens</h4>
            <div className="duration-grid">
              {Object.entries(tokens.animations.duration).map(([key, value]) => (
                <div key={key} className="duration-item">
                  <div className="duration-info">
                    <span className="duration-name">{key}</span>
                    <span className="duration-value">{value}</span>
                    <span className="duration-token">--md-sys-motion-duration-{key}</span>
                  </div>
                </div>
              ))}
            </div>

            <h4>Easing Functions</h4>
            <div className="easing-grid">
              {Object.entries(tokens.animations.easing).map(([key, value]) => (
                <div key={key} className="easing-item">
                  <div className="easing-info">
                    <span className="easing-name">{key}</span>
                    <span className="easing-value">{value}</span>
                    <span className="easing-token">--md-sys-motion-easing-{key}</span>
                  </div>
                </div>
              ))}
            </div>

            <h4>Animation Examples</h4>
            <div className="animation-examples">
              <div className="animation-demo">
                <div 
                  className="demo-box"
                  style={{
                    transition: 'all var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard)',
                    backgroundColor: 'var(--md-sys-color-primary)',
                    borderRadius: 'var(--md-sys-border-radius-md)',
                    padding: 'var(--md-sys-spacing-lg)',
                    color: 'var(--md-sys-color-on-primary)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.backgroundColor = 'var(--md-sys-color-secondary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.backgroundColor = 'var(--md-sys-color-primary)';
                  }}
                >
                  Hover me for animation
                </div>
                <code>transition: all var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard)</code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Utility Classes */}
      {activeTab === 'utilities' && (
        <div className="token-section">
          <h3>Utility Classes</h3>
          <p>Pre-built CSS classes for rapid development</p>
          
          <div className="utility-sections">
            <div className="utility-group">
              <h4>Spacing Utilities</h4>
              <div className="utility-examples">
                <div className="utility-example">
                  <div className="p-lg bg-surface-container rounded-md">Padding Large</div>
                  <code>.p-lg</code>
                </div>
                <div className="utility-example">
                  <div className="m-xl bg-surface-container rounded-md">Margin XL</div>
                  <code>.m-xl</code>
                </div>
                <div className="utility-example">
                  <div className="gap-md flex">
                    <div className="bg-primary text-on-primary p-sm rounded-sm">Item 1</div>
                    <div className="bg-primary text-on-primary p-sm rounded-sm">Item 2</div>
                  </div>
                  <code>.gap-md</code>
                </div>
              </div>
            </div>

            <div className="utility-group">
              <h4>Typography Utilities</h4>
              <div className="utility-examples">
                <div className="utility-example">
                  <div className="text-xl font-bold">Large Bold Text</div>
                  <code>.text-xl .font-bold</code>
                </div>
                <div className="utility-example">
                  <div className="text-sm font-light leading-relaxed">Small light text with relaxed line height</div>
                  <code>.text-sm .font-light .leading-relaxed</code>
                </div>
              </div>
            </div>

            <div className="utility-group">
              <h4>Layout Utilities</h4>
              <div className="utility-examples">
                <div className="utility-example">
                  <div className="container-mobile">
                    <div className="bg-surface-container p-lg rounded-lg">Mobile Container</div>
                  </div>
                  <code>.container-mobile</code>
                </div>
                <div className="utility-example">
                  <div className="shadow-2 rounded-lg p-lg bg-surface-container">
                    Elevated Card
                  </div>
                  <code>.shadow-2 .rounded-lg</code>
                </div>
              </div>
            </div>
          </div>

          <div className="token-usage">
            <h4>React Hook Usage</h4>
            <div className="code-examples">
              <div className="code-example">
                <h5>Using Design Tokens Hook</h5>
                <pre><code>{`import { useDesignTokens } from 'lib/design-token-utils';

function MyComponent() {
  const tokens = useDesignTokens();
  
  return (
    <div style={{ 
      color: tokens.colors.primary,
      padding: tokens.spacing.lg 
    }}>
      Component with design tokens
    </div>
  );
}`}</code></pre>
              </div>

              <div className="code-example">
                <h5>Using Style Generator Functions</h5>
                <pre><code>{`import { createButtonStyles, createSpacingStyles } from 'lib/design-token-utils';

function MyButton() {
  return (
    <button 
      style={{
        ...createButtonStyles({ variant: 'primary', size: 'large' }),
        ...createSpacingStyles({ margin: 'lg' })
      }}
    >
      Styled Button
    </button>
  );
}`}</code></pre>
              </div>

              <div className="code-example">
                <h5>Using CSS Custom Properties</h5>
                <pre><code>{`.my-component {
  background-color: var(--md-sys-color-surface-container);
  padding: var(--md-sys-spacing-lg);
  border-radius: var(--md-sys-border-radius-md);
  box-shadow: var(--md-sys-shadow-elevation2);
  transition: all var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard);
}`}</code></pre>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .styleguide-section {
          padding: var(--md-sys-spacing-3xl);
          background: var(--md-sys-color-surface);
          border-radius: var(--md-sys-border-radius-lg);
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .section-header {
          margin-bottom: var(--md-sys-spacing-3xl);
        }

        .section-header h2 {
          color: var(--md-sys-color-on-surface);
          font-size: var(--md-sys-typography-font-size-3xl);
          font-weight: var(--md-sys-typography-font-weight-bold);
          margin-bottom: var(--md-sys-spacing-md);
        }

        .section-header p {
          color: var(--md-sys-color-on-surface-variant);
          font-size: var(--md-sys-typography-font-size-lg);
        }

        .token-tabs {
          display: flex;
          gap: var(--md-sys-spacing-sm);
          margin-bottom: var(--md-sys-spacing-3xl);
          flex-wrap: wrap;
        }

        .token-tab {
          transition: all var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
        }

        .token-section {
          margin-top: var(--md-sys-spacing-2xl);
        }

        .token-section h3 {
          color: var(--md-sys-color-on-surface);
          font-size: var(--md-sys-typography-font-size-2xl);
          font-weight: var(--md-sys-typography-font-weight-semibold);
          margin-bottom: var(--md-sys-spacing-lg);
        }

        .token-section h4 {
          color: var(--md-sys-color-on-surface);
          font-size: var(--md-sys-typography-font-size-xl);
          font-weight: var(--md-sys-typography-font-weight-medium);
          margin: var(--md-sys-spacing-2xl) 0 var(--md-sys-spacing-lg) 0;
        }

        .color-grid, .spacing-grid, .typography-grid, .shadow-grid {
          display: grid;
          gap: var(--md-sys-spacing-2xl);
          margin-bottom: var(--md-sys-spacing-3xl);
        }

        .color-group {
          background: var(--md-sys-color-surface-container);
          border-radius: var(--md-sys-border-radius-lg);
          padding: var(--md-sys-spacing-2xl);
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .color-palette {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--md-sys-spacing-lg);
        }

        .color-swatch {
          display: flex;
          align-items: center;
          gap: var(--md-sys-spacing-md);
        }

        .color-preview {
          width: 48px;
          height: 48px;
          border-radius: var(--md-sys-border-radius-md);
          border: 2px solid var(--md-sys-color-outline-variant);
          flex-shrink: 0;
        }

        .color-info {
          display: flex;
          flex-direction: column;
          gap: var(--md-sys-spacing-xs);
        }

        .color-name {
          font-weight: var(--md-sys-typography-font-weight-medium);
          color: var(--md-sys-color-on-surface);
        }

        .color-value {
          font-family: var(--md-sys-typography-font-family-mono);
          font-size: var(--md-sys-typography-font-size-sm);
          color: var(--md-sys-color-on-surface-variant);
        }

        .color-token {
          font-family: var(--md-sys-typography-font-family-mono);
          font-size: var(--md-sys-typography-font-size-xs);
          color: var(--md-sys-color-tertiary);
        }

        .spacing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: var(--md-sys-spacing-lg);
        }

        .spacing-item {
          background: var(--md-sys-color-surface-container);
          border-radius: var(--md-sys-border-radius-lg);
          padding: var(--md-sys-spacing-lg);
          border: 1px solid var(--md-sys-color-outline-variant);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--md-sys-spacing-md);
        }

        .spacing-visual {
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .spacing-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--md-sys-spacing-xs);
          text-align: center;
        }

        .spacing-name {
          font-weight: var(--md-sys-typography-font-weight-medium);
          color: var(--md-sys-color-on-surface);
        }

        .spacing-value {
          font-family: var(--md-sys-typography-font-family-mono);
          font-size: var(--md-sys-typography-font-size-sm);
          color: var(--md-sys-color-on-surface-variant);
        }

        .spacing-token {
          font-family: var(--md-sys-typography-font-family-mono);
          font-size: var(--md-sys-typography-font-size-xs);
          color: var(--md-sys-color-tertiary);
        }

        .typography-grid {
          display: grid;
          gap: var(--md-sys-spacing-lg);
        }

        .typography-item {
          background: var(--md-sys-color-surface-container);
          border-radius: var(--md-sys-border-radius-lg);
          padding: var(--md-sys-spacing-lg);
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .typography-preview {
          color: var(--md-sys-color-on-surface);
          margin-bottom: var(--md-sys-spacing-md);
          font-family: var(--md-sys-typography-font-family-primary);
        }

        .typography-info {
          display: flex;
          gap: var(--md-sys-spacing-lg);
          flex-wrap: wrap;
        }

        .typography-name {
          font-weight: var(--md-sys-typography-font-weight-medium);
          color: var(--md-sys-color-on-surface);
          min-width: 80px;
        }

        .typography-value {
          font-family: var(--md-sys-typography-font-family-mono);
          font-size: var(--md-sys-typography-font-size-sm);
          color: var(--md-sys-color-on-surface-variant);
        }

        .typography-token {
          font-family: var(--md-sys-typography-font-family-mono);
          font-size: var(--md-sys-typography-font-size-xs);
          color: var(--md-sys-color-tertiary);
        }

        .example-grid {
          display: grid;
          gap: var(--md-sys-spacing-lg);
          margin-top: var(--md-sys-spacing-lg);
        }

        .example-item {
          background: var(--md-sys-color-surface-container);
          border-radius: var(--md-sys-border-radius-lg);
          padding: var(--md-sys-spacing-lg);
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .example-visual {
          display: flex;
          margin-bottom: var(--md-sys-spacing-md);
        }

        .example-box {
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
          padding: var(--md-sys-spacing-md);
          border-radius: var(--md-sys-border-radius-sm);
        }

        .shadow-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--md-sys-spacing-2xl);
        }

        .shadow-item {
          display: flex;
          flex-direction: column;
          gap: var(--md-sys-spacing-lg);
        }

        .shadow-preview {
          text-align: center;
          color: var(--md-sys-color-on-surface);
        }

        .shadow-info {
          display: flex;
          flex-direction: column;
          gap: var(--md-sys-spacing-xs);
        }

        .shadow-name {
          font-weight: var(--md-sys-typography-font-weight-medium);
          color: var(--md-sys-color-on-surface);
        }

        .shadow-value {
          font-family: var(--md-sys-typography-font-family-mono);
          font-size: var(--md-sys-typography-font-size-sm);
          color: var(--md-sys-color-on-surface-variant);
        }

        .shadow-token {
          font-family: var(--md-sys-typography-font-family-mono);
          font-size: var(--md-sys-typography-font-size-xs);
          color: var(--md-sys-color-tertiary);
        }

        .utility-sections {
          display: grid;
          gap: var(--md-sys-spacing-3xl);
        }

        .utility-group {
          background: var(--md-sys-color-surface-container);
          border-radius: var(--md-sys-border-radius-lg);
          padding: var(--md-sys-spacing-2xl);
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .utility-examples {
          display: grid;
          gap: var(--md-sys-spacing-lg);
        }

        .utility-example {
          display: flex;
          flex-direction: column;
          gap: var(--md-sys-spacing-md);
        }

        .code-examples {
          display: grid;
          gap: var(--md-sys-spacing-2xl);
        }

        .code-example {
          background: var(--md-sys-color-surface-container);
          border-radius: var(--md-sys-border-radius-lg);
          padding: var(--md-sys-spacing-lg);
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .code-example h5 {
          color: var(--md-sys-color-on-surface);
          font-size: var(--md-sys-typography-font-size-lg);
          font-weight: var(--md-sys-typography-font-weight-medium);
          margin-bottom: var(--md-sys-spacing-md);
        }

        code {
          font-family: var(--md-sys-typography-font-family-mono);
          font-size: var(--md-sys-typography-font-size-sm);
          color: var(--md-sys-color-tertiary);
          background: var(--md-sys-color-surface-container-high);
          padding: var(--md-sys-spacing-xs) var(--md-sys-spacing-sm);
          border-radius: var(--md-sys-border-radius-xs);
        }

        pre {
          background: var(--md-sys-color-surface-container-high);
          border-radius: var(--md-sys-border-radius-md);
          padding: var(--md-sys-spacing-lg);
          overflow-x: auto;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        pre code {
          background: none;
          padding: 0;
          color: var(--md-sys-color-on-surface);
        }

        @media (max-width: 768px) {
          .token-tabs {
            flex-direction: column;
          }
          
          .color-palette {
            grid-template-columns: 1fr;
          }
          
          .spacing-grid {
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          }
          
          .shadow-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
