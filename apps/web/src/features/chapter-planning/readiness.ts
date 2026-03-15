import {
  CHAPTER_PLANNING_GROUPS,
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

function clampScore(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return Number(value.toFixed(2));
}

function getDistinctTopicCount(progressRows: PlanningProgressRow[], memories: PlanningMemory[]): number {
  const topics = new Set<string>();

  for (const row of progressRows) {
    if (row.state === 'answered') {
      topics.add(row.topic_id);
    }
  }

  for (const memory of memories) {
    if (memory.interview_topic) {
      topics.add(memory.interview_topic);
    }
  }

  return topics.size;
}

function getArcCoverage(progressRows: PlanningProgressRow[], memories: PlanningMemory[]): number {
  const coveredArcs = new Set<string>();
  const evidenceTopics = new Set<string>();

  for (const row of progressRows) {
    if (row.state === 'answered') {
      evidenceTopics.add(row.topic_id);
    }
  }

  for (const memory of memories) {
    if (memory.interview_topic) {
      evidenceTopics.add(memory.interview_topic);
    }
  }

  for (const group of CHAPTER_PLANNING_GROUPS) {
    if (group.topics.some((topic) => evidenceTopics.has(topic))) {
      coveredArcs.add(group.arc);
    }
  }

  return coveredArcs.size;
}

function getUsableMemories(memories: PlanningMemory[]): PlanningMemory[] {
  return memories.filter((memory) => {
    if (memory.processing_status && memory.processing_status !== 'complete') {
      return false;
    }

    if (!isNarrativeMemory(memory)) {
      return false;
    }

    return getMemoryContent(memory).length >= 60;
  });
}

function getAverageMemoryLength(memories: PlanningMemory[]): number {
  if (memories.length === 0) {
    return 0;
  }

  const total = memories.reduce((sum, memory) => sum + getMemoryContent(memory).length, 0);
  return total / memories.length;
}

export function evaluateNarrativeReadiness(
  progressRows: PlanningProgressRow[],
  memories: PlanningMemory[],
): NarrativeReadiness {
  const usableMemories = getUsableMemories(memories);
  const answeredQuestionCount = progressRows.filter((row) => row.state === 'answered').length;
  const thematicSpread = getDistinctTopicCount(progressRows, usableMemories);
  const arcCoverage = getArcCoverage(progressRows, usableMemories);
  const averageMemoryLength = getAverageMemoryLength(usableMemories);

  const coverageScore = clampScore(thematicSpread / 4);
  const chronologyScore = clampScore(arcCoverage / 3);
  const corpusQualityScore = clampScore(
    usableMemories.length / 6 * 0.65 +
    Math.min(1, averageMemoryLength / 220) * 0.2 +
    Math.min(1, thematicSpread / 4) * 0.15,
  );

  const gaps: string[] = [];
  const strengths: string[] = [];

  if (usableMemories.length < 5) {
    gaps.push('Es fehlen noch mindestens fünf belastbare Erinnerungen mit genug Tiefe.');
  } else {
    strengths.push(`${usableMemories.length} belastbare Erinnerungen sind bereits vorhanden.`);
  }

  if (thematicSpread < 3) {
    gaps.push('Die bisherigen Erinnerungen decken noch zu wenige Lebensthemen ab.');
  } else {
    strengths.push(`${thematicSpread} Themenfelder sind bereits narrativ abgedeckt.`);
  }

  if (arcCoverage < 2) {
    gaps.push('Die bisherige Erzählung spannt noch keinen klaren Lebensbogen über mehrere Phasen.');
  } else {
    strengths.push('Es gibt bereits Material aus mehreren Lebensphasen.');
  }

  if (answeredQuestionCount < 6) {
    gaps.push('Es wurden noch zu wenige Interviewfragen substanziell beantwortet.');
  } else {
    strengths.push(`${answeredQuestionCount} Interviewfragen wurden ausreichend beantwortet.`);
  }

  const ready =
    usableMemories.length >= 5 &&
    thematicSpread >= 3 &&
    arcCoverage >= 2 &&
    answeredQuestionCount >= 6 &&
    corpusQualityScore >= 0.6;

  return {
    ready,
    coverageScore,
    corpusQualityScore,
    chronologyScore,
    thematicSpread,
    usableMemoryCount: usableMemories.length,
    answeredQuestionCount,
    gaps,
    strengths,
  };
}
