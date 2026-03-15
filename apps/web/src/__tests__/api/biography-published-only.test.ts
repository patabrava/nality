import { beforeEach, describe, expect, it, vi } from 'vitest'

const createClientMock = vi.fn()
const openaiMock = vi.fn()
const generateTextMock = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: createClientMock,
}))

vi.mock('@ai-sdk/openai', () => ({
  openai: openaiMock,
}))

vi.mock('ai', () => ({
  generateText: generateTextMock,
}))

type TableName = 'chapters' | 'memories' | 'users' | 'biographies'

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
    private readonly operation: 'select' | 'insert' | 'update' = 'select',
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
    const rows = this.state.tables[this.table]
    const filteredRows = this.applyQuery(rows)

    if (this.operation === 'select') {
      return {
        data: this.projectRows(filteredRows),
        error: null,
      }
    }

    if (this.operation === 'update') {
      const updatedRows = filteredRows.map((row) => {
        Object.assign(row, this.payload)
        return row
      })

      return {
        data: this.projectRows(updatedRows),
        error: null,
      }
    }

    const records = Array.isArray(this.payload) ? this.payload : [this.payload]
    const insertedRows = records.map((record) => {
      const inserted = {
        ...record,
        id: record.id ?? this.nextId(),
        created_at: record.created_at ?? '2026-03-14T09:00:00.000Z',
        updated_at: record.updated_at ?? '2026-03-14T09:00:00.000Z',
      }
      rows.push(inserted)
      return inserted
    })

    return {
      data: this.projectRows(insertedRows),
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
      }
    },
  }
}

function createState(chapters: Array<Record<string, any>>): TestState {
  return {
    user: { id: '00000000-0000-0000-0000-000000000001' },
    idCounter: 10,
    tables: {
      chapters,
      memories: [
        {
          id: '00000000-0000-0000-0000-000000000101',
          user_id: '00000000-0000-0000-0000-000000000001',
          chapter_id: '00000000-0000-0000-0000-000000000201',
          raw_transcript: 'Eine veröffentlichte Erinnerung über Herkunft und Familie.',
          cleaned_content: 'Eine veröffentlichte Erinnerung über Herkunft und Familie.',
          captured_at: '2026-03-14T09:00:00.000Z',
        },
        {
          id: '00000000-0000-0000-0000-000000000102',
          user_id: '00000000-0000-0000-0000-000000000001',
          chapter_id: '00000000-0000-0000-0000-000000000202',
          raw_transcript: 'Eine noch unveröffentlichte Erinnerung aus einem Entwurf.',
          cleaned_content: 'Eine noch unveröffentlichte Erinnerung aus einem Entwurf.',
          captured_at: '2026-03-14T09:05:00.000Z',
        },
      ],
      users: [
        {
          id: '00000000-0000-0000-0000-000000000001',
          full_name: 'Max Mustermann',
          birth_date: '1982-02-11',
          birth_place: 'Medellin',
        },
      ],
      biographies: [],
    },
  }
}

describe('biography generation uses only published chapters', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.resetModules()
    openaiMock.mockReturnValue('mock-model')
    generateTextMock.mockResolvedValue({
      text: 'Generated biography text.',
    })
  })

  it('rejects biography generation when only draft chapters exist', async () => {
    const state = createState([
      {
        id: '00000000-0000-0000-0000-000000000202',
        user_id: '00000000-0000-0000-0000-000000000001',
        title: 'Draft chapter',
        summary: 'Not confirmed yet',
        status: 'draft',
        display_order: 0,
      },
    ])
    createClientMock.mockResolvedValue(createSupabaseMock(state))

    const { POST } = await import('@/app/api/biography/generate/route')
    const response = await POST(
      new Request('http://test.local/api/biography/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tone: 'neutral',
        }),
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('No chapters available to generate biography from')
    expect(generateTextMock).not.toHaveBeenCalled()
  })

  it('generates the biography from published chapters only', async () => {
    const state = createState([
      {
        id: '00000000-0000-0000-0000-000000000201',
        user_id: '00000000-0000-0000-0000-000000000001',
        title: 'Published chapter',
        summary: 'Confirmed and ready',
        status: 'published',
        display_order: 0,
        time_range_start: '1982-01-01',
        time_range_end: '1999-12-31',
      },
      {
        id: '00000000-0000-0000-0000-000000000202',
        user_id: '00000000-0000-0000-0000-000000000001',
        title: 'Draft chapter',
        summary: 'Should stay excluded',
        status: 'draft',
        display_order: 1,
        time_range_start: '2000-01-01',
        time_range_end: '2005-12-31',
      },
    ])
    createClientMock.mockResolvedValue(createSupabaseMock(state))

    const { POST } = await import('@/app/api/biography/generate/route')
    const response = await POST(
      new Request('http://test.local/api/biography/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tone: 'neutral',
        }),
      }),
    )
    const body = await response.json()
    const prompt = generateTextMock.mock.calls[0]?.[0]?.prompt

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.chapters_used).toBe(1)
    expect(prompt).toContain('Published chapter')
    expect(prompt).not.toContain('Draft chapter')
    expect(state.tables.biographies).toHaveLength(1)
    expect(state.tables.biographies[0]?.chapter_ids).toEqual(['00000000-0000-0000-0000-000000000201'])
  })

  it('returns 404 when there is no current biography to export', async () => {
    const state = createState([
      {
        id: '00000000-0000-0000-0000-000000000201',
        user_id: '00000000-0000-0000-0000-000000000001',
        title: 'Published chapter',
        summary: 'Confirmed and ready',
        status: 'published',
        display_order: 0,
        time_range_start: '1982-01-01',
        time_range_end: '1999-12-31',
      },
    ])
    createClientMock.mockResolvedValue(createSupabaseMock(state))

    const { GET } = await import('@/app/api/biography/export/route')
    const response = await GET(new Request('http://test.local/api/biography/export'))
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body.error).toBe('No biography available to export')
  })

  it('exports the current biography as a pdf attachment', async () => {
    const state = createState([
      {
        id: '00000000-0000-0000-0000-000000000201',
        user_id: '00000000-0000-0000-0000-000000000001',
        title: 'Published chapter',
        summary: 'Confirmed and ready',
        status: 'published',
        display_order: 0,
        time_range_start: '1982-01-01',
        time_range_end: '1999-12-31',
      },
    ])

    state.tables.biographies.push({
      id: '00000000-0000-0000-0000-000000000301',
      user_id: '00000000-0000-0000-0000-000000000001',
      content:
        'Max grew up surrounded by family stories and a strong sense of place.\n\nAs he grew older, work and responsibility gave those stories a new meaning.',
      tone: 'neutral',
      version: 1,
      is_current: true,
      chapter_ids: ['00000000-0000-0000-0000-000000000201'],
      created_at: '2026-03-14T10:00:00.000Z',
    })

    createClientMock.mockResolvedValue(createSupabaseMock(state))

    const { GET } = await import('@/app/api/biography/export/route')
    const response = await GET(new Request('http://test.local/api/biography/export'))
    const bytes = Buffer.from(await response.arrayBuffer())
    const pdfText = bytes.toString('latin1')

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/pdf')
    expect(response.headers.get('Content-Disposition')).toContain('attachment; filename="max-mustermann-biography-v1.pdf"')
    expect(bytes.subarray(0, 7).toString('latin1')).toBe('%PDF-1.')
    expect(pdfText).toContain('/Type /Catalog')
    expect(pdfText).toContain('/BaseFont /Helvetica-Bold')
  })
})
