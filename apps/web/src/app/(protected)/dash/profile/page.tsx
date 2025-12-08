'use client'

import { useAuth } from '@/hooks/useAuth'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useRouter } from 'next/navigation'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { User, Mail, Calendar, Shield, LogOut, ArrowLeft, Sparkles } from 'lucide-react'

// Disable static generation for this page
export const dynamic = 'force-dynamic'

export default function ProfilePage() {
  const { user, signOut, loading } = useAuth()
  const { profile, isLoading: profileLoading } = useUserProfile(user?.id)
  const router = useRouter()

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (!error) {
      router.push('/')
    }
  }

  const handleEditProfile = () => {
    // TODO: Navigate to profile edit page or open modal
    console.log('Edit profile clicked')
  }

  return (
    <>
      <div className="profile-page">
        <div className="profile-container">
          {/* Header with Avatar */}
          <div className="profile-header">
            <div className="avatar-container">
              <div className="avatar">
                <User size={48} strokeWidth={1.5} />
              </div>
              <div className="avatar-badge">
                <Sparkles size={16} />
              </div>
            </div>
            <h1 className="profile-title">
              {profile?.full_name || 'Mein Profil'}
            </h1>
            <p className="profile-subtitle">
              {user?.email || 'Verwalte dein Nality-Konto'}
            </p>
          </div>

          {/* Profile Attributes Card - Values, Influences, Motto */}
          {!profileLoading && profile && (
            <div className="profile-attributes-section">
              <ProfileCard
                user={{
                  full_name: profile.full_name,
                  birth_date: profile.birth_date,
                  birth_place: profile.birth_place,
                }}
                attributes={profile.attributes}
                onEdit={handleEditProfile}
              />
            </div>
          )}

          {/* Account Information Card */}
          <div className="profile-info-card">
            <div className="card-header">
              <Shield size={20} className="card-icon" />
              <h2 className="card-title">Kontoinformationen</h2>
            </div>
            
            <div className="account-info-grid">
              <div className="info-field">
                <div className="info-icon">
                  <Mail size={16} />
                </div>
                <div className="info-content">
                  <label className="info-label">E-Mail-Adresse</label>
                  <div className="info-value">{user?.email || 'Nicht verfügbar'}</div>
                </div>
              </div>

              <div className="info-field">
                <div className="info-icon">
                  <Calendar size={16} />
                </div>
                <div className="info-content">
                  <label className="info-label">Konto erstellt</label>
                  <div className="info-value">
                    {user?.created_at 
                      ? new Date(user.created_at).toLocaleDateString('de-DE', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'Nicht verfügbar'
                    }
                  </div>
                </div>
              </div>

              {profile?.birth_date && (
                <div className="info-field">
                  <div className="info-icon">
                    <Calendar size={16} />
                  </div>
                  <div className="info-content">
                    <label className="info-label">Geburtsdatum</label>
                    <div className="info-value">
                      {new Date(profile.birth_date).toLocaleDateString('de-DE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                      {profile.birth_place && ` in ${profile.birth_place}`}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions Card */}
          <div className="profile-actions-card">
            <button
              onClick={handleSignOut}
              className="sign-out-button"
              disabled={loading}
            >
              <LogOut size={18} />
              {loading ? 'Abmelden...' : 'Abmelden'}
            </button>
          </div>

          {/* Navigation */}
          <div className="profile-navigation">
            <button
              onClick={() => router.push('/dash')}
              className="back-button"
            >
              <ArrowLeft size={18} />
              Zurück zum Dashboard
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .profile-page {
          min-height: 100vh;
          background-color: var(--md-sys-color-background);
          color: var(--md-sys-color-on-background);
          padding: 32px 16px;
          font-family: 'Roboto', system-ui, sans-serif;
        }

        .profile-container {
          max-width: 640px;
          margin: 0 auto;
          animation: fadeInUp var(--md-sys-motion-duration-long1, 400ms) var(--md-sys-motion-easing-decelerated, cubic-bezier(0, 0, 0, 1));
        }

        /* Header with Avatar */
        .profile-header {
          margin-bottom: 32px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .avatar-container {
          position: relative;
          margin-bottom: 16px;
        }

        .avatar {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--md-sys-color-primary), var(--md-sys-color-tertiary));
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }

        .avatar-badge {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--md-sys-color-tertiary-container);
          color: var(--md-sys-color-on-tertiary-container);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid var(--md-sys-color-background);
        }

        .profile-title {
          font-size: clamp(1.5rem, 4vw, 2rem);
          font-weight: 700;
          color: var(--md-sys-color-on-background);
          margin: 0 0 4px 0;
          line-height: 1.2;
        }

        .profile-subtitle {
          font-size: 0.9375rem;
          color: var(--md-sys-color-on-surface-variant);
          font-weight: 400;
          margin: 0;
        }

        /* Profile Attributes Section */
        .profile-attributes-section {
          margin-bottom: 24px;
        }

        /* Info Card */
        .profile-info-card {
          background: var(--md-sys-color-surface-container);
          border-radius: 24px;
          padding: 24px;
          margin-bottom: 16px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          color: var(--md-sys-color-on-surface-variant);
        }

        .card-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .account-info-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .info-field {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .info-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: var(--md-sys-color-surface-container-high);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--md-sys-color-on-surface-variant);
          flex-shrink: 0;
        }

        .info-content {
          flex: 1;
          min-width: 0;
        }

        .info-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--md-sys-color-on-surface-variant);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }

        .info-value {
          font-size: 0.9375rem;
          color: var(--md-sys-color-on-surface);
          font-weight: 400;
          word-break: break-word;
        }

        /* Actions Card */
        .profile-actions-card {
          margin-bottom: 24px;
        }

        .sign-out-button {
          width: 100%;
          height: 48px;
          background-color: var(--md-sys-color-error-container);
          color: var(--md-sys-color-on-error-container);
          border: none;
          border-radius: 24px;
          font-size: 0.9375rem;
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
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
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
          outline: 2px solid var(--md-sys-color-error);
          outline-offset: 2px;
        }

        /* Navigation */
        .profile-navigation {
          text-align: center;
        }

        .back-button {
          background: transparent;
          border: 1px solid var(--md-sys-color-outline-variant);
          color: var(--md-sys-color-on-surface-variant);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          padding: 10px 20px;
          border-radius: 24px;
          transition: all var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .back-button:hover {
          background: var(--md-sys-color-surface-container-high);
          color: var(--md-sys-color-on-surface);
          border-color: var(--md-sys-color-outline);
        }

        .back-button:focus-visible {
          outline: 2px solid var(--md-sys-color-primary);
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
            padding: 24px 16px;
          }

          .profile-container {
            max-width: 100%;
          }

          .avatar {
            width: 80px;
            height: 80px;
          }

          .avatar-badge {
            width: 28px;
            height: 28px;
          }

          .profile-title {
            font-size: 1.5rem;
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