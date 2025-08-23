'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

// Disable static generation for this page
export const dynamic = 'force-dynamic'

export default function ProfilePage() {
  const { user, signOut, loading } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (!error) {
      router.push('/')
    }
  }

  return (
    <>
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-header">
            <h1 className="profile-title">Profile</h1>
            <p className="profile-subtitle">
              Manage your Nality account
            </p>
          </div>

          <div className="profile-info-card">
            <h2 className="card-title">Account Information</h2>
            
            <div className="account-info-grid">
              <div className="info-field">
                <label className="info-label">
                  Email Address
                </label>
                <div className="info-value">
                  {user?.email || 'Not available'}
                </div>
              </div>

              <div className="info-field">
                <label className="info-label">
                  User ID
                </label>
                <div className="info-value info-value-mono">
                  {user?.id || 'Not available'}
                </div>
              </div>

              <div className="info-field">
                <label className="info-label">
                  Account Created
                </label>
                <div className="info-value">
                  {user?.created_at 
                    ? new Date(user.created_at).toLocaleDateString()
                    : 'Not available'
                  }
                </div>
              </div>
            </div>
          </div>

          <div className="profile-actions-card">
            <h2 className="card-title">Account Actions</h2>
            
            <div className="actions-grid">
              <button
                onClick={handleSignOut}
                className="sign-out-button"
                disabled={loading}
              >
                {loading ? 'Signing Out...' : 'Sign Out'}
              </button>
              
              <p className="action-description">
                You&apos;ll be redirected to the home page after signing out.
              </p>
            </div>
          </div>

          <div className="profile-navigation">
            <button
              onClick={() => router.push('/dash')}
              className="back-button"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .profile-page {
          min-height: 100vh;
          background-color: var(--md-sys-color-background);
          color: var(--md-sys-color-on-background);
          padding: 24px 16px;
          font-family: 'Roboto', system-ui, sans-serif;
        }

        .profile-container {
          max-width: 768px;
          margin: 0 auto;
          animation: fadeInUp var(--md-sys-motion-duration-long1, 400ms) var(--md-sys-motion-easing-decelerated, cubic-bezier(0, 0, 0, 1));
        }

        .profile-header {
          margin-bottom: 32px;
          text-align: center;
        }

        .profile-title {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 700;
          color: var(--md-sys-color-on-background);
          margin-bottom: 8px;
          line-height: 1.2;
        }

        .profile-subtitle {
          font-size: 1.125rem;
          color: var(--md-sys-color-on-surface-variant);
          font-weight: 400;
          opacity: 0.8;
        }

        .profile-info-card,
        .profile-actions-card {
          background: var(--md-sys-color-surface-container);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
          border: 1px solid var(--md-sys-color-outline-variant);
          transition: all var(--md-sys-motion-duration-medium1, 250ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        .profile-info-card:hover,
        .profile-actions-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          border-color: var(--md-sys-color-outline);
        }

        .card-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 20px;
          line-height: 1.3;
        }

        .account-info-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .info-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .info-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--md-sys-color-on-surface-variant);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-value {
          font-size: 1.125rem;
          color: var(--md-sys-color-on-surface);
          font-weight: 400;
          padding: 12px 16px;
          background: var(--md-sys-color-surface-container-high);
          border-radius: 8px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .info-value-mono {
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          color: var(--md-sys-color-on-surface-variant);
        }

        .actions-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .sign-out-button {
          width: 100%;
          height: 48px;
          background-color: var(--md-sys-color-error-container);
          color: var(--md-sys-color-on-error-container);
          border: none;
          border-radius: 24px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .sign-out-button:hover {
          background-color: var(--md-sys-color-error);
          color: var(--md-sys-color-on-error);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .sign-out-button:active {
          transform: scale(0.98);
        }

        .sign-out-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .sign-out-button:focus-visible {
          outline: 2px solid var(--md-sys-color-on-surface);
          outline-offset: 2px;
        }

        .action-description {
          font-size: 0.875rem;
          color: var(--md-sys-color-on-surface-variant);
          text-align: center;
          opacity: 0.8;
        }

        .profile-navigation {
          text-align: center;
          margin-top: 32px;
        }

        .back-button {
          background: transparent;
          border: none;
          color: var(--md-sys-color-primary);
          font-size: 1rem;
          cursor: pointer;
          padding: 8px 16px;
          border-radius: 8px;
          transition: all var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        .back-button:hover {
          background: var(--md-sys-color-surface-container-high);
          color: var(--md-sys-color-on-surface);
          transform: translateX(-2px);
        }

        .back-button:focus-visible {
          outline: 2px solid var(--md-sys-color-on-surface);
          outline-offset: 2px;
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

        @media (max-width: 768px) {
          .profile-page {
            padding: 16px 12px;
          }

          .profile-container {
            max-width: 100%;
          }

          .profile-title {
            font-size: 2rem;
          }

          .profile-subtitle {
            font-size: 1rem;
          }

          .profile-info-card,
          .profile-actions-card {
            padding: 20px;
            margin-bottom: 20px;
          }

          .info-value {
            font-size: 1rem;
            padding: 10px 14px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .profile-container {
            animation: none;
          }

          .profile-info-card,
          .profile-actions-card,
          .sign-out-button,
          .back-button {
            transition: none;
          }

          .profile-info-card:hover,
          .profile-actions-card:hover,
          .sign-out-button:hover,
          .back-button:hover {
            transform: none;
          }
        }
      `}</style>
    </>
  )
}