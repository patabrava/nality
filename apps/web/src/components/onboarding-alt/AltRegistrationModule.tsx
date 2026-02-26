'use client';

import { useState } from 'react';
import type { AltRegistrationDraft, PasswordRegistrationSubmission } from '@/lib/onboarding/alt-config';

interface AltRegistrationModuleProps {
  initialValues: AltRegistrationDraft | null;
  isSubmitting: boolean;
  errorMessage: string | null;
  onPasswordSubmit: (payload: PasswordRegistrationSubmission) => Promise<void>;
  onGoogleSubmit: (payload: AltRegistrationDraft) => Promise<void>;
  onBack: () => void;
}

export function AltRegistrationModule({
  initialValues,
  isSubmitting,
  errorMessage,
  onPasswordSubmit,
  onGoogleSubmit,
  onBack,
}: AltRegistrationModuleProps) {
  const [firstNameOrNickname, setFirstNameOrNickname] = useState(initialValues?.firstNameOrNickname ?? '');
  const [lastName, setLastName] = useState(initialValues?.lastName ?? '');
  const [email, setEmail] = useState(initialValues?.email ?? '');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const validate = (): boolean => {
    if (!firstNameOrNickname.trim()) {
      setLocalError('Vorname oder Spitzname ist ein Pflichtfeld.');
      return false;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLocalError('Bitte gib eine gültige E-Mail-Adresse ein.');
      return false;
    }
    return true;
  };

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    if (!password.trim()) {
      setLocalError('Bitte gib ein Passwort ein.');
      return;
    }

    setLocalError(null);
    await onPasswordSubmit({
      firstNameOrNickname: firstNameOrNickname.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password,
      method: 'password',
    });
  };

  const handleGoogle = async () => {
    if (!validate()) return;
    setLocalError(null);
    await onGoogleSubmit({
      firstNameOrNickname: firstNameOrNickname.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      method: 'google',
    });
  };

  return (
    <section
      style={{
        borderRadius: '14px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '20px',
        background: 'rgba(255, 255, 255, 0.02)',
      }}
    >
      <h2 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1.45rem' }}>Registrierung</h2>
      <p style={{ margin: '10px 0 0', color: 'rgba(255, 255, 255, 0.76)', lineHeight: 1.6 }}>
        Super, dann richten wir dir in weniger als 1 Minute deinen persönlichen Erinnerungsraum ein.
      </p>

      <form onSubmit={handlePasswordSubmit} style={{ marginTop: '16px', display: 'grid', gap: '12px' }}>
        <label style={{ display: 'grid', gap: '6px' }}>
          <span style={{ fontSize: '0.85rem' }}>Vorname oder Spitzname (Pflicht)</span>
          <input
            className="form-input"
            value={firstNameOrNickname}
            onChange={(event) => setFirstNameOrNickname(event.target.value)}
            placeholder="z. B. Anna"
            disabled={isSubmitting}
          />
        </label>

        <label style={{ display: 'grid', gap: '6px' }}>
          <span style={{ fontSize: '0.85rem' }}>Nachname (optional)</span>
          <input
            className="form-input"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            placeholder="z. B. Mustermann"
            disabled={isSubmitting}
          />
        </label>

        <label style={{ display: 'grid', gap: '6px' }}>
          <span style={{ fontSize: '0.85rem' }}>E-Mail-Adresse</span>
          <input
            className="form-input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="du@example.com"
            disabled={isSubmitting}
          />
        </label>

        <label style={{ display: 'grid', gap: '6px' }}>
          <span style={{ fontSize: '0.85rem' }}>Passwort</span>
          <input
            className="form-input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Mindestens 8 Zeichen"
            disabled={isSubmitting}
          />
        </label>

        {localError ? <p style={{ margin: 0, color: '#ff9ea1', fontSize: '0.9rem' }}>{localError}</p> : null}
        {errorMessage ? <p style={{ margin: 0, color: '#ff9ea1', fontSize: '0.9rem' }}>{errorMessage}</p> : null}

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              border: 'none',
              borderRadius: '999px',
              padding: '10px 14px',
              background: '#d4af37',
              color: '#111',
              fontWeight: 700,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            {isSubmitting ? 'Verarbeite...' : 'Konto erstellen'}
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleGoogle}
            style={{
              border: '1px solid rgba(255, 255, 255, 0.26)',
              borderRadius: '999px',
              padding: '10px 14px',
              background: 'transparent',
              color: 'var(--md-sys-color-on-surface)',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            Mit Google registrieren
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onBack}
            style={{
              border: '1px solid rgba(255, 255, 255, 0.16)',
              borderRadius: '999px',
              padding: '10px 14px',
              background: 'transparent',
              color: 'var(--md-sys-color-on-surface-variant)',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            Zurück
          </button>
        </div>
      </form>
    </section>
  );
}
