import { beforeEach, describe, expect, it, vi } from 'vitest'

const createClientMock = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: createClientMock,
}))

type TableName = 'chapters' | 'memories' | 'interview_question_progress'

type TestState = {
  user: { id: string } | null
  tables: Record<TableName, Array<Record<string, any>>>
  idCounter: number
}

class MockQuery {
  private filters: Array<(row: Record<string, any>) => boolean> = []
  private selectedColumns: string | null = null
  private sortColumn: string | null = null
  private sortAscending = true
  private limitCount: number | null = null
  private resultPromise: Promise<{ data: any; error: null }> | null = null

  constructor(
    private readonly state: TestState,
    private readonly table: TableName,
    private readonly operation: 'select' | 'insert' | 'update' | 'delete' = 'select',
    private readonly payload?: any,
  ) {}

  select(columns = '*') {
    this.selectedColumns = columns
    return this
  }

  eq(column: string, value: unknown) {
    this.filters.push((row) => row[column] === value)
    return this
  }

  in(column: string, values: unknown[]) {
    this.filters.push((row) => values.includes(row[column]))
    return this
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.sortColumn = column
    this.sortAscending = options?.ascending ?? true
    return this
  }

  limit(count: number) {
    this.limitCount = count
    return this
  }

  async single() {
    const result = await this.execute()
    return {
      data: Array.isArray(result.data) ? result.data[0] ?? null : result.data,
      error: null,
    }
  }

  async maybeSingle() {
    return this.single()
  }

  then(resolve: (value: { data: any; error: null }) => any, reject?: (reason: unknown) => any) {
    return this.execute().then(resolve, reject)
  }

  private execute() {
    if (!this.resultPromise) {
      this.resultPromise = this.run()
    }

    return this.resultPromise
  }

  private async run() {
    const tableRows = this.state.tables[this.table]

    if (this.operation === 'select') {
      return {
        data: this.projectRows(this.applyQuery(tableRows)),
        error: null,
      }
    }

    if (this.operation === 'insert') {
      const rows = Array.isArray(this.payload) ? this.payload : [this.payload]
      const insertedRows = rows.map((row) => {
        const inserted = {
          ...row,
          id: row.id ?? this.nextId(),
          created_at: row.created_at ?? '2026-03-14T09:00:00.000Z',
          updated_at: row.updated_at ?? '2026-03-14T09:00:00.000Z',
        }
        tableRows.push(inserted)
        return inserted
      })

      return {
        data: this.projectRows(insertedRows),
        error: null,
      }
    }

    const matchingRows = this.applyQuery(tableRows)

    if (this.operation === 'update') {
      const updatedRows = matchingRows.map((row) => {
        Object.assign(row, this.payload)
        return row
      })

      return {
        data: this.projectRows(updatedRows),
        error: null,
      }
    }

    const deletedIds = new Set(matchingRows.map((row) => row.id))
    this.state.tables[this.table] = tableRows.filter((row) => !deletedIds.has(row.id))
    return {
      data: this.projectRows(matchingRows),
      error: null,
    }
  }

  private applyQuery(rows: Array<Record<string, any>>) {
    let result = rows.filter((row) => this.filters.every((filter) => filter(row)))

    if (this.sortColumn) {
      result = [...result].sort((left, right) => {
        const leftValue = left[this.sortColumn as string]
        const rightValue = right[this.sortColumn as string]

        if (leftValue === rightValue) return 0
        if (leftValue == null) return this.sortAscending ? 1 : -1
        if (rightValue == null) return this.sortAscending ? -1 : 1

        const comparison = leftValue > rightValue ? 1 : -1
        return this.sortAscending ? comparison : comparison * -1
      })
    }

    if (this.limitCount != null) {
      result = result.slice(0, this.limitCount)
    }

    return result
  }

  private projectRows(rows: Array<Record<string, any>>) {
    if (!this.selectedColumns || this.selectedColumns === '*') {
      return rows.map((row) => ({ ...row }))
    }

    const columns = this.selectedColumns
      .split(',')
      .map((column) => column.trim())
      .filter(Boolean)

    return rows.map((row) =>
      Object.fromEntries(columns.map((column) => [column, row[column]])),
    )
  }

  private nextId() {
    this.state.idCounter += 1
    return `00000000-0000-0000-0000-${String(this.state.idCounter).padStart(12, '0')}`
  }
}

