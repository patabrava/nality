'use client';

import { motion } from 'framer-motion';

interface ProgressIndicatorProps {
  progress: number; // 0-100
  questionsAnswered?: number;
  totalQuestions?: number;
  currentQuestion?: number;
}

// Seven core onboarding questions (see onboarding.txt)
const ONBOARDING_SECTIONS = [
  { id: 'identity', label: 'Identität & Stimme', questions: 1 },
  { id: 'origins', label: 'Anfänge & Herkunft', questions: 1 },
  { id: 'family', label: 'Familienbild', questions: 1 },
  { id: 'education', label: 'Bildungsweg', questions: 1 },
  { id: 'career', label: 'Beruf & Berufung', questions: 1 },
  { id: 'influences', label: 'Prägende Stimmen', questions: 1 },
  { id: 'values', label: 'Werte & Motto', questions: 1 },
];

const TOTAL_QUESTIONS = ONBOARDING_SECTIONS.reduce((sum, s) => sum + s.questions, 0);

export default function ProgressIndicator({ 
  progress, 
  questionsAnswered = 0,
  totalQuestions = TOTAL_QUESTIONS,
  currentQuestion = 1,
}: ProgressIndicatorProps) {
  const clampedTotal = Math.max(totalQuestions, TOTAL_QUESTIONS);
  const clampedAnswered = Math.min(Math.max(questionsAnswered, 0), clampedTotal);
  const currentSectionIndex = Math.min(
    Math.max(currentQuestion - 1, 0),
    ONBOARDING_SECTIONS.length - 1
  );
  
  return (
    <div style={{
      background: 'var(--md-sys-color-surface-container)',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid var(--md-sys-color-outline-variant)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h4 style={{
          margin: 0,
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'var(--md-sys-color-on-surface)',
        }}>
          Fortschritt
        </h4>
        <span style={{
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'var(--md-sys-color-primary)',
        }}>
          {Math.round(progress)}%
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{
        height: '8px',
        background: 'var(--md-sys-color-surface-container-highest)',
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: '20px'
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, var(--md-sys-color-primary), var(--md-sys-color-secondary))',
            borderRadius: '4px',
          }}
        />
      </div>

      {/* Section Checklist */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {ONBOARDING_SECTIONS.map((section, index) => {
          const isComplete = index < clampedAnswered;
          const isCurrent = clampedAnswered < clampedTotal && !isComplete && index === currentSectionIndex;
          
          return (
            <div
              key={section.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '8px',
                background: isCurrent 
                  ? 'var(--md-sys-color-primary-container)' 
                  : 'transparent',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Checkbox */}
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: isComplete 
                  ? 'none' 
                  : `2px solid ${isCurrent ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline)'}`,
                background: isComplete 
                  ? 'var(--md-sys-color-primary)' 
                  : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.2s ease'
              }}>
                {isComplete && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path 
                      d="M2 6L5 9L10 3" 
                      stroke="var(--md-sys-color-on-primary)" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              
              {/* Label */}
              <span style={{
                fontSize: '0.8rem',
                color: isComplete 
                  ? 'var(--md-sys-color-on-surface-variant)' 
                  : isCurrent 
                    ? 'var(--md-sys-color-on-primary-container)'
                    : 'var(--md-sys-color-on-surface)',
                fontWeight: isCurrent ? 500 : 400,
                textDecoration: isComplete ? 'line-through' : 'none',
                opacity: isComplete ? 0.7 : 1
              }}>
                {section.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Questions Counter */}
      <div style={{
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: '1px solid var(--md-sys-color-outline-variant)',
        textAlign: 'center'
      }}>
        <p style={{
          margin: 0,
          fontSize: '0.75rem',
          color: 'var(--md-sys-color-on-surface-variant)'
        }}>
          {questionsAnswered} von ~{totalQuestions} Fragen beantwortet
        </p>
      </div>
    </div>
  );
}
