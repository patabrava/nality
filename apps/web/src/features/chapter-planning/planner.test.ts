import { describe, expect, it } from 'vitest'
import { evaluateNarrativeReadiness } from './readiness'
import { buildDraftChapterCandidates } from './planner'
import type { PlanningMemory, PlanningProgressRow } from './contracts'

function createMemory(input: {
  id: string
  topic: string
  text: string
  chapterId?: string | null
  processingStatus?: string | null
}): PlanningMemory {
  return {
    id: input.id,
    raw_transcript: input.text,
    cleaned_content: input.text,
    captured_at: '2026-03-14T09:00:00.000Z',
    interview_topic: input.topic,
    interview_question: null,
    topics: [input.topic],
    chapter_id: input.chapterId ?? null,
    processing_status: input.processingStatus ?? 'complete',
  }
}

function createProgress(input: {
  questionId: string
  topicId: string
  state?: PlanningProgressRow['state']
  answerExcerpt?: string
}): PlanningProgressRow {
  return {
    question_id: input.questionId,
    topic_id: input.topicId,
    state: input.state ?? 'answered',
    answer_excerpt: input.answerExcerpt ?? 'Ausreichend beantwortet mit konkreten Details und Zeitbezug.',
    answered_at: '2026-03-14T09:00:00.000Z',
    answer_memory_id: null,
  }
}

function createStrongFixture() {
  const memories: PlanningMemory[] = [
    createMemory({
      id: '00000000-0000-0000-0000-000000000001',
      topic: 'basis_information',
      text: '1982 begann mein Leben in Medellin. Unsere kleine Wohnung, meine Eltern und die ersten Routinen haben mir früh ein Gefühl von Herkunft und Zuhause gegeben.',
    }),
    createMemory({
      id: '00000000-0000-0000-0000-000000000002',
      topic: 'childhood_and_youth',
      text: 'In den 1990er Jahren war die Schulzeit voller Musik, Straßenfußball und kleiner Mutproben, die mir gezeigt haben, wie sehr Gemeinschaft und Neugier mein Aufwachsen geprägt haben.',
    }),
    createMemory({
      id: '00000000-0000-0000-0000-000000000003',
      topic: 'education_and_career',
      text: '2004 zog ich für das Studium nach Bogotá. Die ersten Arbeitsjahre nach 2008 waren anstrengend, aber sie haben mir Disziplin und einen klareren beruflichen Kompass gegeben.',
    }),
    createMemory({
      id: '00000000-0000-0000-0000-000000000004',
      topic: 'relationships_and_social_environment',
      text: 'Die Freundschaften aus meiner Zeit in Berlin ab 2012 und die spätere Partnerschaft haben meinen Alltag und meine Entscheidungen auf eine viel tiefere Weise geordnet als ich erwartet hatte.',
    }),
    createMemory({
      id: '00000000-0000-0000-0000-000000000005',
      topic: 'life_philosophy_and_future',
      text: 'Seit 2020 denke ich bewusster darüber nach, was ich weitergeben möchte. Gelassenheit, Verantwortung und Humor sind dabei zu einem inneren Leitfaden geworden.',
    }),
    createMemory({
      id: '00000000-0000-0000-0000-000000000006',
      topic: 'family_background',
      text: 'Die Geschichten meiner Großmutter über Migration, Arbeit und Zusammenhalt haben unser Familienbild zusammengehalten und erklärt, warum Loyalität für uns immer so zentral war.',
    }),
  ]

  const progressRows: PlanningProgressRow[] = [
    createProgress({ questionId: 'basis.birth', topicId: 'basis_information', answerExcerpt: '1982 in Medellin geboren.' }),
    createProgress({ questionId: 'family.background', topicId: 'family_background', answerExcerpt: 'Starke Familiengeschichten über Migration und Zusammenhalt.' }),
    createProgress({ questionId: 'childhood.scene', topicId: 'childhood_and_youth', answerExcerpt: 'Schulzeit und Jugend in den 1990ern.' }),
    createProgress({ questionId: 'career.path', topicId: 'education_and_career', answerExcerpt: 'Studium 2004, erste Arbeit ab 2008.' }),
    createProgress({ questionId: 'relationships.turning', topicId: 'relationships_and_social_environment', answerExcerpt: 'Freundschaften und Partnerschaft ab 2012.' }),
    createProgress({ questionId: 'future.values', topicId: 'life_philosophy_and_future', answerExcerpt: 'Seit 2020 klare Werte und Weitergabe.' }),
  ]

  return { memories, progressRows }
}