function createSupabaseMock(state: TestState) {
  return {
    auth: {
      getUser: async () => ({
        data: {
          user: state.user,
        },
      }),
    },
    from(table: string) {
      const tableName = table as TableName

      return {
        select(columns = '*') {
          return new MockQuery(state, tableName, 'select').select(columns)
        },
        insert(payload: any) {
          return new MockQuery(state, tableName, 'insert', payload)
        },
        update(payload: any) {
          return new MockQuery(state, tableName, 'update', payload)
        },
        delete() {
          return new MockQuery(state, tableName, 'delete')
        },
      }
    },
  }
}

function createMemory(id: string, interviewTopic: string, text: string) {
  return {
    id,
    user_id: '00000000-0000-0000-0000-000000000001',
    raw_transcript: text,
    cleaned_content: text,
    captured_at: '2026-03-14T09:00:00.000Z',
    interview_topic: interviewTopic,
    interview_question: null,
    topics: [interviewTopic],
    chapter_id: null,
    processing_status: 'complete',
  }
}

function createProgress(questionId: string, topicId: string, answerExcerpt: string) {
  return {
    id: `progress-${questionId}`,
    interview_session_id: '11111111-1111-1111-1111-111111111111',
    user_id: '00000000-0000-0000-0000-000000000001',
    question_id: questionId,
    topic_id: topicId,
    state: 'answered',
    answer_excerpt: answerExcerpt,
    answered_at: '2026-03-14T09:00:00.000Z',
    answer_memory_id: null,
    updated_at: '2026-03-14T09:00:00.000Z',
  }
}

function createProgressForSession(
  sessionId: string,
  questionId: string,
  topicId: string,
  answerExcerpt: string,
  updatedAt: string,
) {
  return {
    id: `progress-${sessionId}-${questionId}`,
    interview_session_id: sessionId,
    user_id: '00000000-0000-0000-0000-000000000001',
    question_id: questionId,
    topic_id: topicId,
    state: 'answered',
    answer_excerpt: answerExcerpt,
    answered_at: updatedAt,
    answer_memory_id: null,
    updated_at: updatedAt,
  }
}

function createReadyState(): TestState {
  return {
    user: { id: '00000000-0000-0000-0000-000000000001' },
    idCounter: 100,
    tables: {
      chapters: [],
      memories: [
        createMemory(
          '00000000-0000-0000-0000-000000000011',
          'basis_information',
          '1982 begann mein Leben in Medellin. Unsere kleine Wohnung, meine Eltern und die ersten Routinen haben mir früh ein Gefühl von Herkunft und Zuhause gegeben.',
        ),
        createMemory(
          '00000000-0000-0000-0000-000000000012',
          'childhood_and_youth',
          'In den 1990er Jahren war die Schulzeit voller Musik, Straßenfußball und kleiner Mutproben, die mir gezeigt haben, wie sehr Gemeinschaft und Neugier mein Aufwachsen geprägt haben.',
        ),
        createMemory(
          '00000000-0000-0000-0000-000000000013',
          'education_and_career',
          '2004 zog ich für das Studium nach Bogotá. Die ersten Arbeitsjahre nach 2008 waren anstrengend, aber sie haben mir Disziplin und einen klareren beruflichen Kompass gegeben.',
        ),
        createMemory(
          '00000000-0000-0000-0000-000000000014',
          'relationships_and_social_environment',
          'Die Freundschaften aus meiner Zeit in Berlin ab 2012 und die spätere Partnerschaft haben meinen Alltag und meine Entscheidungen auf eine viel tiefere Weise geordnet als ich erwartet hatte.',
        ),
        createMemory(
          '00000000-0000-0000-0000-000000000015',
          'life_philosophy_and_future',
          'Seit 2020 denke ich bewusster darüber nach, was ich weitergeben möchte. Gelassenheit, Verantwortung und Humor sind dabei zu einem inneren Leitfaden geworden.',
        ),
        createMemory(
          '00000000-0000-0000-0000-000000000016',
          'family_background',
          'Die Geschichten meiner Großmutter über Migration, Arbeit und Zusammenhalt haben unser Familienbild zusammengehalten und erklärt, warum Loyalität für uns immer so zentral war.',
        ),
      ],
      interview_question_progress: [
        createProgress('basis.birth', 'basis_information', '1982 in Medellin geboren.'),
        createProgress('family.background', 'family_background', 'Familiengeschichten über Migration und Zusammenhalt.'),
        createProgress('childhood.scene', 'childhood_and_youth', 'Schulzeit und Jugend in den 1990ern.'),
        createProgress('career.path', 'education_and_career', 'Studium 2004, erste Arbeit ab 2008.'),
        createProgress('relationships.turning', 'relationships_and_social_environment', 'Freundschaften und Partnerschaft ab 2012.'),
        createProgress('future.values', 'life_philosophy_and_future', 'Seit 2020 klare Werte und Weitergabe.'),
      ],
    },
  }
}

