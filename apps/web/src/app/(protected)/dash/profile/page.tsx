'use client'

import { useAuth } from '@/hooks/useAuth'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useRouter } from 'next/navigation'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { User, Mail, Calendar, Shield, LogOut, ArrowLeft, Sparkles, Edit3, MapPin, Users, GraduationCap, Briefcase, BookOpen, Heart } from 'lucide-react'
import { useState } from 'react'

// Disable static generation for this page
export const dynamic = 'force-dynamic'

export default function ProfilePage() {
  usePageTitle('Profile')
  const { user, signOut, loading } = useAuth()
  const { profile, isLoading: profileLoading } = useUserProfile(user?.id)
  const router = useRouter()

  // Personal information form state
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false)
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    birthDate: '',
    birthPlace: '',
    siblings: '',
    children: '',
    currentRole: '',
    currentCompany: '',
    education: '',
    favoriteAuthors: '',
    admiredPeople: '',
    coreValues: '',
    motto: ''
  })

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

  const handlePersonalInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Save personal information to database
    console.log('Personal information saved:', personalInfo)
    setIsEditingPersonalInfo(false)
  }

  const handlePersonalInfoChange = (field: string, value: string) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }))
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

          {/* Personal Information Edit Section */}
          <div className="personal-info-card">
            <div className="card-header">
              <Edit3 size={20} className="card-icon" />
              <h2 className="card-title">Persönliche Informationen</h2>
              <button
                onClick={() => setIsEditingPersonalInfo(!isEditingPersonalInfo)}
                className="edit-toggle-button"
                type="button"
              >
                {isEditingPersonalInfo ? 'Abbrechen' : 'Bearbeiten'}
              </button>
            </div>

            {isEditingPersonalInfo ? (
              <form onSubmit={handlePersonalInfoSubmit} className="personal-info-form">
                <div className="form-grid">
                  {/* Basic Information */}
                  <div className="form-section">
                    <h3 className="form-section-title">
                      <User size={16} />
                      Grunddaten
                    </h3>
                    <div className="form-group">
                      <label className="form-label">Vollständiger Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={personalInfo.fullName}
                        onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                        placeholder="Ihr vollständiger Name"
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Geburtsdatum</label>
                        <input
                          type="date"
                          className="form-input"
                          value={personalInfo.birthDate}
                          onChange={(e) => handlePersonalInfoChange('birthDate', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Geburtsort</label>
                        <input
                          type="text"
                          className="form-input"
                          value={personalInfo.birthPlace}
                          onChange={(e) => handlePersonalInfoChange('birthPlace', e.target.value)}
                          placeholder="Stadt, Land"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Family Information */}
                  <div className="form-section">
                    <h3 className="form-section-title">
                      <Users size={16} />
                      Familie
                    </h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Geschwister</label>
                        <input
                          type="text"
                          className="form-input"
                          value={personalInfo.siblings}
                          onChange={(e) => handlePersonalInfoChange('siblings', e.target.value)}
                          placeholder="Anzahl und Details"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Eigene Kinder</label>
                        <input
                          type="text"
                          className="form-input"
                          value={personalInfo.children}
                          onChange={(e) => handlePersonalInfoChange('children', e.target.value)}
                          placeholder="Anzahl und Details"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="form-section">
                    <h3 className="form-section-title">
                      <Briefcase size={16} />
                      Beruf
                    </h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Aktuelle Position</label>
                        <input
                          type="text"
                          className="form-input"
                          value={personalInfo.currentRole}
                          onChange={(e) => handlePersonalInfoChange('currentRole', e.target.value)}
                          placeholder="Ihre aktuelle Rolle"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Unternehmen</label>
                        <input
                          type="text"
                          className="form-input"
                          value={personalInfo.currentCompany}
                          onChange={(e) => handlePersonalInfoChange('currentCompany', e.target.value)}
                          placeholder="Aktuelles Unternehmen"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Education */}
                  <div className="form-section">
                    <h3 className="form-section-title">
                      <GraduationCap size={16} />
                      Bildung
                    </h3>
                    <div className="form-group">
                      <label className="form-label">Bildungsweg</label>
                      <textarea
                        className="form-textarea"
                        value={personalInfo.education}
                        onChange={(e) => handlePersonalInfoChange('education', e.target.value)}
                        placeholder="Schulen, Studium, Abschlüsse..."
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Influences */}
                  <div className="form-section">
                    <h3 className="form-section-title">
                      <BookOpen size={16} />
                      Einflüsse
                    </h3>
                    <div className="form-group">
                      <label className="form-label">Lieblingsautoren</label>
                      <input
                        type="text"
                        className="form-input"
                        value={personalInfo.favoriteAuthors}
                        onChange={(e) => handlePersonalInfoChange('favoriteAuthors', e.target.value)}
                        placeholder="Autoren, die Sie geprägt haben"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Bewunderte Personen</label>
                      <input
                        type="text"
                        className="form-input"
                        value={personalInfo.admiredPeople}
                        onChange={(e) => handlePersonalInfoChange('admiredPeople', e.target.value)}
                        placeholder="Menschen, die Sie inspirieren"
                      />
                    </div>
                  </div>

                  {/* Values */}
                  <div className="form-section">
                    <h3 className="form-section-title">
                      <Heart size={16} />
                      Werte & Motto
                    </h3>
                    <div className="form-group">
                      <label className="form-label">Kernwerte</label>
                      <input
                        type="text"
                        className="form-input"
                        value={personalInfo.coreValues}
                        onChange={(e) => handlePersonalInfoChange('coreValues', e.target.value)}
                        placeholder="Ihre wichtigsten Werte"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Lebensmotto</label>
                      <input
                        type="text"
                        className="form-input"
                        value={personalInfo.motto}
                        onChange={(e) => handlePersonalInfoChange('motto', e.target.value)}
                        placeholder="Ein Satz, der Sie begleitet"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="save-button">
                    Speichern
                  </button>
                </div>
              </form>
            ) : (
              <div className="personal-info-preview">
                <p className="preview-message">
                  Klicken Sie auf "Bearbeiten", um Ihre persönlichen Informationen zu vervollständigen. 
                  Diese Angaben helfen dabei, Ihre Biografie zu personalisieren.
                </p>
                <div className="preview-fields">
                  {personalInfo.fullName && (
                    <div className="preview-field">
                      <User size={16} />
                      <span>{personalInfo.fullName}</span>
                    </div>
                  )}
                  {personalInfo.birthPlace && (
                    <div className="preview-field">
                      <MapPin size={16} />
                      <span>{personalInfo.birthPlace}</span>
                    </div>
                  )}
                  {personalInfo.currentRole && (
                    <div className="preview-field">
                      <Briefcase size={16} />
                      <span>{personalInfo.currentRole}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

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

        /* Personal Information Card */
        .personal-info-card {
          background: var(--md-sys-color-surface-container);
          border-radius: 24px;
          padding: 24px;
          margin-bottom: 24px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .edit-toggle-button {
          background: var(--md-sys-color-primary-container);
          color: var(--md-sys-color-on-primary-container);
          border: none;
          border-radius: 16px;
          padding: 8px 16px;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          margin-left: auto;
          transition: all var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        .edit-toggle-button:hover {
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
        }

        .personal-info-form {
          margin-top: 24px;
        }

        .form-grid {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-section {
          border-radius: 16px;
          background: var(--md-sys-color-surface-container-low);
          padding: 20px;
          border: 1px solid var(--md-sys-color-outline-variant);
        }

        .form-section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 16px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--md-sys-color-on-surface-variant);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-input {
          height: 48px;
          padding: 0 16px;
          background: var(--md-sys-color-surface);
          border: 1px solid var(--md-sys-color-outline-variant);
          border-radius: 12px;
          font-size: 0.9375rem;
          color: var(--md-sys-color-on-surface);
          transition: all var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        .form-input:focus {
          outline: none;
          border-color: var(--md-sys-color-primary);
          box-shadow: 0 0 0 2px var(--md-sys-color-primary-container);
        }

        .form-input::placeholder {
          color: var(--md-sys-color-on-surface-variant);
          opacity: 0.7;
        }

        .form-textarea {
          padding: 12px 16px;
          background: var(--md-sys-color-surface);
          border: 1px solid var(--md-sys-color-outline-variant);
          border-radius: 12px;
          font-size: 0.9375rem;
          color: var(--md-sys-color-on-surface);
          resize: vertical;
          min-height: 80px;
          font-family: inherit;
          transition: all var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        .form-textarea:focus {
          outline: none;
          border-color: var(--md-sys-color-primary);
          box-shadow: 0 0 0 2px var(--md-sys-color-primary-container);
        }

        .form-textarea::placeholder {
          color: var(--md-sys-color-on-surface-variant);
          opacity: 0.7;
        }

        .form-actions {
          margin-top: 24px;
          display: flex;
          justify-content: flex-end;
        }

        .save-button {
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
          border: none;
          border-radius: 24px;
          padding: 12px 32px;
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        .save-button:hover {
          background: var(--md-sys-color-primary-container);
          color: var(--md-sys-color-on-primary-container);
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        }

        .save-button:active {
          transform: scale(0.98);
        }

        .personal-info-preview {
          margin-top: 20px;
        }

        .preview-message {
          color: var(--md-sys-color-on-surface-variant);
          font-size: 0.9375rem;
          line-height: 1.5;
          margin-bottom: 16px;
          text-align: center;
        }

        .preview-fields {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .preview-field {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: var(--md-sys-color-surface-container-low);
          border-radius: 12px;
          color: var(--md-sys-color-on-surface);
          font-size: 0.9375rem;
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
          .profile-actions-card,
          .personal-info-card {
            padding: 20px;
            margin-bottom: 20px;
          }

          .info-value {
            font-size: 1rem;
            padding: 10px 14px;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .form-section {
            padding: 16px;
          }

          .form-actions {
            margin-top: 20px;
          }

          .save-button {
            width: 100%;
            padding: 14px 24px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .profile-container {
            animation: none;
          }

          .profile-info-card,
          .profile-actions-card,
          .personal-info-card,
          .sign-out-button,
          .back-button,
          .edit-toggle-button,
          .save-button,
          .form-input,
          .form-textarea {
            transition: none;
          }

          .profile-info-card:hover,
          .profile-actions-card:hover,
          .sign-out-button:hover,
          .back-button:hover,
          .edit-toggle-button:hover,
          .save-button:hover {
            transform: none;
          }
        }
      `}</style>
    </>
  )
}