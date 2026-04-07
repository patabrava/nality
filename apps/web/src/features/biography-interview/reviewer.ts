import type { CatalogQuestion } from './contracts';

type MemoryContext = {
  cleaned_content: string | null;
  raw_transcript: string;
  interview_topic: string | null;
};

export function buildInterviewerBridgeContext(input: {
  activeQuestion: CatalogQuestion;
  recentMemories: MemoryContext[];
}) {
  const lastMemory = input.recentMemories[0];
  if (!lastMemory) {
    return [
      `Bitte leite behutsam in das Thema "${input.activeQuestion.topicLabel}" über.`,
      'Bitte frage konkret und szenisch statt abstrakt.',
    ];
  }

  const content = (lastMemory.cleaned_content || lastMemory.raw_transcript || '').replace(/\s+/g, ' ').trim();
  const excerpt = content.length > 120 ? `${content.slice(0, 117)}...` : content;

  return [
    `Wenn passend, knüpfe locker an die letzte Erinnerung an: "${excerpt}".`,
    `Sorge dafür, dass die nächste Frage trotzdem klar auf "${input.activeQuestion.promptIntent}" hinausläuft.`,
  ];
}
