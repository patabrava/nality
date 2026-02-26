'use client';

interface NeutralStartBlockProps {
  onContinueToRegistration: () => void;
  onBackToPath: () => void;
}

export function NeutralStartBlock({ onContinueToRegistration, onBackToPath }: NeutralStartBlockProps) {
  return (
    <section
      style={{
        borderRadius: '16px',
        border: '1px solid var(--md-sys-color-outline-variant)',
        background: 'var(--md-sys-color-surface-container-low)',
        padding: '20px',
      }}
    >
      <p
        style={{
          margin: 0,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontSize: '0.75rem',
          color: 'var(--accent-gold)',
        }}
      >
        Neutraler Storytelling-Start
      </p>
      <h3
        style={{
          margin: '8px 0 10px',
          fontFamily: 'var(--font-serif)',
          fontWeight: 500,
          fontSize: '1.4rem',
          color: 'var(--md-sys-color-on-surface)',
        }}
      >
        Blauer Block: Erst erzählen, dann registrieren
      </h3>
      <p style={{ margin: 0, lineHeight: 1.7, color: 'var(--md-sys-color-on-surface-variant)' }}>
        Du kannst direkt mit deiner ersten Erzählung starten und danach in weniger als einer Minute deine
        Registrierung abschließen. Deine bisherigen Antworten bleiben erhalten.
      </p>

      <div style={{ marginTop: '18px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={onContinueToRegistration}
          className="btn btn-primary"
          style={{
            padding: '0.75rem 1.5rem',
          }}
        >
          Jetzt registrieren
        </button>
        <button
          type="button"
          onClick={onBackToPath}
          className="btn btn-secondary"
          style={{
            padding: '0.75rem 1.5rem',
          }}
        >
          Zurück
        </button>
      </div>
    </section>
  );
}