describe('chapter planning readiness', () => {
  it('returns not ready when the corpus is too thin and noisy', () => {
    const memories = [
      createMemory({
        id: '00000000-0000-0000-0000-000000000011',
        topic: 'basis_information',
        text: 'Kurz.',
      }),
      createMemory({
        id: '00000000-0000-0000-0000-000000000012',
        topic: 'education_and_career',
        text: 'Noch zu knapp.',
        processingStatus: 'processing',
      }),
    ]

    const progressRows = [
      createProgress({ questionId: 'basis.birth', topicId: 'basis_information' }),
      createProgress({ questionId: 'career.path', topicId: 'education_and_career' }),
    ]

    const readiness = evaluateNarrativeReadiness(progressRows, memories)

    expect(readiness.ready).toBe(false)
    expect(readiness.usableMemoryCount).toBe(0)
    expect(readiness.gaps).toContain('Es fehlen noch mindestens fünf belastbare Erinnerungen mit genug Tiefe.')
  })

  it('returns not ready when coverage is too narrow even with enough memories', () => {
    const memories = Array.from({ length: 6 }, (_, index) =>
      createMemory({
        id: `00000000-0000-0000-0000-00000000010${index + 1}`,
        topic: 'basis_information',
        text: `198${index} erinnere ich mich an Zuhause, Familie und dieselben Routinen. Die Erinnerung ist ausführlich, aber sie bleibt im selben Themenfeld und erweitert den Lebensbogen nicht.`,
      }),
    )

    const progressRows = [
      createProgress({ questionId: 'basis.birth', topicId: 'basis_information' }),
      createProgress({ questionId: 'basis.home', topicId: 'basis_information' }),
      createProgress({ questionId: 'basis.voice', topicId: 'basis_information' }),
      createProgress({ questionId: 'basis.more', topicId: 'basis_information' }),
      createProgress({ questionId: 'basis.more-2', topicId: 'basis_information' }),
      createProgress({ questionId: 'basis.more-3', topicId: 'basis_information' }),
    ]

    const readiness = evaluateNarrativeReadiness(progressRows, memories)

    expect(readiness.ready).toBe(false)
    expect(readiness.thematicSpread).toBe(1)
    expect(readiness.gaps).toContain('Die bisherigen Erinnerungen decken noch zu wenige Lebensthemen ab.')
  })

  it('returns ready when coverage and corpus quality support chapter planning', () => {
    const { memories, progressRows } = createStrongFixture()

    const readiness = evaluateNarrativeReadiness(progressRows, memories)

    expect(readiness.ready).toBe(true)
    expect(readiness.usableMemoryCount).toBe(6)
    expect(readiness.answeredQuestionCount).toBe(6)
    expect(readiness.coverageScore).toBeGreaterThanOrEqual(0.75)
    expect(readiness.corpusQualityScore).toBeGreaterThanOrEqual(0.6)
  })

  it('ignores bootstrap placeholder memories when computing readiness', () => {
    const { memories, progressRows } = createStrongFixture()
    memories.push(
      createMemory({
        id: '00000000-0000-0000-0000-000000000099',
        topic: 'childhood_and_youth',
        text: 'Bitte eröffne das Biografiegespräch jetzt mit der ersten passenden Frage.',
      }),
    )

    const readiness = evaluateNarrativeReadiness(progressRows, memories)

    expect(readiness.ready).toBe(true)
    expect(readiness.usableMemoryCount).toBe(6)
  })
})

describe('chapter planning draft builder', () => {
  it('emits evidence-backed draft candidates without reusing memories', () => {
    const { memories, progressRows } = createStrongFixture()
    const readiness = evaluateNarrativeReadiness(progressRows, memories)

    const candidates = buildDraftChapterCandidates({
      readiness,
      progressRows,
      memories,
    })

    expect(candidates.length).toBeGreaterThanOrEqual(4)
    expect(candidates.map(candidate => candidate.candidateKey)).toEqual(
      expect.arrayContaining(['roots', 'growing_up', 'finding_a_path', 'bonds_and_turning_points', 'outlook_and_legacy']),
    )
    expect(candidates.every(candidate => candidate.supportingMemoryIds.length > 0)).toBe(true)
    expect(candidates.every(candidate => candidate.evidenceSummary.length > 0)).toBe(true)

    const allMemoryIds = candidates.flatMap(candidate => candidate.supportingMemoryIds)
    expect(new Set(allMemoryIds).size).toBe(allMemoryIds.length)
  })

  it('never uses bootstrap placeholder memories as chapter evidence', () => {
    const { memories, progressRows } = createStrongFixture()
    memories.unshift(
      createMemory({
        id: '00000000-0000-0000-0000-000000000098',
        topic: 'basis_information',
        text: 'Bitte eröffne das Biografiegespräch jetzt mit der ersten passenden Frage.',
      }),
    )

    const readiness = evaluateNarrativeReadiness(progressRows, memories)
    const candidates = buildDraftChapterCandidates({
      readiness,
      progressRows,
      memories,
    })

    expect(candidates.flatMap(candidate => candidate.supportingMemoryIds)).not.toContain(
      '00000000-0000-0000-0000-000000000098',
    )
    expect(candidates[0]?.summary).not.toContain('Bitte eröffne das Biografiegespräch')
  })
})
