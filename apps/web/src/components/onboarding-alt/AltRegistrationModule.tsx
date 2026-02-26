'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  onBack,
}: AltRegistrationModuleProps) {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login?mode=signup');
  }, [router]);

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
        Du hast alle Fragen abgeschlossen. Weiter geht es mit der Registrierung auf der Login-Seite.
      </p>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '16px' }}>
        <Link
          href="/login?mode=signup"
          className="btn btn-primary"
          style={{
            padding: '0.75rem 1.25rem',
            textDecoration: 'none',
          }}
        >
          Zur Registrierung
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
