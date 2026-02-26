'use client';

import type { AddressPreference } from '@/lib/onboarding/alt-config';

interface AddressPreferenceModalProps {
  isOpen: boolean;
  value: AddressPreference;
  isSaving: boolean;
  errorMessage: string | null;
  onChange: (value: AddressPreference) => void;
  onConfirm: () => void;
}

export function AddressPreferenceModal({
  isOpen,
  value,
  isSaving,
  errorMessage,
  onChange,
  onConfirm,
}: AddressPreferenceModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          borderRadius: '14px',
          border: '1px solid var(--md-sys-color-outline-variant)',
          background: 'var(--md-sys-color-surface-container)',
          padding: '22px',
        }}
      >
        <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1.3rem' }}>
          Danke, die Anmeldung war erfolgreich
        </h3>
        <p style={{ margin: '10px 0 0', color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.65 }}>
          Möchtest du weiterhin per Du angesprochen werden oder zum Sie wechseln?
        </p>

        <div style={{ marginTop: '16px', display: 'grid', gap: '10px' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '10px',
              border:
                value === 'du'
                  ? '1px solid var(--md-sys-color-primary)'
                  : '1px solid var(--md-sys-color-outline-variant)',
              background: value === 'du' ? 'var(--md-sys-color-surface-container-high)' : 'transparent',
            }}
          >
            <input
              type="radio"
              name="addressPreference"
              value="du"
              checked={value === 'du'}
              onChange={() => onChange('du')}
              style={{ accentColor: 'var(--md-sys-color-primary)' }}
            />
            Du
          </label>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '10px',
              border:
                value === 'sie'
                  ? '1px solid var(--md-sys-color-primary)'
                  : '1px solid var(--md-sys-color-outline-variant)',
              background: value === 'sie' ? 'var(--md-sys-color-surface-container-high)' : 'transparent',
            }}
          >
            <input
              type="radio"
              name="addressPreference"
              value="sie"
              checked={value === 'sie'}
              onChange={() => onChange('sie')}
              style={{ accentColor: 'var(--md-sys-color-primary)' }}
            />
            Sie
          </label>
        </div>

        {errorMessage ? (
          <p style={{ marginTop: '10px', color: '#ffd9d5', fontSize: '0.9rem' }}>{errorMessage}</p>
        ) : null}

        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            disabled={isSaving}
            onClick={onConfirm}
            className="btn btn-primary"
            style={{
              padding: '0.75rem 1.5rem',
              opacity: isSaving ? 0.6 : 1,
              cursor: isSaving ? 'not-allowed' : 'pointer',
            }}
          >
            {isSaving ? 'Speichere...' : 'Auswahl speichern'}
          </button>
        </div>
      </div>
    </div>
  );
}
