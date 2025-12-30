'use client';

import { Mic, MessageSquare, FileText } from 'lucide-react';
import { useI18n } from '@/components/i18n/I18nProvider';

export type VoiceMode = 'interview' | 'free-talk' | 'text';

interface VoiceModeSelectorProps {
  onSelect: (mode: VoiceMode) => void;
  onClose: () => void;
}

/**
 * Voice Mode Selector Component
 * Glassmorphic modal for choosing memory input method
 * Matches luxury dark design aesthetic
 */
export function VoiceModeSelector({ onSelect, onClose }: VoiceModeSelectorProps) {
  const { t } = useI18n();

  const modes = [
    {
      id: 'interview' as VoiceMode,
      icon: Mic,
      title: t('voice.selector.interview.title'),
      description: t('voice.selector.interview.description'),
      accent: 'var(--md-sys-color-primary)',
      recommended: true,
    },
    {
      id: 'free-talk' as VoiceMode,
      icon: MessageSquare,
      title: t('voice.selector.freeTalk.title'),
      description: t('voice.selector.freeTalk.description'),
      accent: 'var(--md-sys-color-tertiary)',
      recommended: false,
    },
    {
      id: 'text' as VoiceMode,
      icon: FileText,
      title: t('voice.selector.text.title'),
      description: t('voice.selector.text.description'),
      accent: 'var(--md-sys-color-secondary)',
      recommended: false,
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(13, 13, 13, 0.98) 100%)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '32px',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              color: 'var(--md-sys-color-on-surface)',
              margin: '0 0 8px 0',
            }}
          >
            {t('voice.selector.title')}
          </h2>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--md-sys-color-on-surface-variant)',
              margin: 0,
            }}
          >
            {t('voice.selector.subtitle')}
          </p>
        </div>

        {/* Mode Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {modes.map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => onSelect(mode.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  padding: '20px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.borderColor = mode.accent;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: `${mode.accent}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon
                    size={24}
                    style={{ color: mode.accent }}
                  />
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span
                      style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: 'var(--md-sys-color-on-surface)',
                      }}
                    >
                      {mode.title}
                    </span>
                    {mode.recommended && (
                      <span
                        style={{
                          fontSize: '0.625rem',
                          fontWeight: 600,
                          color: mode.accent,
                          background: `${mode.accent}20`,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {t('voice.selector.recommended')}
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--md-sys-color-on-surface-variant)',
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {mode.description}
                  </p>
                </div>

                {/* Arrow */}
                <div
                  style={{
                    color: 'var(--md-sys-color-on-surface-variant)',
                    alignSelf: 'center',
                  }}
                >
                  →
                </div>
              </button>
            );
          })}
        </div>

        {/* Cancel Button */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            marginTop: '16px',
            padding: '12px',
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: 'var(--md-sys-color-on-surface-variant)',
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          {t('voice.selector.cancel')}
        </button>
      </div>
    </div>
  );
}
