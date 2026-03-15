'use client'

import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  Book,
  CheckCircle2,
  FileText,
  RefreshCcw,
  Sparkles,
} from 'lucide-react'
import { useChapters } from '@/hooks/useChapters'
import { ChapterCard } from '@/components/chapters/ChapterCard'
import { ChapterPlanningBasisSchema } from '@/features/chapter-planning/contracts'
import { formatChapterTimeRange } from '@nality/schema'

export function ChaptersModule() {
  const router = useRouter()
  const {
    draftChapters,
    publishedChapters,
    readiness,
    loading,
    error,
    canGenerateChapters,
    generateChapters,
    confirmDraftChapters,
    generating,
    confirming,
    hasDraftChapters,
  } = useChapters()

  const leadingGap = readiness?.gaps?.[0] ?? null
  const leadingStrength = readiness?.strengths?.[0] ?? null
  const statusLabel = hasDraftChapters
    ? 'Entwurf bereit'
    : readiness?.ready
      ? 'Bereit für Kapitel'
      : 'Geschichte wächst noch'
  const statusHeadline = hasDraftChapters
    ? 'Ein erster Kapitelentwurf ist bereit'
    : readiness?.ready
      ? 'Deine Erinnerungen sind bereit, zu Kapiteln zu werden'
      : 'Die Form deiner Geschichte entsteht gerade'
  const statusCopy = hasDraftChapters
    ? 'Sieh dir den Entwurf in Ruhe an und bestätige ihn erst, wenn er sich richtig anfühlt. Vorher wird nichts verbindlich.'
    : readiness?.ready
      ? 'Deine gespeicherten Erinnerungen haben jetzt genug Breite und Tiefe für einen ersten Kapitelentwurf.'
      : leadingGap || 'Füge weitere konkrete Erinnerungen hinzu, dann erscheint hier der erste Kapitelentwurf.'
  
  if (loading) {
    return (
      <div
        role="status"
        aria-label="Kapitel werden geladen"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '50vh',
          color: 'rgba(255, 255, 255, 0.5)',
        }}
      >
        Kapitel werden geladen...
      </div>
    )
  }

  return (
    <div style={{ padding: '24px', maxWidth: '960px', margin: '0 auto' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ 
          marginBottom: '8px', 
          color: '#fff',
          fontFamily: 'var(--font-playfair, Playfair Display, serif)',
          fontSize: '1.85rem',
        }}>
          Deine Kapitel
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.64)', maxWidth: '620px', lineHeight: 1.6 }}>
          Deine Erinnerungen verdichten sich hier zuerst zu einem ruhigen Kapitelentwurf. Wenn er stimmig ist, kannst du ihn bestätigen und mit der Biografie weitermachen.
        </p>
      </header>

      {error && (
        <section
          role="alert"
          style={{
            marginBottom: '20px',
            padding: '16px 18px',
            borderRadius: '16px',
            background: 'rgba(194, 69, 69, 0.12)',
            border: '1px solid rgba(194, 69, 69, 0.28)',
            color: '#ffd5d5',
          }}
        >
          {error}
        </section>
      )}

      <section style={{
        marginBottom: '28px',
        padding: '24px',
        borderRadius: '24px',
        background: 'linear-gradient(180deg, rgba(212, 175, 55, 0.09), rgba(255, 255, 255, 0.02))',
        border: '1px solid rgba(212, 175, 55, 0.18)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '20px',
          flexWrap: 'wrap',
          marginBottom: '18px',
        }}>
          <div style={{ maxWidth: '620px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '10px',
              padding: '6px 10px',
              borderRadius: '999px',
              background: readiness?.ready
                ? 'rgba(61, 143, 90, 0.16)'
                : 'rgba(255, 255, 255, 0.06)',
              color: readiness?.ready ? '#9df1b2' : 'rgba(255, 255, 255, 0.72)',
              fontSize: '0.8rem',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}>
              {readiness?.ready ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              {statusLabel}
            </div>
            <h2 style={{
              margin: '0 0 10px',
              color: '#fff',
              fontFamily: 'var(--font-playfair, Playfair Display, serif)',
              fontSize: '1.45rem',
            }}>
              {statusHeadline}
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.68)', lineHeight: 1.65, margin: 0 }}>
              {statusCopy}
            </p>
            {leadingStrength && !hasDraftChapters && (
              <p style={{
                margin: '12px 0 0',
                color: 'rgba(212, 175, 55, 0.84)',
                fontSize: '0.92rem',
                lineHeight: 1.55,
              }}>
                {leadingStrength}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {hasDraftChapters ? (
              <>
                <button
                  onClick={() => confirmDraftChapters()}
                  disabled={confirming}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '14px 22px',
                    background: '#D4AF37',
                    border: 'none',
                    borderRadius: '999px',
                    color: '#111',
                    fontWeight: 700,
                    cursor: confirming ? 'wait' : 'pointer',
                    opacity: confirming ? 0.72 : 1,
                  }}
                >
                  <CheckCircle2 size={16} />
                  {confirming ? 'Wird bestätigt...' : 'Entwurfskapitel bestätigen'}
                </button>
                <button
                  onClick={() => generateChapters(true)}
                  disabled={generating || confirming}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '14px 22px',
                    background: 'transparent',
                    border: '1px solid rgba(212, 175, 55, 0.42)',
                    borderRadius: '999px',
                    color: '#D4AF37',
                    fontWeight: 600,
                    cursor: generating || confirming ? 'wait' : 'pointer',
                    opacity: generating || confirming ? 0.72 : 1,
                  }}
                >
                  <RefreshCcw size={16} />
                  {generating ? 'Entwürfe werden erneuert...' : 'Entwürfe erneuern'}
                </button>
              </>
            ) : (
              <button
                onClick={() => generateChapters()}
                disabled={!canGenerateChapters}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 22px',
                  background: canGenerateChapters
                    ? 'linear-gradient(135deg, #D4AF37, rgba(180, 140, 20, 1))'
                    : 'rgba(255, 255, 255, 0.06)',
                  border: 'none',
                  borderRadius: '999px',
                  color: canGenerateChapters ? '#111' : 'rgba(255, 255, 255, 0.45)',
                  fontWeight: 700,
                  cursor: canGenerateChapters && !generating ? 'pointer' : 'not-allowed',
                  opacity: generating ? 0.72 : 1,
                }}
              >
                <Sparkles size={16} />
                {generating ? 'Entwurfskapitel werden erstellt...' : 'Entwurfskapitel erstellen'}
              </button>
            )}
          </div>
        </div>
      </section>

      {hasDraftChapters && (
        <section style={{ marginBottom: '32px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{
              margin: '0 0 6px',
              color: '#fff',
              fontFamily: 'var(--font-playfair, Playfair Display, serif)',
              fontSize: '1.45rem',
            }}>
              Kapitelentwürfe
            </h2>
            <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.62)', lineHeight: 1.6 }}>
              Prüfe die vorgeschlagene Kapitelstruktur, bevor sie zur offiziellen Grundlage deiner Biografie wird.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {draftChapters.map((chapter) => {
              const planningBasisResult = ChapterPlanningBasisSchema.safeParse(chapter.planning_basis)
              const evidenceSummary = planningBasisResult.success
                ? planningBasisResult.data.evidenceSummary
                : 'Evidence details are not available for this draft.'
              const supportMemoryCount = planningBasisResult.success
                ? planningBasisResult.data.supportingMemoryIds.length
                : chapter.memory_count || 0

              return (
                <article
                  key={chapter.id}
                  style={{
                    padding: '22px',
                    borderRadius: '20px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '18px',
                    flexWrap: 'wrap',
                    marginBottom: '14px',
                  }}>
                    <div>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 8px',
                        borderRadius: '999px',
                        background: 'rgba(212, 175, 55, 0.11)',
                        color: '#D4AF37',
                        fontSize: '0.72rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        marginBottom: '10px',
                      }}>
                        <Book size={13} />
                        Draft
                      </div>
                      <h3 style={{
                        margin: '0 0 6px',
                        color: '#fff',
                        fontFamily: 'var(--font-playfair, Playfair Display, serif)',
                        fontSize: '1.25rem',
                      }}>
                        {chapter.title}
                      </h3>
                      <div style={{ color: 'rgba(255, 255, 255, 0.52)', fontSize: '0.88rem' }}>
                        {formatChapterTimeRange(chapter)}
                      </div>
                    </div>
                  </div>

                  {chapter.summary && (
                    <p style={{
                      margin: '0 0 14px',
                      color: 'rgba(255, 255, 255, 0.78)',
                      lineHeight: 1.7,
                    }}>
                      {chapter.summary}
                    </p>
                  )}

                  <p style={{
                    margin: 0,
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '0.86rem',
                    lineHeight: 1.55,
                  }}>
                    {evidenceSummary}
                    {supportMemoryCount > 0 ? ` Grundlage: ${supportMemoryCount} Erinnerungen.` : ''}
                  </p>
                </article>
              )
            })}
          </div>
        </section>
      )}

      {publishedChapters.length > 0 ? (
        <section>
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{
              margin: '0 0 6px',
              color: '#fff',
              fontFamily: 'var(--font-playfair, Playfair Display, serif)',
              fontSize: '1.45rem',
            }}>
              Published Chapters
            </h2>
            <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.62)', lineHeight: 1.6 }}>
              These chapters are now the confirmed structure that your biography generator will use.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {publishedChapters.map((chapter) => (
              <ChapterCard
                key={chapter.id}
                chapter={chapter}
                onClick={() => router.push(`/dash/chapters/${chapter.id}`)}
              />
            ))}
          </div>
        </section>
      ) : !hasDraftChapters && (
        <section style={{
          padding: '30px',
          textAlign: 'center',
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}>
          <div style={{
            width: '74px',
            height: '74px',
            borderRadius: '50%',
            background: 'rgba(212, 175, 55, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px',
          }}>
            <Book size={28} style={{ color: '#D4AF37', opacity: 0.75 }} />
          </div>
          <h2 style={{
            margin: '0 0 12px',
            color: '#fff',
            fontFamily: 'var(--font-playfair, Playfair Display, serif)',
          }}>
            Chapter planning will start here
          </h2>
          <p style={{
            margin: '0 auto',
            maxWidth: '560px',
            color: 'rgba(255, 255, 255, 0.62)',
            lineHeight: 1.7,
          }}>
            As soon as the saved memories hold enough breadth and detail, this space will quietly turn into your first chapter outline.
          </p>
        </section>
      )}
      
      {publishedChapters.length > 0 && (
        <div style={{
          marginTop: '40px',
          padding: '24px',
          background: 'rgba(212, 175, 55, 0.05)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          borderRadius: '16px',
          textAlign: 'center',
        }}>
          <FileText size={24} style={{ color: '#D4AF37', marginBottom: '12px' }} />
          <h3 style={{ 
            marginBottom: '12px', 
            color: '#fff',
            fontFamily: 'var(--font-playfair, Playfair Display, serif)',
          }}>
            Ready to Create Your Biography?
          </h3>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.6)', 
            marginBottom: '20px',
            fontSize: '0.9rem',
          }}>
            Your published chapters are in place. Biography generation remains a separate, manual step.
          </p>
          <button 
            onClick={() => router.push('/dash/biography')}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              border: '1px solid #D4AF37',
              borderRadius: '100px',
              color: '#D4AF37',
              fontWeight: 500,
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            View Biography
          </button>
        </div>
      )}
    </div>
  )
}
