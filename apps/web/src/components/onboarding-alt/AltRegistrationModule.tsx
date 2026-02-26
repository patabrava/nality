'use client';

import Link from 'next/link';
import { type FormEvent, useEffect, useMemo, useState } from 'react';
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

  useEffect(() => {
    setFirstNameOrNickname(initialValues?.firstNameOrNickname ?? '');
    setLastName(initialValues?.lastName ?? '');
    setEmail(initialValues?.email ?? '');
  }, [initialValues]);

  const normalizedEmail = email.trim().toLowerCase();
  const canSubmitIdentity = firstNameOrNickname.trim().length > 0 && normalizedEmail.length > 0;
  const canSubmitPassword = canSubmitIdentity && password.trim().length >= 8;

  const googlePayload = useMemo<AltRegistrationDraft>(() => {
    return {
      firstNameOrNickname: firstNameOrNickname.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      method: 'google',
    };
  }, [firstNameOrNickname, lastName, normalizedEmail]);

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmitPassword || isSubmitting) return;

    const payload: PasswordRegistrationSubmission = {
      firstNameOrNickname: firstNameOrNickname.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      password: password.trim(),
      method: 'password',
    };

    await onPasswordSubmit(payload);
  };

  const handleGoogleSubmit = async () => {
    if (!canSubmitIdentity || isSubmitting) return;
    await onGoogleSubmit(googlePayload);
  };

  return (
    <section
      style={{
        borderRadius: '14px',
        border: '1px solid var(--md-sys-color-outline-variant)',
        padding: '20px',
        background: 'var(--md-sys-color-surface-container-low)',
      }}
    >
      <h2 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1.45rem' }}>Registrierung</h2>
      <p style={{ margin: '10px 0 0', color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.6 }}>
        Du hast alle Fragen abgeschlossen. Erstelle jetzt dein Konto, damit wir deine Antworten direkt in dein Profil uebernehmen koennen.
      </p>

      <form onSubmit={handlePasswordSubmit} style={{ display: 'grid', gap: '10px', marginTop: '16px' }}>
        <input
          type="text"
          value={firstNameOrNickname}
          onChange={(event) => setFirstNameOrNickname(event.target.value)}
          placeholder="Vorname oder Rufname"
          autoComplete="given-name"
          disabled={isSubmitting}
          style={{
            border: '1px solid var(--md-sys-color-outline-variant)',
            borderRadius: '10px',
            padding: '10px 12px',
            background: 'var(--md-sys-color-surface)',
            color: 'var(--md-sys-color-on-surface)',
          }}
        />
        <input
          type="text"
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          placeholder="Nachname (optional)"
          autoComplete="family-name"
          disabled={isSubmitting}
          style={{
            border: '1px solid var(--md-sys-color-outline-variant)',
            borderRadius: '10px',
            padding: '10px 12px',
            background: 'var(--md-sys-color-surface)',
            color: 'var(--md-sys-color-on-surface)',
          }}
        />
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="E-Mail"
          autoComplete="email"
          disabled={isSubmitting}
          style={{
            border: '1px solid var(--md-sys-color-outline-variant)',
            borderRadius: '10px',
            padding: '10px 12px',
            background: 'var(--md-sys-color-surface)',
            color: 'var(--md-sys-color-on-surface)',
          }}
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Passwort (mindestens 8 Zeichen)"
          autoComplete="new-password"
          disabled={isSubmitting}
          style={{
            border: '1px solid var(--md-sys-color-outline-variant)',
            borderRadius: '10px',
            padding: '10px 12px',
            background: 'var(--md-sys-color-surface)',
            color: 'var(--md-sys-color-on-surface)',
          }}
        />

        {errorMessage ? (
          <p style={{ margin: 0, color: '#ffd9d5' }}>
            {errorMessage}
          </p>
        ) : null}

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!canSubmitPassword || isSubmitting}
            style={{
              padding: '0.75rem 1.25rem',
            }}
          >
            {isSubmitting ? 'Wird erstellt ...' : 'Mit E-Mail registrieren'}
          </button>
          <button
            type="button"
            onClick={handleGoogleSubmit}
            className="btn btn-secondary"
            disabled={!canSubmitIdentity || isSubmitting}
            style={{
              padding: '0.75rem 1.25rem',
            }}
          >
            Mit Google fortfahren
          </button>
        </div>
      </form>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '16px' }}>
        <Link
          href="/login"
          className="btn btn-secondary"
          style={{
            padding: '0.75rem 1.25rem',
            textDecoration: 'none',
            color: 'var(--md-sys-color-on-surface-variant)',
          }}
        >
          Ich habe bereits ein Konto
        </Link>
        <button
          type="button"
          onClick={onBack}
          className="btn btn-secondary"
          style={{
            padding: '0.75rem 1.25rem',
            color: 'var(--md-sys-color-on-surface-variant)',
          }}
        >
          Zurück
        </button>
      </div>
    </section>
  );
}
