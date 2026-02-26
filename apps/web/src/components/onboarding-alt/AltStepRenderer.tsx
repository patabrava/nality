'use client';

import {
  type AltAnswerValue,
  type AltDemographicAnswer,
  type AltStep,
} from '@/lib/onboarding/alt-config';
import { toggleMultiValue, updateDemographicValue } from '@/lib/onboarding/alt-machine';

interface AltStepRendererProps {
  step: AltStep;
  value: AltAnswerValue | undefined;
  disableNext: boolean;
  errorMessage: string | null;
  onBack: () => void;
  onNext: () => void;
  onChange: (value: AltAnswerValue) => void;
}

function asDemographicValue(value: AltAnswerValue | undefined): AltDemographicAnswer {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as AltDemographicAnswer;
  }
  return {};
}

export function AltStepRenderer({
  step,
  value,
  disableNext,
  errorMessage,
  onBack,
  onNext,
  onChange,
}: AltStepRendererProps) {
  const demographicValue = asDemographicValue(value);

  return (
    <section
      style={{
        borderRadius: '14px',
        border: '1px solid var(--md-sys-color-outline-variant)',
        background: 'var(--md-sys-color-surface-container-low)',
        padding: '20px',
      }}
    >
      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--md-sys-color-on-surface-variant)' }}>{step.title}</p>
      <h2 style={{ margin: '8px 0 0', fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: '1.4rem' }}>{step.text}</h2>

      {step.kind === 'single' || step.kind === 'decision' ? (
        <div style={{ display: 'grid', gap: '10px', marginTop: '16px' }}>
          {(step.options ?? []).map((option) => {
            const selected = typeof value === 'string' && value === option.id;
            return (
              <label
                key={option.id}
                style={{
                  border: selected
                    ? '1px solid var(--md-sys-color-primary)'
                    : '1px solid var(--md-sys-color-outline-variant)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  display: 'grid',
                  gap: '4px',
                  cursor: 'pointer',
                  background: selected ? 'var(--md-sys-color-surface-container-high)' : 'transparent',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="radio"
                    name={step.id}
                    checked={selected}
                    onChange={() => onChange(option.id)}
                    style={{ accentColor: 'var(--md-sys-color-primary)' }}
                  />
                  {option.label}
                </span>
                {option.description ? (
                  <span style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.85rem' }}>
                    {option.description}
                  </span>
                ) : null}
                {option.ctaUrl && option.ctaLabel ? (
                  <a
                    href={option.ctaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--accent-gold)', fontSize: '0.85rem' }}
                  >
                    {option.ctaLabel}
                  </a>
                ) : null}
              </label>
            );
          })}
        </div>
      ) : null}

      {step.kind === 'multi' ? (
        <div style={{ display: 'grid', gap: '10px', marginTop: '16px' }}>
          {(step.options ?? []).map((option) => {
            const selected = Array.isArray(value) && value.includes(option.id);
            return (
              <label
                key={option.id}
                style={{
                  border: selected
                    ? '1px solid var(--md-sys-color-primary)'
                    : '1px solid var(--md-sys-color-outline-variant)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  display: 'grid',
                  gap: '4px',
                  cursor: 'pointer',
                  background: selected ? 'var(--md-sys-color-surface-container-high)' : 'transparent',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => onChange(toggleMultiValue(value, option.id))}
                    style={{ accentColor: 'var(--md-sys-color-primary)' }}
                  />
                  {option.label}
                </span>
                {option.description ? (
                  <span style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.85rem' }}>
                    {option.description}
                  </span>
                ) : null}
              </label>
            );
          })}
        </div>
      ) : null}

      {step.kind === 'demographics' ? (
        <div style={{ display: 'grid', gap: '14px', marginTop: '16px' }}>
          {(step.fields ?? []).map((field) => (
            <div key={field.id} style={{ display: 'grid', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem' }}>{field.label}</label>
              {field.multiple ? (
                <div style={{ display: 'grid', gap: '8px' }}>
                  {field.options.map((option) => {
                    const current = demographicValue[field.id];
                    const selected = Array.isArray(current) && current.includes(option.id);
                    return (
                      <label key={option.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => {
                            const currentValues = Array.isArray(current) ? current : [];
                            const nextValues = currentValues.includes(option.id)
                              ? currentValues.filter((valueId) => valueId !== option.id)
                              : [...currentValues, option.id];
                            onChange(updateDemographicValue(value, field.id, nextValues));
                          }}
                          style={{ accentColor: 'var(--md-sys-color-primary)' }}
                        />
                        {option.label}
                      </label>
                    );
                  })}
                </div>
              ) : (
                <select
                  className="form-select"
                  value={typeof demographicValue[field.id] === 'string' ? (demographicValue[field.id] as string) : ''}
                  onChange={(event) => onChange(updateDemographicValue(value, field.id, event.target.value))}
                >
                  <option value="">Bitte wählen</option>
                  {field.options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>
      ) : null}

      {step.kind === 'info' ? (
        <div
          style={{
            marginTop: '16px',
            padding: '14px',
            borderRadius: '10px',
            background: 'var(--md-sys-color-surface-container)',
            border: '1px solid var(--md-sys-color-outline)',
            color: 'var(--md-sys-color-on-surface)',
          }}
        >
          Informationen übernommen. Du kannst jetzt fortfahren.
        </div>
      ) : null}

      {errorMessage ? <p style={{ margin: '12px 0 0', color: '#ffd9d5', fontSize: '0.9rem' }}>{errorMessage}</p> : null}

      <div style={{ marginTop: '18px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={onBack}
          className="btn btn-secondary"
          style={{
            padding: '0.75rem 1.25rem',
            color: 'var(--md-sys-color-on-surface)',
          }}
        >
          Zurück
        </button>
        <button
          type="button"
          disabled={disableNext}
          onClick={onNext}
          className="btn btn-primary"
          style={{
            padding: '0.75rem 1.25rem',
            opacity: disableNext ? 0.6 : 1,
            cursor: disableNext ? 'not-allowed' : 'pointer',
          }}
        >
          Weiter
        </button>
      </div>
    </section>
  );
}
