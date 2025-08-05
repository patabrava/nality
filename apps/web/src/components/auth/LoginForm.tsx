'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

const styles = `
  :root {
    /* Material Design 3 Monochromatic Theme */
    --md-sys-color-primary: #ffffff;
    --md-sys-color-on-primary: #000000;
    --md-sys-color-primary-container: #1a1a1a;
    --md-sys-color-on-primary-container: #ffffff;
    
    --md-sys-color-secondary: #e5e5e5;
    --md-sys-color-on-secondary: #000000;
    --md-sys-color-secondary-container: #2a2a2a;
    --md-sys-color-on-secondary-container: #e5e5e5;
    
    --md-sys-color-surface: #0a0a0a;
    --md-sys-color-surface-dim: #000000;
    --md-sys-color-surface-bright: #1a1a1a;
    --md-sys-color-surface-container-lowest: #000000;
    --md-sys-color-surface-container-low: #0f0f0f;
    --md-sys-color-surface-container: #1a1a1a;
    --md-sys-color-surface-container-high: #2a2a2a;
    --md-sys-color-surface-container-highest: #333333;
    
    --md-sys-color-on-surface: #ffffff;
    --md-sys-color-on-surface-variant: #cccccc;
    --md-sys-color-surface-variant: #1a1a1a;
    
    --md-sys-color-outline: #666666;
    --md-sys-color-outline-variant: #333333;
    
    --md-sys-color-background: #000000;
    --md-sys-color-on-background: #ffffff;
    
    --md-sys-color-error: #ffffff;
    --md-sys-color-on-error: #000000;
    --md-sys-color-error-container: #1a1a1a;
    --md-sys-color-on-error-container: #ffffff;
    
    /* Animation Tokens */
    --md-sys-motion-duration-short1: 100ms;
    --md-sys-motion-duration-short2: 200ms;
    --md-sys-motion-duration-medium1: 250ms;
    --md-sys-motion-duration-medium2: 300ms;
    --md-sys-motion-duration-long1: 400ms;
    --md-sys-motion-duration-long2: 500ms;
    
    --md-sys-motion-easing-standard: cubic-bezier(0.2, 0, 0, 1);
    --md-sys-motion-easing-emphasized: cubic-bezier(0.2, 0, 0, 1);
    --md-sys-motion-easing-decelerated: cubic-bezier(0, 0, 0, 1);
    --md-sys-motion-easing-accelerated: cubic-bezier(0.3, 0, 1, 1);
  }

  .login-container {
    min-height: 100vh;
    background-color: var(--md-sys-color-background);
    color: var(--md-sys-color-on-background);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    font-family: 'Roboto', system-ui, sans-serif;
    position: relative;
    overflow: hidden;
  }

  .login-container::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.02) 1px, transparent 1px);
    background-size: 40px 40px;
    animation: float var(--md-sys-motion-duration-long2) ease-in-out infinite alternate;
  }

  .login-card {
    width: 100%;
    max-width: 480px;
    background: var(--md-sys-color-surface-container);
    border-radius: 28px;
    padding: 48px 32px;
    border: 1px solid var(--md-sys-color-outline-variant);
    position: relative;
    z-index: 1;
    animation: fadeInUp var(--md-sys-motion-duration-long1) var(--md-sys-motion-easing-decelerated);
    backdrop-filter: blur(20px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  .login-header {
    text-align: center;
    margin-bottom: 48px;
    position: relative;
  }

  .login-title {
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 700;
    color: var(--md-sys-color-on-surface);
    margin-bottom: 16px;
    line-height: 1.2;
    animation: fadeInScale var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized);
  }

  .login-subtitle {
    font-size: clamp(1rem, 3vw, 1.25rem);
    color: var(--md-sys-color-on-surface-variant);
    opacity: 0.8;
    line-height: 1.5;
    animation: fadeInUp var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard) 100ms both;
  }

  .login-form {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .input-group {
    position: relative;
  }

  .input-label {
    display: block;
    font-size: 1rem;
    font-weight: 500;
    color: var(--md-sys-color-on-surface);
    margin-bottom: 12px;
    transition: color var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
  }

  .input-field {
    width: 100%;
    height: 56px;
    padding: 16px 20px;
    background: var(--md-sys-color-surface-container-high);
    color: var(--md-sys-color-on-surface);
    border: 2px solid var(--md-sys-color-outline-variant);
    border-radius: 16px;
    font-size: 16px;
    font-family: inherit;
    transition: all var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard);
    outline: none;
    position: relative;
  }

  .input-field::placeholder {
    color: var(--md-sys-color-on-surface-variant);
    opacity: 0.6;
  }

  .input-field:focus {
    border-color: var(--md-sys-color-primary);
    background: var(--md-sys-color-surface-container-highest);
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
  }

  .input-field:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .error-container {
    padding: 16px 20px;
    background: var(--md-sys-color-error-container);
    border: 1px solid var(--md-sys-color-outline);
    border-radius: 12px;
    animation: shake var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized);
  }

  .error-text {
    color: var(--md-sys-color-on-error-container);
    font-size: 14px;
    line-height: 1.4;
    margin: 0;
  }

  .submit-button {
    width: 100%;
    height: 56px;
    padding: 16px 24px;
    background: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
    border: none;
    border-radius: 16px;
    font-size: 16px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: all var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard);
    position: relative;
    overflow: hidden;
  }

  .submit-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    transition: left var(--md-sys-motion-duration-long1) var(--md-sys-motion-easing-standard);
  }

  .submit-button:hover:not(:disabled) {
    background: var(--md-sys-color-secondary);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }

  .submit-button:hover:not(:disabled)::before {
    left: 100%;
  }

  .submit-button:active:not(:disabled) {
    transform: translateY(-1px);
    transition-duration: var(--md-sys-motion-duration-short1);
  }

  .submit-button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }

  .secondary-button {
    width: 100%;
    height: 56px;
    padding: 16px 24px;
    background: transparent;
    color: var(--md-sys-color-primary);
    border: 2px solid var(--md-sys-color-outline);
    border-radius: 16px;
    font-size: 16px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: all var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard);
  }

  .secondary-button:hover {
    background: var(--md-sys-color-surface-container-high);
    border-color: var(--md-sys-color-primary);
    transform: translateY(-1px);
  }

  .login-footer {
    margin-top: 32px;
    text-align: center;
  }

  .footer-text {
    color: var(--md-sys-color-on-surface-variant);
    font-size: 14px;
    line-height: 1.5;
    opacity: 0.8;
  }

  .email-highlight {
    color: var(--md-sys-color-primary);
    font-weight: 600;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(24px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes float {
    from {
      transform: translateY(0px);
    }
    to {
      transform: translateY(-10px);
    }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }

  @media (max-width: 640px) {
    .login-card {
      padding: 32px 24px;
      margin: 16px;
      border-radius: 20px;
    }
    
    .login-title {
      font-size: 2rem;
    }
    
    .login-subtitle {
      font-size: 1rem;
    }
  }
`

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { signInWithEmail, loading, error } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) return
    
    const { error } = await signInWithEmail(email)
    
    if (!error) {
      setIsSubmitted(true)
    }
  }

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  if (isSubmitted) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <h1 className="login-title">Check Your Email</h1>
              <p className="login-subtitle">
                We&apos;ve sent a magic link to <span className="email-highlight">{email}</span>
              </p>
              <p className="footer-text" style={{ marginTop: '16px' }}>
                Click the link in your email to sign in to Nality
              </p>
            </div>
            
            <button
              onClick={() => {
                setIsSubmitted(false)
                setEmail('')
              }}
              className="secondary-button"
            >
              Try Different Email
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">Welcome to Nality</h1>
            <p className="login-subtitle">
              Your life story, beautifully preserved
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label htmlFor="email" className="input-label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="input-field"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="error-container">
                <p className="error-text">
                  {error.message || 'Something went wrong. Please try again.'}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim() || !isValidEmail(email)}
              className="submit-button"
            >
              {loading ? 'Sending Magic Link...' : 'Continue with Email'}
            </button>
          </form>

          <div className="login-footer">
            <p className="footer-text">
              We&apos;ll send you a secure link to sign in.<br />
              No passwords required.
            </p>
          </div>
        </div>
      </div>
    </>
  )
} 