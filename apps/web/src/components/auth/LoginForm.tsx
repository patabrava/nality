'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Inter:wght@200;300;400;500&family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400&display=swap');

  :root {
    /* Design Preview Color Scheme */
    --bg-color: #050505;
    --text-color: #e0e0e0;
    --accent-gold: #D4AF37;
    --accent-gold-dim: #8a7020;
    --surface-color: #0f0f0f;
    --border-color: rgba(255, 255, 255, 0.08);
    
    /* Material Design 3 Compatible Variables */
    --md-sys-color-primary: #D4AF37;
    --md-sys-color-on-primary: #000000;
    --md-sys-color-primary-container: #1a1a1a;
    --md-sys-color-on-primary-container: #D4AF37;
    
    --md-sys-color-secondary: #e5e5e5;
    --md-sys-color-on-secondary: #000000;
    --md-sys-color-secondary-container: #2a2a2a;
    --md-sys-color-on-secondary-container: #e5e5e5;
    
    --md-sys-color-surface: #050505;
    --md-sys-color-surface-dim: #000000;
    --md-sys-color-surface-bright: #1a1a1a;
    --md-sys-color-surface-container-lowest: #000000;
    --md-sys-color-surface-container-low: #0f0f0f;
    --md-sys-color-surface-container: rgba(20, 20, 20, 0.4);
    --md-sys-color-surface-container-high: #2a2a2a;
    --md-sys-color-surface-container-highest: #333333;
    
    --md-sys-color-on-surface: #e0e0e0;
    --md-sys-color-on-surface-variant: #a0a0a0;
    --md-sys-color-surface-variant: #1a1a1a;
    
    --md-sys-color-outline: rgba(255, 255, 255, 0.15);
    --md-sys-color-outline-variant: rgba(255, 255, 255, 0.08);
    
    --md-sys-color-background: #050505;
    --md-sys-color-on-background: #e0e0e0;
    
    --md-sys-color-error: #ff4444;
    --md-sys-color-on-error: #000000;
    --md-sys-color-error-container: rgba(255, 68, 68, 0.1);
    --md-sys-color-on-error-container: #ff4444;
    
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
    background-color: var(--bg-color);
    color: var(--text-color);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    font-family: 'Inter', sans-serif;
    position: relative;
    overflow: hidden;
    -webkit-font-smoothing: antialiased;
  }

  /* Grain Overlay */
  .login-container::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
    opacity: 0.04;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  }

  .login-card {
    width: 100%;
    max-width: 480px;
    background: rgba(20, 20, 20, 0.4);
    backdrop-filter: blur(20px);
    border-radius: 4px;
    padding: 48px 32px;
    border: 1px solid rgba(255, 255, 255, 0.05);
    position: relative;
    z-index: 10;
    animation: fadeInUp var(--md-sys-motion-duration-long1) var(--md-sys-motion-easing-decelerated);
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
    padding: 20px 16px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    color: var(--text-color);
    font-size: 16px;
    font-family: 'Inter', sans-serif;
    font-weight: 400;
    transition: all var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard);
    outline: none;
  }

  .input-field:focus {
    border-color: var(--accent-gold);
    background: rgba(255, 255, 255, 0.05);
    box-shadow: 0 0 0 1px var(--accent-gold);
  }

  .input-field::placeholder {
    color: var(--md-sys-color-on-surface-variant);
    opacity: 0.7;
  }

  .input-field:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
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
    background: var(--accent-gold);
    color: var(--bg-color);
    border: 1px solid var(--accent-gold);
    border-radius: 4px;
    font-size: 16px;
    font-weight: 500;
    font-family: 'Inter', sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    cursor: pointer;
    transition: all 0.4s ease;
    position: relative;
    overflow: hidden;
  }

  .submit-button:hover:not(:disabled) {
    background: transparent;
    color: var(--accent-gold);
    transform: translateY(-1px);
  }

  .submit-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
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
    color: var(--accent-gold);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 16px;
    font-weight: 500;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: all var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard);
  }

  .secondary-button:hover {
    border-color: var(--accent-gold);
    background: rgba(212, 175, 55, 0.1);
    transform: translateY(-1px);
  }

  .auth-method-selector {
    display: flex;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
    padding: 4px;
    margin-bottom: 32px;
    border: 1px solid var(--border-color);
  }

  .auth-method-option {
    flex: 1;
    padding: 12px 16px;
    background: transparent;
    border: none;
    color: var(--md-sys-color-on-surface-variant);
    font-size: 14px;
    font-weight: 500;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    border-radius: 2px;
    transition: all var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
  }

  .auth-method-option.active {
    background: var(--accent-gold);
    color: var(--bg-color);
  }

  .password-input-container {
    position: relative;
  }

  .password-toggle {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--md-sys-color-on-surface-variant);
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: color var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
  }

  .password-toggle:hover {
    color: var(--md-sys-color-primary);
  }

  .password-requirements {
    margin-top: 8px;
    padding: 12px;
    background: var(--md-sys-color-surface-container-low);
    border-radius: 8px;
    font-size: 12px;
  }

  .password-strength {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .strength-bar {
    flex: 1;
    height: 4px;
    background: var(--md-sys-color-surface-container-high);
    border-radius: 2px;
    overflow: hidden;
  }

  .strength-fill {
    height: 100%;
    transition: width var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard);
  }

  .requirement-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--md-sys-color-on-surface-variant);
    margin-bottom: 4px;
  }

  .requirement-item.met {
    color: var(--md-sys-color-primary);
  }

  .requirement-icon {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 1px solid currentColor;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 8px;
  }

  .requirement-icon.met {
    background: currentColor;
    color: var(--md-sys-color-on-primary);
  }

  .auth-toggle {
    text-align: center;
    margin-top: 16px;
  }

  .auth-toggle-text {
    color: var(--md-sys-color-on-surface-variant);
    font-size: 14px;
  }

  .auth-toggle-link {
    color: var(--md-sys-color-primary);
    text-decoration: none;
    font-weight: 500;
    cursor: pointer;
    transition: color var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
  }

  .auth-toggle-link:hover {
    color: var(--md-sys-color-secondary);
  }

  .oauth-separator {
    display: flex;
    align-items: center;
    margin: 24px 0;
    color: var(--md-sys-color-on-surface-variant);
    font-size: 14px;
  }

  .oauth-separator::before,
  .oauth-separator::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--md-sys-color-outline-variant);
  }

  .oauth-separator span {
    padding: 0 16px;
  }

  .oauth-buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .oauth-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 100%;
    height: 56px;
    padding: 16px 24px;
    background: transparent;
    color: var(--text-color);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 16px;
    font-weight: 500;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: all var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard);
    text-decoration: none;
  }

  .oauth-button:hover:not(:disabled) {
    border-color: var(--accent-gold);
    background: rgba(212, 175, 55, 0.1);
    transform: translateY(-1px);
  }

  .oauth-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .oauth-button.google {
    border-color: #ea4335;
  }

  .oauth-button.google:hover:not(:disabled) {
    border-color: #ea4335;
    background: rgba(234, 67, 53, 0.1);
  }



  .oauth-icon {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
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
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [authMethod, setAuthMethod] = useState<'magic-link' | 'password'>('password')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { signInWithEmail, signInWithPassword, signUpWithPassword, signInWithGoogle, loading, error, isAuthenticated } = useAuth()
  const router = useRouter()

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dash')
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) return
    
    let result
    
    if (authMethod === 'magic-link') {
      result = await signInWithEmail(email)
    } else {
      if (!password.trim()) return
      
      if (isSignUp) {
        result = await signUpWithPassword(email, password)
      } else {
        result = await signInWithPassword(email, password)
      }
    }
    
    if (!result.error) {
      if (authMethod === 'magic-link' || isSignUp) {
        setIsSubmitted(true)
      }
      // For password sign in, user will be redirected automatically by auth state change
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    const { error } = await signInWithGoogle()
    if (error) {
      setGoogleLoading(false)
    }
    // If successful, user will be redirected to Google OAuth
  }



  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const validatePassword = (password: string) => {
    const requirements = {
      minLength: password.length >= 8,
      hasLowerCase: /[a-z]/.test(password),
      hasUpperCase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password)
    }
    
    return {
      isValid: Object.values(requirements).every(Boolean),
      requirements
    }
  }

  const getPasswordStrength = (password: string) => {
    const validation = validatePassword(password)
    const score = Object.values(validation.requirements).filter(Boolean).length
    
    if (score < 2) return { strength: 'weak', color: '#ff4444' }
    if (score < 4) return { strength: 'medium', color: '#ffaa00' }
    return { strength: 'strong', color: '#00cc44' }
  }

  // Calculate if button should be disabled
  const isButtonDisabled = (() => {
    // Always disable if loading
    if (loading) return true
    
    // Always require valid email
    if (!email.trim() || !isValidEmail(email)) return true
    
    // For password auth, require password
    if (authMethod === 'password') {
      if (!password.trim()) return true
      // Only validate password strength for sign up, not sign in
      if (isSignUp && !validatePassword(password).isValid) return true
    }
    
    return false
  })()

  if (isSubmitted) {
    const isSignUpSuccess = authMethod === 'password' && isSignUp
    const isMagicLinkSent = authMethod === 'magic-link'
    
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <h1 className="login-title">
                {isSignUpSuccess ? 'Account Created!' : 'Check Your Email'}
              </h1>
              <p className="login-subtitle">
                {isSignUpSuccess 
                  ? `Welcome to Nality! We've sent a confirmation email to `
                  : `We've sent a magic link to `
                }
                <span className="email-highlight">{email}</span>
                {isSignUpSuccess 
                  ? '. Please verify your email address to complete your account setup.'
                  : ''
                }
              </p>
              <p className="footer-text" style={{ marginTop: '16px' }}>
                {isSignUpSuccess 
                  ? 'Click the link in your email to verify your account'
                  : 'Click the link in your email to sign in to Nality'
                }
              </p>
            </div>
            
            <button
              onClick={() => {
                setIsSubmitted(false)
                setEmail('')
                setPassword('')
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
            <h1 className="login-title">Welcome to <span className="serif-accent">Nality</span></h1>
            <p className="login-subtitle">
              Your life story, beautifully preserved
            </p>
          </div>

          {/* Authentication Method Selector */}
          <div className="auth-method-selector">
            <button
              type="button"
              className={`auth-method-option ${authMethod === 'password' ? 'active' : ''}`}
              onClick={() => setAuthMethod('password')}
            >
              Password
            </button>
            <button
              type="button"
              className={`auth-method-option ${authMethod === 'magic-link' ? 'active' : ''}`}
              onClick={() => setAuthMethod('magic-link')}
            >
              Magic Link
            </button>
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

            {authMethod === 'password' && (
              <div className="input-group">
                <label htmlFor="password" className="input-label">
                  Password
                </label>
                <div className="password-input-container">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isSignUp ? 'Create a password' : 'Enter your password'}
                    className="input-field"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                
                {isSignUp && password && (
                  <div className="password-requirements">
                    <div className="password-strength">
                      <span style={{ fontSize: '12px', fontWeight: '500' }}>
                        Password strength:
                      </span>
                      <div className="strength-bar">
                        <div 
                          className="strength-fill"
                          style={{
                            width: `${(Object.values(validatePassword(password).requirements).filter(Boolean).length / 4) * 100}%`,
                            backgroundColor: getPasswordStrength(password).color
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '12px', color: getPasswordStrength(password).color }}>
                        {getPasswordStrength(password).strength}
                      </span>
                    </div>
                    
                    <div>
                      {[
                        { key: 'minLength', text: 'At least 8 characters' },
                        { key: 'hasLowerCase', text: 'Lowercase letter' },
                        { key: 'hasUpperCase', text: 'Uppercase letter' },
                        { key: 'hasNumber', text: 'Number' }
                      ].map(({ key, text }) => {
                        const requirements = validatePassword(password).requirements
                        const isRequirementMet = requirements[key as keyof typeof requirements]
                        return (
                          <div key={key} className={`requirement-item ${isRequirementMet ? 'met' : ''}`}>
                            <div className={`requirement-icon ${isRequirementMet ? 'met' : ''}`}>
                              {isRequirementMet ? '✓' : ''}
                            </div>
                            <span>{text}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="error-container">
                <p className="error-text">
                  {error.message || 'Something went wrong. Please try again.'}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isButtonDisabled}
              className="submit-button"
            >
              {loading 
                ? (authMethod === 'magic-link' ? 'Sending Magic Link...' : (isSignUp ? 'Creating Account...' : 'Signing In...'))
                : (authMethod === 'magic-link' ? 'Continue with Email' : (isSignUp ? 'Create Account' : 'Sign In'))
              }
            </button>

            {authMethod === 'password' && (
              <div className="auth-toggle">
                <p className="auth-toggle-text">
                  {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                  <span 
                    className="auth-toggle-link"
                    onClick={() => setIsSignUp(!isSignUp)}
                  >
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </span>
                </p>
              </div>
            )}
          </form>

          {/* OAuth Section */}
          <div className="oauth-separator">
            <span>or continue with</span>
          </div>

          <div className="oauth-buttons">
            <button
              type="button"
              className="oauth-button google"
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading}
            >
              <div className="oauth-icon">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#ea4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              {googleLoading ? 'Connecting to Google...' : 'Continue with Google'}
            </button>


          </div>

          <div className="login-footer">
            <p className="footer-text">
              {authMethod === 'magic-link' 
                ? "We'll send you a secure link to sign in. No passwords required."
                : "Your account is protected with enterprise-grade security."
              }
            </p>
          </div>
        </div>
      </div>
    </>
  )
} 