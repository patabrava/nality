/**
 * ProfileCard Component
 * 
 * Displays user profile attributes (values, influences, motto) from the
 * user_profile table. This is for atemporal data that describes WHO the
 * user is, not timeline events.
 */

'use client';

import { motion } from 'framer-motion';
import { User, Heart, BookOpen, Quote, Sparkles, Users } from 'lucide-react';
import type { ProfileAttributes } from '@/hooks/useUserProfile';

// ──────────────────────
// Types
// ──────────────────────

interface ProfileCardProps {
  /** User data from users table */
  user: {
    full_name?: string | null;
    birth_date?: string | null;
    birth_place?: string | null;
  };
  /** Profile attributes from user_profile table */
  attributes: ProfileAttributes | null;
  /** Callback when edit button is clicked */
  onEdit?: () => void;
  /** Callback when navigating to chat for onboarding */
  onChatNavigate?: () => void;
  /** Whether the card is in compact mode */
  compact?: boolean;
}

// ──────────────────────
// Main Component
// ──────────────────────

export function ProfileCard({ user, attributes, onEdit, onChatNavigate, compact = false }: ProfileCardProps) {
  const hasValues = attributes?.values && attributes.values.length > 0;
  const hasInfluences = attributes?.influences && attributes.influences.length > 0;
  const hasRoleModels = attributes?.role_models && attributes.role_models.length > 0;
  const hasMotto = attributes?.motto;
  const hasAnyAttributes = hasValues || hasInfluences || hasRoleModels || hasMotto;

  // Empty State (CTA Mode)
  if (!hasAnyAttributes) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
        onClick={onChatNavigate}
        style={{
          background: 'var(--md-sys-color-surface-container-low)',
          borderRadius: '24px',
          padding: compact ? '20px' : '32px',
          border: '1px dashed var(--md-sys-color-outline)',
          cursor: onChatNavigate ? 'pointer' : 'default',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          transition: 'all 0.3s ease',
        }}
        onMouseOver={(e: React.MouseEvent<HTMLDivElement>) => {
          if (onChatNavigate) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
            e.currentTarget.style.borderColor = 'var(--accent-gold)';
          }
        }}
        onMouseOut={(e: React.MouseEvent<HTMLDivElement>) => {
          if (onChatNavigate) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = 'var(--md-sys-color-outline)';
          }
        }}
      >
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'var(--md-sys-color-surface-container-high)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '8px',
        }}>
          <Sparkles size={32} className="text-primary" style={{ color: 'var(--md-sys-color-primary)' }} />
        </div>
        
        <div>
          <h3 style={{ 
            fontSize: '1.25rem', 
            fontWeight: 600, 
            color: 'var(--md-sys-color-on-surface)',
            margin: '0 0 8px 0'
          }}>
            Erzähl uns, wer du bist
          </h3>
          <p style={{ 
            fontSize: '0.9375rem', 
            color: 'var(--md-sys-color-on-surface-variant)',
            margin: 0,
            maxWidth: '400px',
            lineHeight: 1.5,
          }}>
            Dein Profil ist noch leer. Füge deine Werte, Einflüsse und dein Lebensmotto hinzu, um deiner Timeline Persönlichkeit zu geben.
          </p>
        </div>

        {(onEdit || onChatNavigate) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onChatNavigate) {
                onChatNavigate();
              } else if (onEdit) {
                onEdit();
              }
            }}
            style={{
              marginTop: '8px',
              padding: '10px 24px',
              borderRadius: '100px',
              background: 'var(--accent-gold)',
              color: '#000',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.9375rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.3)';
            }}
            onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
            }}
          >
            {onChatNavigate ? 'Im Chat vervollständigen' : 'Profil vervollständigen'}
            <Sparkles size={16} />
          </button>
        )}
      </motion.div>
    );
  }

  // Populated State
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        background: 'var(--md-sys-color-surface-container)',
        borderRadius: '24px',
        padding: compact ? '20px' : '32px',
        border: '1px solid var(--md-sys-color-outline-variant)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative Background Blob */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-10%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, var(--md-sys-color-primary-container) 0%, transparent 70%)',
        opacity: 0.15,
        pointerEvents: 'none',
        filter: 'blur(40px)',
      }} />

      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: hasAnyAttributes ? '24px' : '0',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: compact ? '48px' : '64px',
            height: compact ? '48px' : '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--md-sys-color-primary), var(--md-sys-color-tertiary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}>
            <User size={compact ? 24 : 32} color="white" />
          </div>
          <div>
            <h2 style={{ 
              margin: 0, 
              fontSize: compact ? '1.125rem' : '1.5rem',
              fontWeight: 700,
              color: 'var(--md-sys-color-on-surface)',
              letterSpacing: '-0.02em',
            }}>
              {user.full_name || 'Mein Profil'}
            </h2>
            {user.birth_date && user.birth_place && (
              <p style={{ 
                margin: '4px 0 0 0', 
                fontSize: '0.9375rem',
                color: 'var(--md-sys-color-on-surface-variant)',
              }}>
                Geboren {formatYear(user.birth_date)} in {user.birth_place}
              </p>
            )}
          </div>
        </div>
        
        {onEdit && (
          <button
            onClick={onEdit}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '100px',
              background: 'var(--md-sys-color-surface-container-high)',
              border: '1px solid var(--md-sys-color-outline-variant)',
              color: 'var(--md-sys-color-on-surface-variant)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.background = 'var(--md-sys-color-surface-container-highest)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.background = 'var(--md-sys-color-surface-container-high)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Sparkles size={14} />
            Bearbeiten
          </button>
        )}
      </div>

      {/* Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: compact ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Values Section */}
        {hasValues && (
          <ProfileSection 
            icon={<Heart size={18} />} 
            title="Meine Werte"
            compact={compact}
          >
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {attributes!.values.map((value, i) => (
                <span
                  key={i}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '12px',
                    background: 'var(--md-sys-color-primary-container)',
                    color: 'var(--md-sys-color-on-primary-container)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {value}
                </span>
              ))}
            </div>
          </ProfileSection>
        )}

        {/* Influences Section */}
        {hasInfluences && (
          <ProfileSection 
            icon={<BookOpen size={18} />} 
            title="Einflüsse"
            compact={compact}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {attributes!.influences.map((inf, i) => (
                <div 
                  key={i}
                  style={{ 
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '8px',
                  }}
                >
                  <span style={{ 
                    color: 'var(--md-sys-color-on-surface)',
                    fontWeight: 500,
                  }}>
                    {inf.name}
                  </span>
                  {inf.type && inf.type !== 'other' && (
                    <span style={{ 
                      color: 'var(--md-sys-color-on-surface-variant)',
                      fontSize: '0.75rem',
                      textTransform: 'capitalize',
                      background: 'var(--md-sys-color-surface-container-high)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}>
                      {translateInfluenceType(inf.type)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </ProfileSection>
        )}

        {/* Role Models Section */}
        {hasRoleModels && (
          <ProfileSection 
            icon={<Users size={18} />} 
            title="Vorbilder"
            compact={compact}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {attributes!.role_models.map((rm, i) => (
                <div 
                  key={i}
                  style={{ 
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '8px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ 
                    color: 'var(--md-sys-color-on-surface)',
                    fontWeight: 500,
                  }}>
                    {rm.name}
                  </span>
                  {rm.traits && rm.traits.length > 0 && (
                    <span style={{ 
                      color: 'var(--md-sys-color-on-surface-variant)',
                      fontSize: '0.75rem',
                    }}>
                      — {rm.traits.join(', ')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </ProfileSection>
        )}
      </div>

      {/* Motto Section (Full Width) */}
      {hasMotto && (
        <div style={{ marginTop: '24px', position: 'relative', zIndex: 1 }}>
          <ProfileSection 
            icon={<Quote size={18} />} 
            title="Lebensmotto"
            compact={compact}
          >
            <blockquote style={{
              margin: 0,
              padding: '16px 24px',
              borderLeft: '4px solid var(--md-sys-color-primary)',
              background: 'var(--md-sys-color-surface-container-high)',
              borderRadius: '0 16px 16px 0',
              fontStyle: 'italic',
              color: 'var(--md-sys-color-on-surface)',
              fontSize: '1.125rem',
              lineHeight: 1.6,
              fontFamily: 'serif',
            }}>
              "{attributes!.motto}"
            </blockquote>
          </ProfileSection>
        </div>
      )}
    </motion.div>
  );
}

// ──────────────────────
// Sub-components
// ──────────────────────

function ProfileSection({ 
  icon, 
  title, 
  children,
  compact = false,
}: { 
  icon: React.ReactNode; 
  title: string; 
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div style={{ marginTop: compact ? '16px' : '20px' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        marginBottom: '12px',
        color: 'var(--md-sys-color-on-surface-variant)',
      }}>
        {icon}
        <h3 style={{ 
          margin: 0, 
          fontSize: '0.875rem', 
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

// ──────────────────────
// Helpers
// ──────────────────────

function formatYear(dateStr: string): string {
  const match = dateStr.match(/^(\d{4})/);
  return match && match[1] ? match[1] : dateStr;
}

function translateInfluenceType(type: string): string {
  const translations: Record<string, string> = {
    author: 'Autor',
    philosopher: 'Philosoph',
    person: 'Person',
    mentor: 'Mentor',
    public_figure: 'Persönlichkeit',
    historical: 'Historisch',
    other: 'Sonstige',
  };
  const translated = translations[type];
  return translated !== undefined ? translated : type;
}

export default ProfileCard;
