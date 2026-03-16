'use client';

import { useChat } from '@ai-sdk/react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  BookText,
  FileText,
  Mic2,
  User,
} from 'lucide-react';
import { BIOGRAPHY_INTERVIEW_START_TOKEN } from '@/lib/biography/interview';
import styles from './AdminWorkspace.module.css';

type WorkspaceTab = 'profile' | 'content' | 'sessions' | 'interview';

type DetailEnvelope<T> = {
  data: T;
  message?: string;
};

type AdminUserDetailData = {
  user: {
    id: string;
    email: string | null;
    full_name: string | null;
    onboarding_complete: boolean | null;
    form_of_address: string | null;
    language_style: string | null;
    birth_date: string | null;
    birth_place: string | null;
    created_at: string;
    updated_at: string;
    alt_onboarding_private: unknown;
  };
  profile: {
    values: string[] | null;
    motto: string | null;
    influences: Array<{ name?: string; type?: string; why?: string }> | null;
    role_models: Array<{ name?: string; relationship?: string; traits?: string[] }> | null;
    favorite_authors: string[] | null;
    updated_at: string | null;
  } | null;
  memories: Array<{
    id: string;
    raw_transcript: string;
    cleaned_content: string | null;
    capture_mode: string;
    captured_at: string;
    interview_topic: string | null;
    interview_question: string | null;
    processing_status: string;
    source: string;
    chapter_id: string | null;
  }>;
  chapters: Array<{
    id: string;
    title: string;
    summary: string | null;
    status: string;
    memory_count: number;
    display_order: number;
    created_at: string;
    updated_at: string;
  }>;
  biographies: Array<{
    id: string;
    tone: string;
    version: number;
    is_current: boolean;
    created_at: string;
    updated_at: string;
    content: string;
  }>;
  interviewSessions: Array<{
    id: string;
    started_at: string;
    ended_at: string | null;
    topics_covered: string[] | null;
    memory_count: number;
    processing_status: string;
    summary: string | null;
  }>;
  chatSessions: Array<{
    id: string;
    title: string | null;
    type: string | null;
    updated_at: string;
    created_at: string;
    metadata: unknown;
  }>;
  lifeEvents: Array<{
    id: string;
    title: string;
    category: string;
    start_date: string | null;
    end_date: string | null;
    location: string | null;
  }>;
};

type Highlight = {
  label: string;
  value: string;
};

function joinClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

function formatDateTime(value: string | null) {
  if (!value) {
    return 'Nicht verfügbar';
  }

  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function excerpt(value: string | null | undefined, length = 180) {
  const text = value?.trim();
  if (!text) {
    return 'Noch kein Inhalt vorhanden.';
  }

  return text.length <= length ? text : `${text.slice(0, length).trim()}...`;
}

function formatSignalLabel(value: string) {
  return value.replace(/_/g, ' ');
}

function describeSignalValue(value: unknown): string | null {
  if (typeof value === 'string') {
    return excerpt(value, 120);
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return null;
    }

    const summaries = value
      .slice(0, 3)
      .map((entry) => describeSignalValue(entry))
      .filter((entry): entry is string => Boolean(entry));

    if (summaries.length === 0) {
      return `${value.length} gespeicherte Einträge`;
    }

    return `${summaries.join(' | ')}${value.length > 3 ? ' ...' : ''}`;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .slice(0, 2)
      .map(([key, entryValue]) => {
        const summary = describeSignalValue(entryValue);
        return summary ? `${formatSignalLabel(key)}: ${summary}` : null;
      })
      .filter((entry): entry is string => Boolean(entry));

    return entries.length > 0 ? entries.join(' | ') : `${Object.keys(value as object).length} gespeicherte Felder`;
  }

  return null;
}

function localizeTopic(value: string | null | undefined) {
  switch (value) {
    case 'identity':
      return 'Identität';
    case 'origins':
      return 'Herkunft';
    case 'family':
      return 'Familie';
    case 'education':
      return 'Bildung';
    case 'career':
    case 'work':
      return 'Beruf';
    case 'influences':
      return 'Einflüsse';
    case 'values':
      return 'Werte';
    case 'roots':
      return 'Wurzeln';
    case 'growing_up':
      return 'Aufwachsen';
    case 'learning':
      return 'Lernen';
    case 'love':
      return 'Liebe';
    case 'moments':
      return 'Momente';
    default:
      return value ? formatSignalLabel(value) : 'Unbekannt';
  }
}

