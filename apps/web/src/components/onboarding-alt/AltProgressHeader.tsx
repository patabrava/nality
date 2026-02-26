'use client';

import { type AltPath, getPathLabel, getStepIndex, PATH_STEPS } from '@/lib/onboarding/alt-config';

interface AltProgressHeaderProps {
  path: AltPath;
  currentStepId: string | null;
  stageLabel: string;
}

export function AltProgressHeader({ path, currentStepId, stageLabel }: AltProgressHeaderProps) {
  const totalSteps = PATH_STEPS[path].length;
  const currentIndex = currentStepId ? getStepIndex(path, currentStepId) : 0;
  const safeIndex = currentIndex < 0 ? 0 : currentIndex;
  const progressPercent = Math.round(((safeIndex + 1) / totalSteps) * 100);

  return (
    <div
      style={{
        marginBottom: '20px',
        border: '1px solid var(--md-sys-color-outline-variant)',
        borderRadius: '14px',
        padding: '14px 16px',
        background: 'var(--md-sys-color-surface-container-low)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <div>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
            {getPathLabel(path)}
          </p>
          <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--md-sys-color-on-surface)' }}>{stageLabel}</p>
        </div>
        <strong style={{ fontSize: '0.9rem', color: 'var(--accent-gold)' }}>{progressPercent}%</strong>
      </div>
      <div
        style={{
          marginTop: '10px',
          height: '8px',
          borderRadius: '999px',
          background: 'var(--md-sys-color-surface-container-high)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progressPercent}%`,
            height: '100%',
            background: 'var(--md-sys-color-primary)',
            transition: 'width 250ms ease',
          }}
        />
      </div>
    </div>
  );
}
