import { ThemeToggle } from '@/components/theme/ThemeToggle'

export const metadata = {
  title: 'Theme Test - Nality',
  description: 'Test page for dark/light theme functionality',
  robots: { index: false, follow: false }
}

export default function ThemeTestPage() {
  return (
    <div style={{ 
      minHeight: '100vh',
      padding: '2rem',
      background: 'var(--md-sys-color-background)',
      color: 'var(--md-sys-color-on-background)'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <header style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '2rem',
          padding: '1rem',
          background: 'var(--md-sys-color-surface-container)',
          borderRadius: '12px'
        }}>
          <h1 style={{ margin: 0, color: 'var(--md-sys-color-on-surface)' }}>
            Theme System Test
          </h1>
          <ThemeToggle />
        </header>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {/* Color Tokens Test */}
          <section style={{ 
            padding: '1.5rem',
            background: 'var(--md-sys-color-surface)',
            borderRadius: '12px',
            border: '1px solid var(--md-sys-color-outline-variant)'
          }}>
            <h2 style={{ 
              color: 'var(--md-sys-color-primary)',
              marginBottom: '1rem'
            }}>
              Color Tokens
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ 
                padding: '1rem',
                background: 'var(--md-sys-color-primary-container)',
                color: 'var(--md-sys-color-on-primary-container)',
                borderRadius: '8px'
              }}>
                Primary Container
              </div>
              <div style={{ 
                padding: '1rem',
                background: 'var(--md-sys-color-secondary-container)',
                color: 'var(--md-sys-color-on-secondary-container)',
                borderRadius: '8px'
              }}>
                Secondary Container
              </div>
              <div style={{ 
                padding: '1rem',
                background: 'var(--md-sys-color-surface-container-high)',
                color: 'var(--md-sys-color-on-surface)',
                borderRadius: '8px'
              }}>
                Surface Container High
              </div>
            </div>
          </section>

          {/* Form Elements Test */}
          <section style={{ 
            padding: '1.5rem',
            background: 'var(--md-sys-color-surface)',
            borderRadius: '12px',
            border: '1px solid var(--md-sys-color-outline-variant)'
          }}>
            <h2 style={{ 
              color: 'var(--md-sys-color-primary)',
              marginBottom: '1rem'
            }}>
              Form Elements
            </h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <input 
                type="text" 
                placeholder="Test input field"
                className="form-input"
                style={{ width: '100%' }}
              />
              <textarea 
                placeholder="Test textarea"
                className="form-textarea"
                rows={3}
              />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="form-button primary">
                  Primary Button
                </button>
                <button className="form-button secondary">
                  Secondary Button
                </button>
              </div>
            </div>
          </section>

          {/* Typography Test */}
          <section style={{ 
            padding: '1.5rem',
            background: 'var(--md-sys-color-surface)',
            borderRadius: '12px',
            border: '1px solid var(--md-sys-color-outline-variant)'
          }}>
            <h2 style={{ 
              color: 'var(--md-sys-color-primary)',
              marginBottom: '1rem'
            }}>
              Typography
            </h2>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <h1 style={{ color: 'var(--md-sys-color-on-surface)', margin: 0 }}>
                Display Large (H1)
              </h1>
              <h2 style={{ color: 'var(--md-sys-color-on-surface)', margin: 0 }}>
                Display Medium (H2)
              </h2>
              <h3 style={{ color: 'var(--md-sys-color-on-surface)', margin: 0 }}>
                Display Small (H3)
              </h3>
              <p style={{ color: 'var(--md-sys-color-on-surface-variant)', margin: 0 }}>
                Body text using on-surface-variant color for secondary content.
              </p>
              <p style={{ color: 'var(--md-sys-color-on-surface)', margin: 0 }}>
                Primary body text using on-surface color for main content.
              </p>
            </div>
          </section>

          {/* Navigation Test */}
          <section style={{ 
            padding: '1.5rem',
            background: 'var(--md-sys-color-surface)',
            borderRadius: '12px',
            border: '1px solid var(--md-sys-color-outline-variant)'
          }}>
            <h2 style={{ 
              color: 'var(--md-sys-color-primary)',
              marginBottom: '1rem'
            }}>
              Navigation Elements
            </h2>
            <nav style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button className="nav-tab active">
                Active Tab
              </button>
              <button className="nav-tab">
                Inactive Tab
              </button>
              <button className="nav-tab">
                Another Tab
              </button>
            </nav>
          </section>

          {/* Utility Classes Test */}
          <section style={{ 
            padding: '1.5rem',
            background: 'var(--md-sys-color-surface)',
            borderRadius: '12px',
            border: '1px solid var(--md-sys-color-outline-variant)'
          }}>
            <h2 style={{ 
              color: 'var(--md-sys-color-primary)',
              marginBottom: '1rem'
            }}>
              Utility Classes
            </h2>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                background: 'var(--md-sys-color-surface-container-high)' 
              }}>
                <span style={{ color: 'var(--md-sys-color-on-surface)' }}>
                  Flex layout with utilities
                </span>
                <span style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                  →
                </span>
              </div>
              <div className="w-full h-full text-center" style={{ 
                background: 'var(--md-sys-color-surface-container)',
                padding: '2rem',
                borderRadius: '8px'
              }}>
                <span style={{ color: 'var(--md-sys-color-on-surface)' }}>
                  Full width centered content
                </span>
              </div>
            </div>
          </section>
        </div>

        <footer style={{ 
          marginTop: '2rem',
          padding: '1rem',
          textAlign: 'center',
          color: 'var(--md-sys-color-on-surface-variant)'
        }}>
          <a href="/" style={{ 
            color: 'var(--md-sys-color-primary)',
            textDecoration: 'none'
          }}>
            ← Back to Home
          </a>
        </footer>
      </div>
    </div>
  )
}