function localizeProcessingStatus(value: string | null | undefined) {
  switch (value) {
    case 'pending':
      return 'Ausstehend';
    case 'processing':
      return 'In Bearbeitung';
    case 'complete':
      return 'Abgeschlossen';
    case 'failed':
      return 'Fehlgeschlagen';
    default:
      return value ? formatSignalLabel(value) : 'Unbekannt';
  }
}

function localizeChapterStatus(value: string | null | undefined) {
  switch (value) {
    case 'draft':
      return 'Entwurf';
    case 'published':
      return 'Veröffentlicht';
    default:
      return value ? formatSignalLabel(value) : 'Unbekannt';
  }
}

function localizeCaptureMode(value: string | null | undefined) {
  switch (value) {
    case 'interview':
      return 'Interview';
    case 'free_talk':
      return 'Freies Sprechen';
    case 'text':
      return 'Text';
    default:
      return value ? formatSignalLabel(value) : 'Unbekannt';
  }
}

function localizeSource(value: string | null | undefined) {
  switch (value) {
    case 'voice':
      return 'Sprache';
    case 'text':
      return 'Text';
    default:
      return value ? formatSignalLabel(value) : 'Unbekannt';
  }
}

function localizeLifeEventCategory(value: string | null | undefined) {
  switch (value) {
    case 'family':
      return 'Familie';
    case 'education':
      return 'Bildung';
    case 'career':
      return 'Beruf';
    case 'milestone':
      return 'Meilenstein';
    case 'travel':
      return 'Reise';
    case 'relationship':
      return 'Beziehung';
    default:
      return value ? formatSignalLabel(value) : 'Unbekannt';
  }
}

function localizeChatSessionType(value: string | null | undefined) {
  switch (value) {
    case 'onboarding':
      return 'Einstieg';
    case 'general':
      return 'Gespräch';
    default:
      return 'Gespräch';
  }
}

function localizeTone(value: string | null | undefined) {
  switch (value) {
    case 'neutral':
      return 'Neutral';
    case 'poetic':
      return 'Poetisch';
    case 'formal':
      return 'Formal';
    default:
      return value ? formatSignalLabel(value) : 'Unbekannt';
  }
}

function extractHighlights(payload: unknown): Highlight[] {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return [];
  }

  return Object.entries(payload as Record<string, unknown>)
    .map(([key, value]) => {
      const summary = describeSignalValue(value);
      return summary
        ? {
            label: formatSignalLabel(key),
            value: summary,
          }
        : null;
    })
    .filter((entry): entry is Highlight => Boolean(entry))
    .slice(0, 6);
}

function isAbortLikeError(error: unknown) {
  return (
    error instanceof Error &&
    (error.name === 'AbortError' ||
      error.message === 'signal is aborted without reason' ||
      error.message.toLowerCase().includes('abort'))
  );
}

async function fetchEnvelope<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, {
    cache: 'no-store',
    ...(signal ? { signal } : {}),
  });

  const payload = (await response.json().catch(() => null)) as DetailEnvelope<T> | null;

  if (!response.ok || !payload) {
    throw new Error(payload?.message ?? 'Die Anfrage ist fehlgeschlagen.');
  }

  return payload.data;
}

function Panel({
  title,
  subtitle,
  badge,
  muted = false,
  children,
}: {
  title: string;
  subtitle: string;
  badge?: string | undefined;
  muted?: boolean | undefined;
  children: ReactNode;
}) {
  return (
    <section className={joinClassNames(styles.panel, muted && styles.panelMuted)}>
      <div className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>{title}</h2>
          <p className={styles.panelSubtitle}>{subtitle}</p>
        </div>
        {badge ? <span className={styles.panelBadge}>{badge}</span> : null}
      </div>
      {children}
    </section>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return <div className={styles.emptyState}>{children}</div>;
}

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} className={styles.tabButton}>
      {label}
    </button>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.miniStat}>
      <div className={styles.miniStatValue}>{value}</div>
      <div className={styles.miniStatLabel}>{label}</div>
    </div>
  );
}