describe('chapter planning routes', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.resetModules()
  })

  it('returns a structured not-ready payload without creating chapters', async () => {
    const state: TestState = {
      user: { id: '00000000-0000-0000-0000-000000000001' },
      idCounter: 1,
      tables: {
        chapters: [],
        memories: [
          createMemory(
            '00000000-0000-0000-0000-000000000021',
            'basis_information',
            'Zu kurz.',
          ),
        ],
        interview_question_progress: [
          createProgress('basis.birth', 'basis_information', 'Geboren in Medellin.'),
        ],
      },
    }
    createClientMock.mockResolvedValue(createSupabaseMock(state))

    const { POST } = await import('@/app/api/chapters/generate/route')
    const response = await POST(
      new Request('http://test.local/api/chapters/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.ready).toBe(false)
    expect(body.data.chapters_created).toBe(0)
    expect(state.tables.chapters).toHaveLength(0)
  })

  it('creates draft chapter candidates with planning metadata and keeps memories unassigned', async () => {
    const state = createReadyState()
    createClientMock.mockResolvedValue(createSupabaseMock(state))

    const { POST } = await import('@/app/api/chapters/generate/route')
    const response = await POST(
      new Request('http://test.local/api/chapters/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.ready).toBe(true)
    expect(body.data.chapters_created).toBeGreaterThanOrEqual(4)
    expect(state.tables.chapters.every((chapter) => chapter.status === 'draft')).toBe(true)
    expect(state.tables.chapters.every((chapter) => chapter.planning_basis?.readiness?.ready === true)).toBe(true)
    expect(state.tables.memories.every((memory) => memory.chapter_id === null)).toBe(true)
  })

  it('ignores duplicate answered questions from older interview sessions when evaluating readiness', async () => {
    const state: TestState = {
      user: { id: '00000000-0000-0000-0000-000000000001' },
      idCounter: 200,
      tables: {
        chapters: [],
        memories: [
          createMemory(
            '00000000-0000-0000-0000-000000000101',
            'basis_information',
            '1982 begann mein Leben in Medellin. Die ersten Jahre meiner Kindheit waren geprägt von einer kleinen Wohnung, den Stimmen meiner Eltern und einem sehr starken Gefühl von Herkunft.',
          ),
          createMemory(
            '00000000-0000-0000-0000-000000000102',
            'childhood_and_youth',
            'In meiner Jugend gab es viel Musik, Straßenfußball und Schulfreundschaften, die mich geprägt haben. Diese Erinnerungen tragen bis heute meine Vorstellung von Gemeinschaft.',
          ),
          createMemory(
            '00000000-0000-0000-0000-000000000103',
            'education_and_career',
            'Für das Studium zog ich nach Bogotá und begann dort später meine ersten Jobs. Diese Phase hat mir Struktur und berufliche Richtung gegeben.',
          ),
          createMemory(
            '00000000-0000-0000-0000-000000000104',
            'family_background',
            'Die Geschichte meiner Großmutter über Migration und Zusammenhalt war in unserer Familie immer präsent und wurde zu einer wichtigen inneren Orientierung.',
          ),
          createMemory(
            '00000000-0000-0000-0000-000000000105',
            'life_philosophy_and_future',
            'Seit einigen Jahren denke ich viel bewusster über Verantwortung, Gelassenheit und das weiter nach, was ich an meine Familie weitergeben möchte.',
          ),
        ],
        interview_question_progress: [
          createProgressForSession(
            'old-session',
            'basis.birth',
            'basis_information',
            '1982 in Medellin geboren.',
            '2026-03-13T08:00:00.000Z',
          ),
          createProgressForSession(
            'old-session',
            'career.path',
            'education_and_career',
            'Studium und Berufsstart in Bogotá.',
            '2026-03-13T08:05:00.000Z',
          ),
          createProgressForSession(
            'old-session',
            'future.values',
            'life_philosophy_and_future',
            'Gelassenheit und Verantwortung sind wichtig.',
            '2026-03-13T08:10:00.000Z',
          ),
          createProgressForSession(
            'new-session',
            'basis.birth',
            'basis_information',
            'Geboren 1982 in Medellin.',
            '2026-03-14T10:00:00.000Z',
          ),
          createProgressForSession(
            'new-session',
            'career.path',
            'education_and_career',
            'Später Studium und Arbeit in Bogotá.',
            '2026-03-14T10:05:00.000Z',
          ),
          createProgressForSession(
            'new-session',
            'future.values',
            'life_philosophy_and_future',
            'Heute sind mir Gelassenheit und Verantwortung wichtig.',
            '2026-03-14T10:10:00.000Z',
          ),
        ],
      },
    }
    createClientMock.mockResolvedValue(createSupabaseMock(state))

    const { POST } = await import('@/app/api/chapters/generate/route')
    const response = await POST(
      new Request('http://test.local/api/chapters/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.ready).toBe(false)
    expect(body.data.readiness.answeredQuestionCount).toBe(3)
    expect(body.data.chapters_created).toBe(0)
    expect(state.tables.chapters).toHaveLength(0)
  })

  it('publishes only the confirmed draft chapters and assigns memories on confirmation', async () => {
    const readinessSnapshot = {
      ready: true,
      coverageScore: 0.88,
      corpusQualityScore: 0.82,
      chronologyScore: 0.67,
      thematicSpread: 5,
      usableMemoryCount: 6,
      answeredQuestionCount: 6,
      gaps: [],
      strengths: ['Genug Material für belastbare Kapitelentwürfe.'],
    }

    const state: TestState = {
      user: { id: '00000000-0000-0000-0000-000000000001' },
      idCounter: 30,
      tables: {
        chapters: [
          {
            id: '00000000-0000-0000-0000-000000000031',
            user_id: '00000000-0000-0000-0000-000000000001',
            title: 'Wo alles begann',
            summary: 'Draft one',
            status: 'draft',
            theme_keywords: ['roots'],
            memory_count: 2,
            display_order: 0,
            planning_basis: {
              candidateKey: 'roots',
              readiness: readinessSnapshot,
              supportingMemoryIds: [
                '00000000-0000-0000-0000-000000000041',
                '00000000-0000-0000-0000-000000000042',
              ],
              supportingQuestionIds: ['basis.birth'],
              evidenceSummary: '2 Erinnerungen tragen diesen Entwurf.',
            },
          },
          {
            id: '00000000-0000-0000-0000-000000000032',
            user_id: '00000000-0000-0000-0000-000000000001',
            title: 'Eigene Wege finden',
            summary: 'Draft two',
            status: 'draft',
            theme_keywords: ['path'],
            memory_count: 1,
            display_order: 1,
            planning_basis: {
              candidateKey: 'finding_a_path',
              readiness: readinessSnapshot,
              supportingMemoryIds: ['00000000-0000-0000-0000-000000000043'],
              supportingQuestionIds: ['career.path'],
              evidenceSummary: '1 Erinnerung trägt diesen Entwurf.',
            },
          },
        ],
        memories: [
          createMemory(
            '00000000-0000-0000-0000-000000000041',
            'basis_information',
            'Eine ausführliche Herkunftserinnerung mit Familie, Wohnung und frühen Routinen.',
          ),
          createMemory(
            '00000000-0000-0000-0000-000000000042',
            'family_background',
            'Eine zweite ausführliche Familienerinnerung über Zusammenhalt und Werte.',
          ),
          createMemory(
            '00000000-0000-0000-0000-000000000043',
            'education_and_career',
            'Eine längere Erinnerung über Studium, Beruf und Orientierung.',
          ),
        ],
        interview_question_progress: [],
      },
    }
    createClientMock.mockResolvedValue(createSupabaseMock(state))

    const { POST } = await import('@/app/api/chapters/confirm/route')
    const response = await POST(
      new Request('http://test.local/api/chapters/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chapter_ids: ['00000000-0000-0000-0000-000000000031'],
        }),
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.chapters_confirmed).toBe(1)
    expect(state.tables.chapters.find((chapter) => chapter.id === '00000000-0000-0000-0000-000000000031')?.status).toBe('published')
    expect(state.tables.chapters.find((chapter) => chapter.id === '00000000-0000-0000-0000-000000000032')?.status).toBe('draft')
    expect(state.tables.memories.find((memory) => memory.id === '00000000-0000-0000-0000-000000000041')?.chapter_id).toBe('00000000-0000-0000-0000-000000000031')
    expect(state.tables.memories.find((memory) => memory.id === '00000000-0000-0000-0000-000000000042')?.chapter_id).toBe('00000000-0000-0000-0000-000000000031')
    expect(state.tables.memories.find((memory) => memory.id === '00000000-0000-0000-0000-000000000043')?.chapter_id).toBe(null)
  })
})
