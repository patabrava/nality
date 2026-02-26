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
        border: '1px solid rgba(122, 200, 255, 0.45)',
        background: 'linear-gradient(145deg, rgba(36, 107, 180, 0.22), rgba(24, 64, 112, 0.22))',
        padding: '20px',
      }}
    >
      <p
        style={{
          margin: 0,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontSize: '0.75rem',
          color: '#9fd8ff',
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
      <p style={{ margin: 0, lineHeight: 1.7, color: 'rgba(255, 255, 255, 0.82)' }}>
        Du kannst direkt mit deiner ersten Erzählung starten und danach in weniger als einer Minute deine
        Registrierung abschließen. Deine bisherigen Antworten bleiben erhalten.
      </p>

      <div style={{ marginTop: '18px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={onContinueToRegistration}
          style={{
            border: 'none',
            borderRadius: '999px',
            padding: '10px 16px',
            background: '#7ac8ff',
            color: '#082039',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Jetzt registrieren
        </button>
        <button
          type="button"
          onClick={onBackToPath}
          style={{
            border: '1px solid rgba(255, 255, 255, 0.28)',
            borderRadius: '999px',
            padding: '10px 16px',
            background: 'transparent',
            color: 'var(--md-sys-color-on-surface)',
            cursor: 'pointer',
          }}
        >
          Zurück
        </button>
      </div>
    </section>
  );
}