function DetailItem({
  title,
  badge,
  meta,
  children,
}: {
  title: string;
  badge?: string | undefined;
  meta?: string | undefined;
  children: ReactNode;
}) {
  return (
    <article className={styles.detailListItem}>
      <div className={styles.detailListItemHeader}>
        <div className={styles.detailListTitle}>{title}</div>
        {badge ? <span className={joinClassNames(styles.badge, styles.badgeSoft)}>{badge}</span> : null}
      </div>
      {meta ? <div className={styles.detailListMeta}>{meta}</div> : null}
      <div className={styles.detailListBody}>{children}</div>
    </article>
  );
}

function AdminInterviewPanel({
  userId,
  userName,
  interviewSessions,
  onRefresh,
}: {
  userId: string;
  userName: string;
  interviewSessions: AdminUserDetailData['interviewSessions'];
  onRefresh: () => Promise<void>;
}) {
  const activeSession = interviewSessions.find(
    (session) => session.processing_status === 'processing' && !session.ended_at,
  );
  const [interviewSessionId, setInterviewSessionId] = useState<string | null>(activeSession?.id ?? null);
  const [hasStarted, setHasStarted] = useState(false);
  const [ending, setEnding] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const { messages, input, handleInputChange, handleSubmit, append, error, isLoading } = useChat({
    api: `/api/admin/users/${userId}/interview`,
    initialMessages: [
      {
        id: 'admin-interview-welcome',
        role: 'assistant',
        content: `When you are ready, start the live interview for ${userName}. The assistant will ground itself in this participant's onboarding packet, saved memories, and prior sessions.`,
      },
    ],
    onResponse(response) {
      const nextSessionId = response.headers.get('x-interview-session-id');
      if (nextSessionId) {
        setInterviewSessionId(nextSessionId);
      }
    },
    onFinish() {
      void onRefresh();
    },
  });

  useEffect(() => {
    if (!interviewSessionId && activeSession?.id) {
      setInterviewSessionId(activeSession.id);
    }
  }, [activeSession?.id, interviewSessionId]);

  const startInterview = useCallback(async () => {
    setLocalError(null);
    setHasStarted(true);

    try {
      await append({
        role: 'user',
        content: BIOGRAPHY_INTERVIEW_START_TOKEN,
      });
    } catch (nextError) {
      setHasStarted(false);
      setLocalError(nextError instanceof Error ? nextError.message : 'Das Interview konnte nicht gestartet werden.');
    }
  }, [append]);

  const completeInterview = useCallback(async () => {
    if (!interviewSessionId) {
      return;
    }

    setEnding(true);
    setLocalError(null);

    try {
      const response = await fetch(`/api/admin/users/${userId}/interview`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interviewSessionId,
          endedAt: new Date().toISOString(),
          processingStatus: 'complete',
        }),
      });

      if (!response.ok) {
        throw new Error('Die Sitzung konnte nicht als abgeschlossen markiert werden.');
      }

      setHasStarted(false);
      setInterviewSessionId(null);
      await onRefresh();
    } catch (nextError) {
      setLocalError(nextError instanceof Error ? nextError.message : 'Die Sitzung konnte nicht als abgeschlossen markiert werden.');
    } finally {
      setEnding(false);
    }
  }, [interviewSessionId, onRefresh, userId]);

  const visibleMessages = messages.filter(
    (message) => !(message.role === 'user' && message.content === BIOGRAPHY_INTERVIEW_START_TOKEN),
  );

  return (
    <div className={styles.contentGrid}>
      <Panel
        title="Live-Interview"
        subtitle="KI-geführtes Interview für diese Person."
        badge={interviewSessionId ? `Sitzung ${interviewSessionId.slice(0, 8)}` : 'bereit'}
      >
        <div className={styles.buttonRow}>
          <button
            type="button"
            onClick={startInterview}
            disabled={isLoading || hasStarted}
            className={joinClassNames(styles.button, styles.buttonGhost)}
          >
            {hasStarted || activeSession ? 'Geführtes Interview fortsetzen' : 'Geführtes Interview starten'}
          </button>
          <button
            type="button"
            onClick={completeInterview}
            disabled={!interviewSessionId || ending}
            className={joinClassNames(styles.button, styles.buttonSecondary)}
          >
            {ending ? 'Sitzung wird beendet...' : 'Sitzung abschließen'}
          </button>
        </div>

        <div className={styles.chatShell}>
          <div className={styles.chatFeed}>
            <div className={styles.chatStream}>
              {visibleMessages.map((message) => (
                <div
                  key={message.id}
                  className={joinClassNames(
                    styles.chatMessage,
                    message.role === 'user' && styles.chatMessageUser,
                  )}
                >
                  {message.content}
                </div>
              ))}
              {isLoading ? (
                <div className={styles.chatMessage}>Die Interviewführung formuliert die nächste Frage...</div>
              ) : null}
            </div>
          </div>

          <form onSubmit={handleSubmit} className={styles.composer}>
            <div className={styles.composerRow}>
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Antwort der Person eingeben oder eine Anschlussanweisung hinzufügen..."
                className={styles.composerInput}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={joinClassNames(styles.button, styles.buttonPrimary)}
              >
                Senden
              </button>
            </div>
          </form>
        </div>

        {localError ? <div className={styles.errorCard}>{localError}</div> : null}
        {error ? <div className={styles.errorCard}>{error.message}</div> : null}
      </Panel>

      <div className={styles.stickyRail}>
        <Panel
          title="Letzte Sitzungen"
          subtitle="Offene oder abgeschlossene geführte Sitzungen."
          badge={`${interviewSessions.length} gesamt`}
          muted
        >
          {interviewSessions.length === 0 ? (
            <EmptyState>Es wurden noch keine Interviewsitzungen aufgezeichnet.</EmptyState>
          ) : (
            <div className={styles.list}>
              {interviewSessions.map((session) => (
                <DetailItem
                  key={session.id}
                  title={formatDateTime(session.started_at)}
                  badge={session.processing_status}
                  meta={`${session.memory_count} festgehaltene Erinnerungen${
                    session.topics_covered?.length ? ` • ${session.topics_covered.join(', ')}` : ''
                  }`}
                >
                  {session.summary ? excerpt(session.summary, 160) : 'Es gibt noch keine Sitzungszusammenfassung.'}
                </DetailItem>
              ))}
            </div>
          )}
        </Panel>

        <Panel
          title="Schnellkontext"
          subtitle="Knappes Interviewprofil aus den gespeicherten Profildaten."
          badge="Kontext"
        >
          <div className={styles.list}>
            <div className={styles.infoCard}>
              <div className={styles.metricLabel}>
                <User size={16} aria-hidden="true" />
                <span>Profil</span>
              </div>
              <p className={styles.infoText}>
                {userName}
              </p>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.metricLabel}>
                <BadgeCheck size={16} aria-hidden="true" />
                <span>Anzahl Sitzungen</span>
              </div>
              <p className={styles.infoText}>{interviewSessions.length} geführte Sitzungen</p>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

