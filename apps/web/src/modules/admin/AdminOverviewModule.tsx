'use client';

import Link from 'next/link';
import { useDeferredValue, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Activity,
  ArrowUpRight,
  BookText,
  Mic2,
  Users,
} from 'lucide-react';
import styles from './AdminWorkspace.module.css';

type WindowFilter = '7d' | '30d' | '90d';
type StatusFilter = 'all' | 'onboarded' | 'incomplete' | 'with_memories';

type ChartPoint = {
  label: string;
  value: number;
};

type AdminOverviewData = {
  filters: {
    window: WindowFilter;
  };
  summary: {
    totalUsers: number;
    onboardedUsers: number;
    activeUsers: number;
    currentBiographies: number;
    interviewSessions: number;
    averageMemoriesPerInterview: number;
  };
  charts: {
    userGrowth: ChartPoint[];
    memoryTrend: ChartPoint[];
    captureModes: ChartPoint[];
    topTopics: ChartPoint[];
  };
};

type AdminUserSearchItem = {
  id: string;
  email: string | null;
  full_name: string | null;
  onboarding_complete: boolean | null;
  created_at: string;
  updated_at: string;
  birth_date: string | null;
  birth_place: string | null;
  stats: {
    memories: number;
    chapters: number;
    interviews: number;
    hasBiography: boolean;
    lastMemoryAt: string | null;
  };
};

type Envelope<T> = {
  data: T;
  message?: string;
};

type MetricConfig = {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
};

function joinClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('de-DE').format(value);
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 1,
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) {
    return 'No activity yet';
  }

  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function formatChartLabel(label: string) {
  const date = new Date(label);
  if (!Number.isNaN(date.getTime()) && /^\d{4}-\d{2}-\d{2}/.test(label)) {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: 'short',
    }).format(date);
  }

  return label.replace(/_/g, ' ');
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

  const payload = (await response.json().catch(() => null)) as Envelope<T> | null;

  if (!response.ok || !payload) {
    throw new Error(payload?.message ?? 'Die Anfrage ist fehlgeschlagen.');
  }

  return payload.data;
}

function FilterPill({
  active,
  compact = false,
  children,
  onClick,
}: {
  active: boolean;
  compact?: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={joinClassNames(
        styles.pill,
        compact && styles.pillSecondary,
        active && styles.pillActive,
      )}
    >
      {children}
    </button>
  );
}

