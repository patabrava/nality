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
          border: '1px solid rgba(255, 255, 255, 0.14)',
          background: '#0b0f16',
          padding: '22px',
        }}
      >
        <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1.3rem' }}>
          Danke, die Anmeldung war erfolgreich
        </h3>
        <p style={{ margin: '10px 0 0', color: 'rgba(255, 255, 255, 0.82)', lineHeight: 1.65 }}>
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
              border: value === 'du' ? '1px solid #7ac8ff' : '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <input type="radio" name="addressPreference" value="du" checked={value === 'du'} onChange={() => onChange('du')} />
            Du
          </label>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '10px',
              border: value === 'sie' ? '1px solid #7ac8ff' : '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <input type="radio" name="addressPreference" value="sie" checked={value === 'sie'} onChange={() => onChange('sie')} />
            Sie
          </label>
        </div>

        {errorMessage ? (
          <p style={{ marginTop: '10px', color: '#ff9ea1', fontSize: '0.9rem' }}>{errorMessage}</p>
        ) : null}

        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            disabled={isSaving}
            onClick={onConfirm}
            style={{
              border: 'none',
              borderRadius: '999px',
              padding: '10px 16px',
              background: isSaving ? 'rgba(122, 200, 255, 0.5)' : '#7ac8ff',
              color: '#082039',
              fontWeight: 700,
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