export function AdminUserWorkspaceModule({ userId }: { userId: string }) {
  const [tab, setTab] = useState<WorkspaceTab>('profile');
  const [detail, setDetail] = useState<AdminUserDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDetail = useCallback(
    async (signal?: AbortSignal) => {
      return fetchEnvelope<AdminUserDetailData>(`/api/admin/users/${userId}`, signal);
    },
    [userId],
  );

  const refreshDetail = useCallback(async () => {
    try {
      const data = await loadDetail();
      setDetail(data);
    } catch {
      return;
    }
  }, [loadDetail]);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    setLoading(true);
    setError(null);

    void loadDetail(controller.signal)
      .then((data) => {
        if (cancelled) {
          return;
        }
        setDetail(data);
      })
      .catch((nextError) => {
        if (cancelled || isAbortLikeError(nextError)) {
          return;
        }
        setError(nextError instanceof Error ? nextError.message : 'Der Arbeitsbereich der Person konnte nicht geladen werden.');
      })
      .finally(() => {
        if (cancelled) {
          return;
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [loadDetail]);

  const stats = useMemo(() => {
    if (!detail) {
      return [];
    }

    return [
      { label: 'Erinnerungen', value: String(detail.memories.length) },
      { label: 'Kapitel', value: String(detail.chapters.length) },
      { label: 'Biografien', value: String(detail.biographies.length) },
      { label: 'Interviews', value: String(detail.interviewSessions.length) },
    ];
  }, [detail]);

  const onboardingHighlights = useMemo(
    () => extractHighlights(detail?.user.alt_onboarding_private),
    [detail?.user.alt_onboarding_private],
  );

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={joinClassNames(styles.hero, styles.detailHero, styles.skeleton)} />
          <div className={styles.metricGrid}>
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className={joinClassNames(styles.metricCard, styles.skeleton)} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.errorCard}>
            <div className={styles.eyebrow}>Verwaltungsbereich</div>
            <div className={styles.panelTitle}>{error || 'Der Arbeitsbereich der Person konnte nicht geladen werden.'}</div>
            <Link href="/admin" className={styles.emptyLink}>
              <ArrowLeft size={14} aria-hidden="true" />
              Zurück zur Verwaltungsübersicht
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const userLabel = detail.user.full_name || detail.user.email || 'Unbenannte Person';
  const currentBiography = detail.biographies.find((biography) => biography.is_current) ?? detail.biographies[0] ?? null;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <section className={joinClassNames(styles.hero, styles.detailHero)}>
          <div className={styles.detailHeroCopy}>
            <Link href="/admin" className={styles.backLink}>
              <ArrowLeft size={14} aria-hidden="true" />
              Zurück zur Übersicht
            </Link>
            <div className={styles.eyebrow}>Teilnehmendenbereich</div>
            <h1 className={styles.detailTitle}>{userLabel}</h1>
            <p className={styles.detailLead}>Profildaten, gespeicherte Ausgaben und die Live-Interviewoberfläche für eine Person.</p>
            <div className={styles.metaRow}>
              <span className={joinClassNames(styles.badge, styles.badgeAccent)}>
                {detail.user.onboarding_complete ? 'Eingerichtet' : 'Unvollständig'}
              </span>
              <span className={styles.badge}>{detail.user.email || 'Keine E-Mail gespeichert'}</span>
              {detail.user.birth_place ? <span className={styles.badge}>{detail.user.birth_place}</span> : null}
              {detail.profile?.updated_at ? (
                <span className={styles.badge}>Profil aktualisiert {formatDateTime(detail.profile.updated_at)}</span>
              ) : null}
            </div>
          </div>

          <aside className={styles.statRail}>
            {stats.map((item) => (
              <StatTile key={item.label} label={item.label} value={item.value} />
            ))}
          </aside>
        </section>

        <div className={styles.tabRow}>
          <TabButton active={tab === 'profile'} label="Profil" onClick={() => setTab('profile')} />
          <TabButton active={tab === 'content'} label="Inhalte" onClick={() => setTab('content')} />
          <TabButton active={tab === 'sessions'} label="Sitzungen" onClick={() => setTab('sessions')} />
          <TabButton active={tab === 'interview'} label="Interview" onClick={() => setTab('interview')} />
        </div>

        {tab === 'profile' ? (
          <div className={styles.contentGrid}>
            <div className={styles.stack}>
              <Panel
                title="Profilsignale"
                subtitle="Zentrale Stammdaten und Profilpräferenzen."
                badge="Identität"
              >
                <div className={styles.splitGrid}>
                  <div className={styles.infoCard}>
                    <div className={styles.metricLabel}>
                      <User size={16} aria-hidden="true" />
                      <span>Stammdaten</span>
                    </div>
                    <div className={styles.infoText}>
                      <div>
                        <span className={styles.infoTextStrong}>Geburtsdatum:</span> {detail.user.birth_date || 'Nicht angegeben'}
                      </div>
                      <div>
                        <span className={styles.infoTextStrong}>Geburtsort:</span> {detail.user.birth_place || 'Nicht angegeben'}
                      </div>
                      <div>
                        <span className={styles.infoTextStrong}>Anrede:</span>{' '}
                        {detail.user.form_of_address || 'Unbekannt'}
                      </div>
                      <div>
                        <span className={styles.infoTextStrong}>Sprachstil:</span>{' '}
                        {detail.user.language_style || 'Unbekannt'}
                      </div>
                    </div>
                  </div>

                  <div className={styles.infoCard}>
                    <div className={styles.metricLabel}>
                      <FileText size={16} aria-hidden="true" />
                      <span>Profilmerkmale</span>
                    </div>
                    <div className={styles.infoText}>
                      <div>
                        <span className={styles.infoTextStrong}>Motto:</span> {detail.profile?.motto || 'Noch kein Motto gespeichert.'}
                      </div>
                      <div>
                        <span className={styles.infoTextStrong}>Werte:</span>{' '}
                        {detail.profile?.values?.length ? detail.profile.values.join(', ') : 'Keine Werte hinterlegt'}
                      </div>
                      <div>
                        <span className={styles.infoTextStrong}>Lieblingsautorinnen und -autoren:</span>{' '}
                        {detail.profile?.favorite_authors?.length
                          ? detail.profile.favorite_authors.join(', ')
                          : 'Keine Angaben vorhanden'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.splitGrid}>
                  <div className={styles.infoCard}>
                    <div className={styles.metricLabel}>
                      <BadgeCheck size={16} aria-hidden="true" />
                      <span>Einflüsse</span>
                    </div>
                    {detail.profile?.influences?.length ? (
                      <div className={styles.list}>
                        {detail.profile.influences.map((entry, index) => (
                          <DetailItem
                            key={`${entry.name}-${index}`}
                            title={entry.name || 'Unbekannt'}
                            badge={entry.type || undefined}
                          >
                            {entry.why || 'Keine Begründung hinterlegt.'}
                          </DetailItem>
                        ))}
                      </div>
                    ) : (
                      <EmptyState>Noch keine Einflüsse erfasst.</EmptyState>
                    )}
                  </div>

                  <div className={styles.infoCard}>
                    <div className={styles.metricLabel}>
                      <BookText size={16} aria-hidden="true" />
                      <span>Vorbilder</span>
                    </div>
                    {detail.profile?.role_models?.length ? (
                      <div className={styles.list}>
                        {detail.profile.role_models.map((entry, index) => (
                          <DetailItem
                            key={`${entry.name}-${index}`}
                            title={entry.name || 'Unbekannt'}
                            badge={entry.relationship || undefined}
                          >
                            {entry.traits?.length ? entry.traits.join(', ') : 'Keine Merkmale hinterlegt.'}
                          </DetailItem>
                        ))}
                      </div>
                    ) : (
                      <EmptyState>Noch keine Vorbilder erfasst.</EmptyState>
                    )}
                  </div>
                </div>
              </Panel>

              <Panel
                title="Ereignisgrundlage"
                subtitle="Strukturierte Ereignisse dieser Person."
                badge={`${detail.lifeEvents.length} Ereignisse`}
              >
                {detail.lifeEvents.length === 0 ? (
                  <EmptyState>Für diese Person sind noch keine strukturierten Lebensereignisse gespeichert.</EmptyState>
                ) : (
                  <div className={styles.list}>
                    {detail.lifeEvents.map((event) => (
                      <DetailItem
                        key={event.id}
                        title={event.title}
                        badge={localizeLifeEventCategory(event.category)}
                        meta={`${formatDateTime(event.start_date)}${event.location ? ` • ${event.location}` : ''}`}
                      >
                        {event.end_date ? `Endet am ${formatDateTime(event.end_date)}.` : 'Einzelnes Lebensereignis.'}
                      </DetailItem>
                    ))}
                  </div>
                )}
              </Panel>
            </div>

            <div className={styles.stickyRail}>
              <Panel
                title="Privates Onboarding-Paket"
                subtitle="Private Onboarding-Daten nur für Admins."
                badge="geschützt"
                muted
              >
                {onboardingHighlights.length > 0 ? (
                  <div className={styles.highlightGrid}>
                    {onboardingHighlights.map((highlight) => (
                      <div key={highlight.label} className={styles.highlightCard}>
                        <div className={styles.highlightTitle}>{highlight.label}</div>
                        <div className={styles.highlightValue}>{highlight.value}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState>Für diese Person wurde kein privates Onboarding-Paket gespeichert.</EmptyState>
                )}

                <pre className={styles.codeBlock}>
                  {JSON.stringify(detail.user.alt_onboarding_private, null, 2)}
                </pre>
              </Panel>
            </div>
          </div>
        ) : null}

        {tab === 'content' ? (
          <div className={styles.contentGrid}>
            <Panel
              title="Erfasste Erinnerungen"
              subtitle="Zuletzt gesammeltes Material."
              badge={`${detail.memories.length} Erinnerungen`}
            >
              {detail.memories.length === 0 ? (
                <EmptyState>Für diese Person wurden noch keine Erinnerungen erfasst.</EmptyState>
              ) : (
                <div className={styles.list}>
                  {detail.memories.map((memory) => (
                    <DetailItem
                      key={memory.id}
                      title={memory.interview_topic ? localizeTopic(memory.interview_topic) : localizeCaptureMode(memory.capture_mode)}
                      badge={localizeProcessingStatus(memory.processing_status)}
                      meta={`${formatDateTime(memory.captured_at)} • ${localizeSource(memory.source)}`}
                    >
                      {memory.interview_question ? (
                        <div className={styles.detailListMeta}>Frage: {memory.interview_question}</div>
                      ) : null}
                      {excerpt(memory.cleaned_content || memory.raw_transcript, 260)}
                    </DetailItem>
                  ))}
                </div>
              )}
            </Panel>

            <div className={styles.stickyRail}>
              <Panel
                title="Kapitelausgaben"
                subtitle="Erzeugte Kapitelbausteine."
                badge={`${detail.chapters.length} Kapitel`}
              >
                {detail.chapters.length === 0 ? (
                  <EmptyState>Es gibt noch keine Kapitelausgaben.</EmptyState>
                ) : (
                  <div className={styles.list}>
                    {detail.chapters.map((chapter) => (
                      <DetailItem
                        key={chapter.id}
                        title={chapter.title}
                        badge={localizeChapterStatus(chapter.status)}
                        meta={`${chapter.memory_count} verknüpfte Erinnerungen • Aktualisiert ${formatDateTime(chapter.updated_at)}`}
                      >
                        {excerpt(chapter.summary, 180)}
                      </DetailItem>
                    ))}
                  </div>
                )}
              </Panel>

              <Panel
                title="Biografieausgabe"
                subtitle="Aktuelle Biografiefassung."
                badge={currentBiography ? `v${currentBiography.version}` : 'keine'}
                muted
              >
                {currentBiography ? (
                  <div className={styles.list}>
                    <DetailItem
                      title={`Aktuelle Biografie (${localizeTone(currentBiography.tone)})`}
                      badge={currentBiography.is_current ? 'aktuell' : 'archiviert'}
                        meta={`Aktualisiert ${formatDateTime(currentBiography.updated_at)}`}
                      >
                        {excerpt(currentBiography.content, 360)}
                      </DetailItem>
                  </div>
                ) : (
                  <EmptyState>Es wurde noch keine Biografie erzeugt.</EmptyState>
                )}
              </Panel>
            </div>
          </div>
        ) : null}

        {tab === 'sessions' ? (
          <div className={styles.contentGrid}>
            <Panel
              title="Interviewverlauf"
              subtitle="Geführte Interviewsitzungen dieser Person."
              badge={`${detail.interviewSessions.length} Sitzungen`}
            >
              {detail.interviewSessions.length === 0 ? (
                <EmptyState>Für diese Person sind keine Interviewsitzungen gespeichert.</EmptyState>
              ) : (
                <div className={styles.list}>
                  {detail.interviewSessions.map((session) => (
                    <DetailItem
                      key={session.id}
                      title={formatDateTime(session.started_at)}
                      badge={localizeProcessingStatus(session.processing_status)}
                      meta={`${session.memory_count} Erinnerungen${
                        session.topics_covered?.length ? ` • ${session.topics_covered.join(', ')}` : ''
                      }`}
                    >
                      {session.summary ? excerpt(session.summary, 220) : 'Noch keine Sitzungszusammenfassung vorhanden.'}
                    </DetailItem>
                  ))}
                </div>
              )}
            </Panel>

            <div className={styles.stickyRail}>
              <Panel
                title="Chatsitzungen"
                subtitle="Gespeicherte Chatsitzungen."
                badge={`${detail.chatSessions.length} Chats`}
              >
                {detail.chatSessions.length === 0 ? (
                  <EmptyState>Für diese Person sind keine Chatsitzungen gespeichert.</EmptyState>
                ) : (
                  <div className={styles.list}>
                    {detail.chatSessions.map((session) => (
                      <DetailItem
                        key={session.id}
                        title={session.title || 'Unbenannte Sitzung'}
                        badge={localizeChatSessionType(session.type)}
                        meta={`Aktualisiert ${formatDateTime(session.updated_at)}`}
                      >
                        {excerpt(JSON.stringify(session.metadata), 180)}
                      </DetailItem>
                    ))}
                  </div>
                )}
              </Panel>
            </div>
          </div>
        ) : null}

        {tab === 'interview' ? (
          <AdminInterviewPanel
            userId={userId}
            userName={userLabel}
            interviewSessions={detail.interviewSessions}
            onRefresh={refreshDetail}
          />
        ) : null}

      </div>
    </div>
  );
}
