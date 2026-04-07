import { describe, expect, it } from 'vitest';
import {
  buildBiographyVoiceAgentContextMessages,
  shapeGermanVoiceAgentText,
} from './interview';

describe('biography voice helpers', () => {
  it('shapes German voice text into speakable prose', () => {
    const shaped = shapeGermanVoiceAgentText(`
      - Danke für das Teilen;
      - ich habe zwei Gedanken: zuerst die Szene, dann die Person.
      **Erzählen Sie mir mehr / oder bleiben wir bei diesem Moment?**
    `);

    expect(shaped).toBe(
      'Danke für das Teilen. ich habe zwei Gedanken. zuerst die Szene, dann die Person. Erzählen Sie mir mehr oder bleiben wir bei diesem Moment?',
    );
  });

  it('builds compact assistant and user context messages for resume', () => {
    const messages = buildBiographyVoiceAgentContextMessages({
      fullName: 'Maria Beispiel',
      coveredTopics: ['Kindheit', 'Familie'],
      activeQuestion: 'Welche Szene aus Ihrer Kindheit ist Ihnen sofort wieder präsent?',
      sessionSummary: 'Beantwortet: 3, offen: 5, vertagt: 1, übersprungen: 0.',
      recentMemories: [
        {
          raw_transcript: 'Ich erinnere mich an eine Küche voller Stimmen und Gerüche.',
          cleaned_content: null,
          interview_topic: 'childhood_and_youth',
        },
      ],
    });

    expect(messages).toHaveLength(2);
    expect(messages[0]?.role).toBe('assistant');
    expect(messages[0]?.content).toContain('Maria Beispiel');
    expect(messages[0]?.content).toContain('Kindheit, Familie');
    expect(messages[1]).toEqual({
      role: 'user',
      content: 'Zuletzt habe ich erzählt: Ich erinnere mich an eine Küche voller Stimmen und Gerüche.',
    });
  });
});