function MetricCard({ label, value, detail, icon }: MetricConfig) {
  return (
    <article className={styles.metricCard}>
      <div className={styles.metricLabel}>
        {icon}
        <span>{label}</span>
      </div>
      <div className={styles.metricValue}>{value}</div>
      <p className={styles.metricDetail}>{detail}</p>
    </article>
  );
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

function BarChart({
  title,
  subtitle,
  badge,
  points,
}: {
  title: string;
  subtitle: string;
  badge?: string;
  points: ChartPoint[];
}) {
  if (points.length === 0) {
    return (
      <Panel title={title} subtitle={subtitle} badge={badge}>
        <EmptyState>No data recorded in this window yet.</EmptyState>
      </Panel>
    );
  }

  const maxValue = Math.max(...points.map((point) => point.value), 1);
  const width = 520;
  const height = 250;
  const chartHeight = 164;
  const baseY = 188;
  const step = width / Math.max(points.length, 1);

  return (
    <Panel title={title} subtitle={subtitle} badge={badge}>
      <div className={styles.chartFrame}>
        <svg viewBox={`0 0 ${width} ${height}`} className={styles.chartSvg} aria-hidden="true">
          <defs>
            <linearGradient id="admin-bar-gold" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(240, 211, 140, 0.96)" />
              <stop offset="100%" stopColor="rgba(143, 97, 21, 0.9)" />
            </linearGradient>
          </defs>
          <line x1="0" y1={baseY} x2={width} y2={baseY} stroke="rgba(255,255,255,0.08)" />
          {points.map((point, index) => {
            const barWidth = Math.max(step - 14, 18);
            const x = step * index + (step - barWidth) / 2;
            const barHeight = (point.value / maxValue) * chartHeight;
            const y = baseY - barHeight;

            return (
              <g key={`${point.label}-${index}`}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="12"
                  fill="url(#admin-bar-gold)"
                />
                <text
                  x={x + barWidth / 2}
                  y="220"
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.45)"
                  fontSize="11"
                >
                  {formatChartLabel(point.label)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </Panel>
  );
}

function LineChart({
  title,
  subtitle,
  badge,
  points,
}: {
  title: string;
  subtitle: string;
  badge?: string;
  points: ChartPoint[];
}) {
  if (points.length === 0) {
    return (
      <Panel title={title} subtitle={subtitle} badge={badge}>
        <EmptyState>No activity recorded in this window yet.</EmptyState>
      </Panel>
    );
  }

  const maxValue = Math.max(...points.map((point) => point.value), 1);
  const width = 520;
  const height = 250;
  const graphHeight = 160;
  const startY = 20;
  const baseY = 194;
  const step = points.length > 1 ? width / (points.length - 1) : width;
  const coordinates = points.map((point, index) => ({
    x: step * index,
    y: baseY - (point.value / maxValue) * graphHeight,
    label: point.label,
  }));
  const linePath = coordinates
    .map((coordinate, index) => `${index === 0 ? 'M' : 'L'} ${coordinate.x} ${coordinate.y}`)
    .join(' ');
  const fillPath = `${linePath} L ${width} ${baseY} L 0 ${baseY} Z`;

  return (
    <Panel title={title} subtitle={subtitle} badge={badge}>
      <div className={styles.chartFrame}>
        <svg viewBox={`0 0 ${width} ${height}`} className={styles.chartSvg} aria-hidden="true">
          <defs>
            <linearGradient id="admin-line-fill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(240, 211, 140, 0.38)" />
              <stop offset="100%" stopColor="rgba(240, 211, 140, 0)" />
            </linearGradient>
          </defs>
          <line x1="0" y1={baseY} x2={width} y2={baseY} stroke="rgba(255,255,255,0.08)" />
          <path d={fillPath} fill="url(#admin-line-fill)" />
          <path
            d={linePath}
            fill="none"
            stroke="rgba(240, 211, 140, 0.96)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {coordinates.map((coordinate, index) => (
            <g key={`${coordinate.label}-${index}`}>
              <circle
                cx={coordinate.x}
                cy={coordinate.y}
                r="5"
                fill="#090807"
                stroke="rgba(240, 211, 140, 0.96)"
                strokeWidth="2"
              />
              <text
                x={coordinate.x}
                y="220"
                textAnchor="middle"
                fill="rgba(255,255,255,0.45)"
                fontSize="11"
              >
                {formatChartLabel(coordinate.label)}
              </text>
            </g>
          ))}
          <text
            x="0"
            y={startY}
            fill="rgba(255,255,255,0.28)"
            fontSize="11"
          >
            peak {formatNumber(maxValue)}
          </text>
        </svg>
      </div>
    </Panel>
  );
}

export function AdminOverviewModule() {
  const [windowFilter, setWindowFilter] = useState<WindowFilter>('30d');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  const [overview, setOverview] = useState<AdminOverviewData | null>(null);
  const [users, setUsers] = useState<AdminUserSearchItem[]>([]);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    setOverviewLoading(true);
    setOverviewError(null);

    void fetchEnvelope<AdminOverviewData>(`/api/admin/overview?window=${windowFilter}`, controller.signal)
      .then((data) => {
        if (cancelled) {
          return;
        }
        setOverview(data);
      })
      .catch((error) => {
        if (cancelled || isAbortLikeError(error)) {
          return;
        }
        setOverviewError(error instanceof Error ? error.message : 'Die Übersicht konnte nicht geladen werden.');
      })
      .finally(() => {
        if (cancelled) {
          return;
        }
        setOverviewLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [windowFilter]);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      const search = new URLSearchParams({
        limit: '20',
        status: statusFilter,
      });

      if (deferredQuery.trim()) {
        search.set('q', deferredQuery.trim());
      }

      setUsersLoading(true);
      setUsersError(null);

      void fetchEnvelope<{ items: AdminUserSearchItem[] }>(
        `/api/admin/users?${search.toString()}`,
        controller.signal,
      )
        .then((data) => {
          if (cancelled) {
            return;
          }
          setUsers(data.items);
        })
        .catch((error) => {
          if (cancelled || isAbortLikeError(error)) {
            return;
          }
          setUsersError(error instanceof Error ? error.message : 'Die Nutzerdaten konnten nicht geladen werden.');
        })
        .finally(() => {
          if (cancelled) {
            return;
          }
          setUsersLoading(false);
        });
    }, 160);

    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [deferredQuery, statusFilter]);

  const summaryCards = useMemo<MetricConfig[]>(() => {
    if (!overview) {
      return [];
    }

    return [
      {
        label: 'Nutzende gesamt',
        value: formatNumber(overview.summary.totalUsers),
        detail: `${formatNumber(overview.summary.onboardedUsers)} vollständig eingerichtete Profile im Archiv`,
        icon: <Users size={16} aria-hidden="true" />,
      },
      {
        label: 'Aktive Nutzende',
        value: formatNumber(overview.summary.activeUsers),
        detail: `Beobachtete Aktivität im aktiven Zeitraum ${overview.filters.window}`,
        icon: <Activity size={16} aria-hidden="true" />,
      },
      {
        label: 'Biografien',
        value: formatNumber(overview.summary.currentBiographies),
        detail: 'Aktuelle Biografieversionen für Prüfung, Export oder Übergabe',
        icon: <BookText size={16} aria-hidden="true" />,
      },
      {
        label: 'Interviewlast',
        value: formatNumber(overview.summary.interviewSessions),
        detail: `${formatCompactNumber(overview.summary.averageMemoriesPerInterview)} Erinnerungen pro Sitzung im Durchschnitt`,
        icon: <Mic2 size={16} aria-hidden="true" />,
      },
    ];
  }, [overview]);

  const strongestTopicValue = Math.max(...(overview?.charts.topTopics ?? []).map((point) => point.value), 1);
  const strongestCaptureValue = Math.max(
    ...(overview?.charts.captureModes ?? []).map((point) => point.value),
    1,
  );

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}>Verwaltungsbereich</div>
            <h1 className={styles.title}>Verwaltungsübersicht für Suche, laufende Sitzungen und Archivstatus.</h1>
            <p className={styles.lead}>
              Suche eine Person, prüfe die Kernaktivität und öffne den Einzelarbeitsbereich, wenn gerade ein begleitetes Interview läuft.
            </p>

            <div className={styles.heroNotes}>
              <article className={styles.noteCard}>
                <div className={styles.noteLabel}>Bindungssignal</div>
                <div className={styles.noteValue}>
                  {overview ? formatNumber(overview.summary.activeUsers) : '...'}
                </div>
                <p className={styles.noteDetail}>
                  Teilnehmende mit jüngster Aktivität im gewählten Zeitraum.
                </p>
              </article>

              <article className={styles.noteCard}>
                <div className={styles.noteLabel}>Erzählbereitschaft</div>
                <div className={styles.noteValue}>
                  {overview ? formatNumber(overview.summary.currentBiographies) : '...'}
                </div>
                <p className={styles.noteDetail}>
                  Aktuelle Biografien, die für Export, Prüfung oder persönliche Begleitung bereitstehen.
                </p>
              </article>

              <article className={styles.noteCard}>
                <div className={styles.noteLabel}>Interview-Takt</div>
                <div className={styles.noteValue}>
                  {overview ? formatCompactNumber(overview.summary.averageMemoriesPerInterview) : '...'} Ø
                </div>
                <p className={styles.noteDetail}>
                  Nützlich als Live-Vergleichswert während eines begleiteten Gesprächs vor Ort.
                </p>
              </article>
            </div>
          </div>

          <aside className={styles.heroAside}>
            <section className={styles.asideCard}>
              <div className={styles.eyebrow}>Zeitraumauswahl</div>
              <h2 className={styles.asideTitle}>Metriken und Diagramme bleiben an einen aktiven Zeitraum gebunden.</h2>

              <div className={styles.filterRow}>
                {(['7d', '30d', '90d'] as const).map((value) => (
                  <FilterPill
                    key={value}
                    active={windowFilter === value}
                    onClick={() => setWindowFilter(value)}
                  >
                    Letzte {value}
                  </FilterPill>
                ))}
              </div>
            </section>
          </aside>
        </section>

        {overviewError ? <div className={styles.errorCard}>{overviewError}</div> : null}

        <section className={styles.metricGrid}>
          {overviewLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className={joinClassNames(styles.metricCard, styles.skeleton)} />
              ))
            : summaryCards.map((card) => <MetricCard key={card.label} {...card} />)}
        </section>

        <section className={styles.overviewGrid}>
          <div className={styles.chartGrid}>
            <BarChart
              title="Neue Registrierungen"
              subtitle="Tägliche Registrierungen im gewählten Zeitraum."
              badge="Wachstum"
              points={overview?.charts.userGrowth ?? []}
            />
            <LineChart
              title="Erinnerungsfluss"
              subtitle="Erfasste Erinnerungsmenge im Zeitverlauf, hilfreich zum Erkennen stockender Interviews."
              badge="Erfassung"
              points={overview?.charts.memoryTrend ?? []}
            />
          </div>

          <Panel
            title="Archiv-Mix"
            subtitle="Aktuelle Erfassungsarten und wiederkehrende Themen im gewählten Zeitraum."
            badge="Mix"
            muted
          >
            {(overview?.charts.captureModes ?? []).length === 0 ? (
              <EmptyState>In diesem Zeitraum gibt es keine Aktivität bei den Erfassungsarten.</EmptyState>
            ) : (
              <div className={styles.stack}>
                <div className={styles.meterList}>
                  {(overview?.charts.captureModes ?? []).map((point) => (
                    <div key={point.label} className={styles.meterRow}>
                      <div className={styles.meterHead}>
                        <span>{formatChartLabel(point.label)}</span>
                        <span>{formatNumber(point.value)}</span>
                      </div>
                      <div className={styles.meterTrack}>
                        <div
                          className={styles.meterFill}
                          style={{ width: `${(point.value / strongestCaptureValue) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <div className={styles.fieldLabel}>Häufigste wiederkehrende Themen</div>
                  {(overview?.charts.topTopics ?? []).length === 0 ? (
                    <EmptyState>In diesem Zeitraum gibt es keine dominanten Themencluster.</EmptyState>
                  ) : (
                    <div className={styles.topicList}>
                      {(overview?.charts.topTopics ?? []).map((topic) => (
                        <div key={topic.label} className={styles.meterRow}>
                          <div className={styles.meterHead}>
                            <span>{formatChartLabel(topic.label)}</span>
                            <span>{formatNumber(topic.value)}</span>
                          </div>
                          <div className={styles.meterTrack}>
                            <div
                              className={styles.meterFill}
                              style={{ width: `${(topic.value / strongestTopicValue) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </Panel>
        </section>

        <section className={styles.directoryGrid}>
          <Panel
            title="Teilnehmendenverzeichnis"
            subtitle="Suche nach Name oder E-Mail und öffne dann den jeweiligen Arbeitsbereich."
            badge={usersLoading ? 'loading' : `${users.length} matches`}
          >
            <div className={styles.searchBar}>
              <label htmlFor="admin-user-search" className={styles.fieldLabel}>
                Personensuche
              </label>
              <input
                id="admin-user-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Teilnehmende nach Name oder E-Mail suchen"
                className={styles.searchInput}
              />
            </div>

            <div className={styles.filterRow}>
              {([
                ['all', 'Alle Personen'],
                ['onboarded', 'Eingerichtet'],
                ['incomplete', 'Unvollständig'],
                ['with_memories', 'Mit Erinnerungen'],
              ] as const).map(([value, label]) => (
                <FilterPill
                  key={value}
                  active={statusFilter === value}
                  compact
                  onClick={() => setStatusFilter(value)}
                >
                  {label}
                </FilterPill>
              ))}
            </div>

            {usersError ? <div className={styles.errorCard}>{usersError}</div> : null}

            <div className={styles.directory}>
              {usersLoading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className={joinClassNames(styles.directoryRow, styles.skeleton)} />
                  ))
                : null}

              {!usersLoading && users.length === 0 ? (
                <EmptyState>Keine Person passt zu den aktuellen Filtern.</EmptyState>
              ) : null}

              {!usersLoading
                ? users.map((user) => {
                    const userLabel = user.full_name || user.email || 'Unbenannte Person';
                    const statusLabel = user.onboarding_complete ? 'Eingerichtet' : 'Unvollständig';

                    return (
                      <Link key={user.id} href={`/admin/users/${user.id}`} className={styles.directoryRow}>
                        <div className={styles.directoryIdentity}>
                          <div className={styles.directoryName}>{userLabel}</div>
                          <div className={styles.directoryEmail}>{user.email || 'Keine E-Mail gespeichert'}</div>
                          <div className={styles.badgeRow}>
                            <span className={joinClassNames(styles.badge, styles.badgeAccent)}>{statusLabel}</span>
                            {user.birth_place ? <span className={styles.badge}>{user.birth_place}</span> : null}
                            {user.stats.hasBiography ? <span className={styles.badge}>Biografie bereit</span> : null}
                          </div>
                        </div>

                        <div className={styles.directoryMetric}>
                          <span className={styles.directoryMetricValue}>{user.stats.memories}</span>
                          <span className={styles.directoryMetricLabel}>Erinnerungen</span>
                        </div>

                        <div className={styles.directoryMetric}>
                          <span className={styles.directoryMetricValue}>{user.stats.chapters}</span>
                          <span className={styles.directoryMetricLabel}>Kapitel</span>
                        </div>

                        <div className={styles.directoryMetric}>
                          <span className={styles.directoryMetricValue}>{user.stats.interviews}</span>
                          <span className={styles.directoryMetricLabel}>Interviews</span>
                        </div>

                        <div className={styles.directoryMeta}>
                          <div>{formatDate(user.stats.lastMemoryAt)}</div>
                          <div>Aktualisiert {formatDate(user.updated_at)}</div>
                        </div>

                        <div className={styles.arrowTag} aria-hidden="true">
                          <ArrowUpRight size={16} />
                        </div>
                      </Link>
                    );
                  })
                : null}
            </div>
          </Panel>
        </section>
      </div>
    </div>
  );
}
