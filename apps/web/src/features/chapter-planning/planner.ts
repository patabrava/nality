import {
  CHAPTER_PLANNING_GROUPS,
  DraftChapterCandidateSchema,
  type DraftChapterCandidate,
  type NarrativeReadiness,
  type PlanningMemory,
  type PlanningProgressRow,
} from './contracts';

const NON_NARRATIVE_MEMORY_PATTERNS = [
  /^Bitte eröffne das Biografiegespräch jetzt mit der ersten passenden Frage\.?$/i,
  /^prompt_generation_successful/i,
  /^system_ready/i,
  /^runtime_state/i,
] as const;

function getMemoryContent(memory: PlanningMemory): string {
  return (memory.cleaned_content || memory.raw_transcript || '').replace(/\s+/g, ' ').trim();
}

function isNarrativeMemory(memory: PlanningMemory): boolean {
  const content = getMemoryContent(memory);
  if (!content) {
    return false;
  }

  return !NON_NARRATIVE_MEMORY_PATTERNS.some((pattern) => pattern.test(content));
}

function getExcerpt(text: string, maxLength = 140): string {
  const compact = text.replace(/\s+/g, ' ').trim();
  return compact.length > maxLength ? `${compact.slice(0, maxLength - 3)}...` : compact;
}

function extractYears(text: string): number[] {
  return Array.from(text.matchAll(/\b(18|19|20)\d{2}\b/g)).map((match) => Number(match[0]));
}

function resolveTimeRange(memories: PlanningMemory[], progressRows: PlanningProgressRow[]) {
  const years = [
    ...memories.flatMap((memory) => extractYears(getMemoryContent(memory))),
    ...progressRows.flatMap((row) => extractYears((row.answer_excerpt || '').replace(/\s+/g, ' ').trim())),
  ].sort((left, right) => left - right);

  if (years.length === 0) {
    return {
      timeRangeStart: null,
      timeRangeEnd: null,
    };
  }

  const firstYear = years[0];
  const lastYear = years[years.length - 1];

  return {
    timeRangeStart: `${firstYear}-01-01`,
    timeRangeEnd: `${lastYear}-12-31`,
  };
}

export function buildDraftChapterCandidates(input: {
  readiness: NarrativeReadiness;
  progressRows: PlanningProgressRow[];
  memories: PlanningMemory[];
}): DraftChapterCandidate[] {
  if (!input.readiness.ready) {
    return [];
  }

  const unassignedMemories = input.memories.filter((memory) => !memory.chapter_id);
  const usedMemoryIds = new Set<string>();
  const candidates: DraftChapterCandidate[] = [];

  for (const [index, group] of CHAPTER_PLANNING_GROUPS.entries()) {
    const supportingMemories = unassignedMemories
      .filter((memory) => memory.interview_topic && group.topics.some((topic) => topic === memory.interview_topic))
      .filter((memory) => isNarrativeMemory(memory))
      .filter((memory) => getMemoryContent(memory).length >= 60)
      .filter((memory) => !usedMemoryIds.has(memory.id));

    const supportingQuestions = input.progressRows.filter(
      (row) => row.state === 'answered' && group.topics.some((topic) => topic === row.topic_id),
    );

    if (supportingMemories.length === 0) {
      continue;
    }

    for (const memory of supportingMemories) {
      usedMemoryIds.add(memory.id);
    }

    const primaryMemory = supportingMemories[0];
    const primaryExcerpt = primaryMemory ? getExcerpt(getMemoryContent(primaryMemory), 120) : '';
    const { timeRangeStart, timeRangeEnd } = resolveTimeRange(supportingMemories, supportingQuestions);

    const candidate = DraftChapterCandidateSchema.parse({
      candidateKey: group.id,
      title: group.title,
      summary: `${group.summarySeed} Im Mittelpunkt stehen Erinnerungen wie "${primaryExcerpt}".`,
      timeRangeStart,
      timeRangeEnd,
      themeKeywords: [
        ...new Set([
          ...group.topics.flatMap((topic) => topic.split('_')),
          ...supportingQuestions.flatMap((row) => row.topic_id.split('_')),
        ]),
      ].slice(0, 5),
      supportingMemoryIds: supportingMemories.map((memory) => memory.id),
      supportingQuestionIds: supportingQuestions.map((row) => row.question_id),
      evidenceSummary: `${supportingMemories.length} Erinnerungen und ${supportingQuestions.length} beantwortete Fragen tragen diesen Kapitelentwurf.`,
      suggestedDisplayOrder: index,
    });

    candidates.push(candidate);
  }

  return candidates;
}
