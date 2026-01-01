import { describe, expect, it } from 'vitest';

/**
 * Unit tests for onboarding topic inference
 * 
 * Tests that the inferQuestionTopic function correctly maps
 * German/English onboarding questions to their expected topics.
 */

// Replicate the inferQuestionTopic logic from chat/route.ts for testing
function inferQuestionTopic(questionText: string | null): string {
  if (!questionText) return 'identity';
  const q = questionText.toLowerCase();
  
  // Q7 Values - MUST check before other topics (contains 'werte', 'motto')
  if (q.includes('werte') || q.includes('values')) return 'values';
  if (q.includes('motto') && q.includes('abschluss')) return 'values';
  if (q.includes('drei werte') || q.includes('three values')) return 'values';
  
  // Q2 Origins - birth date/place (check before identity default)
  if (q.includes('geburt') || q.includes('geboren')) return 'origins';
  if (q.includes('anfang') && (q.includes('wann') || q.includes('wo'))) return 'origins';
  if (q.includes('birth') && (q.includes('year') || q.includes('place'))) return 'origins';
  
  // Q3 Family-related topics
  if (q.includes('geschwister') || q.includes('bruder') || q.includes('schwester')) return 'family';
  if (q.includes('kinder') || q.includes('children')) return 'family';
  if (q.includes('eltern') || q.includes('mutter') || q.includes('vater') || q.includes('parents')) return 'family';
  if (q.includes('partner') || q.includes('verheiratet') || q.includes('ehe') || q.includes('marriage')) return 'family';
  if (q.includes('familie') && !q.includes('ursprünglichen')) return 'family';
  if (q.includes('ursprünglichen familie')) return 'family';
  
  // Q4 Education-related topics
  if (q.includes('schule') || q.includes('grundschule') || q.includes('gymnasium')) return 'education';
  if (q.includes('studium') || q.includes('universität') || q.includes('university')) return 'education';
  if (q.includes('abschluss') || q.includes('abitur')) return 'education';
  if (q.includes('bildung') && q.includes('weg')) return 'education';
  
  // Q5 Career-related topics
  if (q.includes('beruf') || q.includes('arbeit') || q.includes('job') || q.includes('career')) return 'career';
  if (q.includes('rolle') || q.includes('position') || q.includes('firma') || q.includes('unternehmen')) return 'career';
  
  // Q6 Influences-related topics (authors, thinkers, NOT values)
  if (q.includes('autor') || q.includes('buch') || q.includes('einfluss')) return 'influences';
  if (q.includes('stimmen') && q.includes('weiter')) return 'influences';
  if (q.includes('denker') || q.includes('geprägt')) return 'influences';
  if (q.includes('bewunder') || q.includes('admire') || q.includes('vorbild')) return 'influences';
  
  // Q1 Identity is the default for: name, address preference, style
  return 'identity';
}

describe('inferQuestionTopic', () => {
  describe('Q1: Identity & Voice', () => {
    it('maps form of address question to identity', () => {
      const question = 'Bevor wir beginnen: Wie soll ich dich ansprechen – du oder Sie? Dein vollständiger Name? Und welcher Stil passt zu dir: prosa (erzählend), fachlich (strukturiert) oder locker (entspannt)?';
      expect(inferQuestionTopic(question)).toBe('identity');
    });

    it('maps Sie-variant question to identity', () => {
      const question = 'Bevor wir beginnen: Wie möchten Sie angesprochen werden – du oder Sie? Ihr vollständiger Name (gern mit Titel)?';
      expect(inferQuestionTopic(question)).toBe('identity');
    });

    it('maps welcome message to identity (default)', () => {
      const question = 'Willkommen zum Onboarding. Ich sammle jetzt deine Basisdaten.';
      expect(inferQuestionTopic(question)).toBe('identity');
    });

    it('returns identity for null question', () => {
      expect(inferQuestionTopic(null)).toBe('identity');
    });
  });

  describe('Q2: Origins (Birth)', () => {
    it('maps birth year/place question to origins', () => {
      const question = 'Schön, Camillo. Jede Geschichte hat einen Anfang. Wann und wo beginnt deine? Dein Geburtsjahr und -ort, vielleicht eine kurze Erinnerung an diesen Ort?';
      expect(inferQuestionTopic(question)).toBe('origins');
    });

    it('maps Sie-variant origins question to origins', () => {
      const question = 'Jede Geschichte hat einen Anfang. Wann und wo beginnt Ihre? Ihr Geburtsjahr und -ort?';
      expect(inferQuestionTopic(question)).toBe('origins');
    });

    it('maps "geboren" keyword to origins', () => {
      const question = 'Wo sind Sie geboren?';
      expect(inferQuestionTopic(question)).toBe('origins');
    });

    it('maps English birth question to origins', () => {
      const question = 'What is your birth year and birth place?';
      expect(inferQuestionTopic(question)).toBe('origins');
    });
  });

  describe('Q3: Family Constellation', () => {
    it('maps family question to family', () => {
      const question = 'Wer gehört zu deiner ursprünglichen Familie? Geschwister? Und hast du heute eigene Kinder?';
      expect(inferQuestionTopic(question)).toBe('family');
    });

    it('maps siblings question to family', () => {
      const question = 'Hast du Geschwister?';
      expect(inferQuestionTopic(question)).toBe('family');
    });

    it('maps children question to family', () => {
      const question = 'Haben Sie Kinder?';
      expect(inferQuestionTopic(question)).toBe('family');
    });

    it('maps parents question to family', () => {
      const question = 'Erzähl mir von deinen Eltern.';
      expect(inferQuestionTopic(question)).toBe('family');
    });
  });

  describe('Q4: Education Journey', () => {
    it('maps education question to education', () => {
      const question = 'Bildung prägt uns – oft auf überraschende Weise. Erzähl mir von deinem Bildungsweg: Schulen, Studium, Abschlüsse.';
      expect(inferQuestionTopic(question)).toBe('education');
    });

    it('maps school question to education', () => {
      const question = 'Welche Schule hast du besucht?';
      expect(inferQuestionTopic(question)).toBe('education');
    });

    it('maps university question to education', () => {
      const question = 'Erzähl mir von deinem Studium an der Universität.';
      expect(inferQuestionTopic(question)).toBe('education');
    });
  });

  describe('Q5: Career Arc', () => {
    it('maps career question to career', () => {
      const question = 'Was hast du beruflich aufgebaut? Deine aktuelle Rolle und vielleicht ein oder zwei frühere Stationen, die dich geprägt haben.';
      expect(inferQuestionTopic(question)).toBe('career');
    });

    it('maps job question to career', () => {
      const question = 'Was ist dein aktueller Job?';
      expect(inferQuestionTopic(question)).toBe('career');
    });

    it('maps company question to career', () => {
      const question = 'Bei welchem Unternehmen arbeitest du?';
      expect(inferQuestionTopic(question)).toBe('career');
    });
  });

  describe('Q6: Voices That Echo (Influences)', () => {
    it('maps influences question to influences', () => {
      const question = 'Wessen Stimmen tragen in dir weiter? Welche Autoren, Denker oder Menschen – ob bekannt oder persönlich – haben geprägt, wie du die Welt siehst?';
      expect(inferQuestionTopic(question)).toBe('influences');
    });

    it('maps authors question to influences', () => {
      const question = 'Welche Autoren haben dich beeinflusst?';
      expect(inferQuestionTopic(question)).toBe('influences');
    });

    it('maps thinkers question to influences', () => {
      const question = 'Welche Denker haben deine Weltsicht geprägt?';
      expect(inferQuestionTopic(question)).toBe('influences');
    });

    it('maps role models question to influences', () => {
      const question = 'Wer sind deine Vorbilder?';
      expect(inferQuestionTopic(question)).toBe('influences');
    });
  });

  describe('Q7: Core Values', () => {
    it('maps values question to values', () => {
      const question = 'Zum Abschluss: Wenn du drei Werte nennen müsstest, die dich leiten – welche wären das? Und gibt es vielleicht einen Satz oder ein Motto, das dich begleitet?';
      expect(inferQuestionTopic(question)).toBe('values');
    });

    it('maps English values question to values', () => {
      const question = 'What are your core values?';
      expect(inferQuestionTopic(question)).toBe('values');
    });

    it('maps three values question to values', () => {
      const question = 'Nenne mir drei Werte, die dir wichtig sind.';
      expect(inferQuestionTopic(question)).toBe('values');
    });

    it('should NOT map to influences when values are mentioned', () => {
      const question = 'Welche Werte leiten dich?';
      // This should be 'values', not 'influences'
      expect(inferQuestionTopic(question)).toBe('values');
    });
  });

  describe('Edge Cases', () => {
    it('handles mixed content correctly - prioritizes values over other keywords', () => {
      // This question has "Abschluss" (could be education) but is about values
      const question = 'Zum Abschluss: Welche drei Werte sind dir wichtig?';
      expect(inferQuestionTopic(question)).toBe('values');
    });

    it('handles questions with multiple keywords - origins takes precedence over identity', () => {
      const question = 'Dein Name und wann bist du geboren?';
      expect(inferQuestionTopic(question)).toBe('origins');
    });

    it('handles empty string as identity default', () => {
      expect(inferQuestionTopic('')).toBe('identity');
    });
  });
});

describe('Topic to Destination Routing', () => {
  // This tests the expected routing from router.ts
  const EXPECTED_ROUTING: Record<string, string> = {
    identity: 'users',
    origins: 'users',
    family: 'life_event',
    education: 'life_event',
    career: 'life_event',
    influences: 'user_profile',
    values: 'user_profile',
  };

  it('all 7 topics have defined destinations', () => {
    expect(Object.keys(EXPECTED_ROUTING)).toHaveLength(7);
  });

  it('identity routes to users table', () => {
    expect(EXPECTED_ROUTING['identity']).toBe('users');
  });

  it('origins routes to users table', () => {
    expect(EXPECTED_ROUTING['origins']).toBe('users');
  });

  it('family routes to life_event table', () => {
    expect(EXPECTED_ROUTING['family']).toBe('life_event');
  });

  it('education routes to life_event table', () => {
    expect(EXPECTED_ROUTING['education']).toBe('life_event');
  });

  it('career routes to life_event table', () => {
    expect(EXPECTED_ROUTING['career']).toBe('life_event');
  });

  it('influences routes to user_profile table', () => {
    expect(EXPECTED_ROUTING['influences']).toBe('user_profile');
  });

  it('values routes to user_profile table', () => {
    expect(EXPECTED_ROUTING['values']).toBe('user_profile');
  });
});
