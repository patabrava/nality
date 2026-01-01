import { describe, expect, it } from 'vitest';
import type { LifeEvent, LifeEventsData } from '@/hooks/useUserProfile';

/**
 * Unit tests for life events data structures and helpers
 */

describe('LifeEvent types', () => {
  it('should have correct structure for family events', () => {
    const familyEvent: LifeEvent = {
      id: 'f1',
      title: 'Father named Camillo',
      description: 'The persons father is named Camillo.',
      category: 'family',
      start_date: '2026-01-01',
      end_date: null,
      is_ongoing: false,
      location: null,
    };

    expect(familyEvent.category).toBe('family');
    expect(familyEvent.title).toContain('Father');
  });

  it('should have correct structure for education events', () => {
    const educationEvent: LifeEvent = {
      id: 'e1',
      title: 'Schillerschule Besuch in Bogota',
      description: 'Besuch der Schillerschule in Bogota, Kolumbien.',
      category: 'education',
      start_date: '1998-01-01',
      end_date: '2010-01-01',
      is_ongoing: false,
      location: 'Bogota',
    };

    expect(educationEvent.category).toBe('education');
    expect(educationEvent.start_date).toBe('1998-01-01');
    expect(educationEvent.end_date).toBe('2010-01-01');
    expect(educationEvent.location).toBe('Bogota');
  });

  it('should have correct structure for career events', () => {
    const careerEvent: LifeEvent = {
      id: 'c1',
      title: 'Head of apply.de at Digital Spine',
      description: 'Currently working as Head of apply.de at Digital Spine.',
      category: 'career',
      start_date: '2026-01-01',
      end_date: null,
      is_ongoing: true,
      location: null,
    };

    expect(careerEvent.category).toBe('career');
    expect(careerEvent.is_ongoing).toBe(true);
  });
});

describe('LifeEventsData grouping', () => {
  const mockLifeEvents: LifeEventsData = {
    family: [
      {
        id: 'f1',
        title: 'Father named Camillo',
        description: null,
        category: 'family',
        start_date: '2026-01-01',
        end_date: null,
        is_ongoing: false,
        location: null,
      },
      {
        id: 'f2',
        title: 'Mother named Elisabeth',
        description: null,
        category: 'family',
        start_date: '2026-01-01',
        end_date: null,
        is_ongoing: false,
        location: null,
      },
      {
        id: 'f3',
        title: 'Brother named Emilio',
        description: null,
        category: 'family',
        start_date: '2026-01-01',
        end_date: null,
        is_ongoing: false,
        location: null,
      },
    ],
    education: [
      {
        id: 'e1',
        title: 'Schillerschule Besuch in Bogota',
        description: null,
        category: 'education',
        start_date: '1998-01-01',
        end_date: '2010-01-01',
        is_ongoing: false,
        location: 'Bogota',
      },
      {
        id: 'e2',
        title: 'Studium an der Frankfurt University',
        description: null,
        category: 'education',
        start_date: '2015-01-01',
        end_date: '2019-01-01',
        is_ongoing: false,
        location: 'Frankfurt',
      },
    ],
    career: [
      {
        id: 'c1',
        title: 'Head of apply.de at Digital Spine',
        description: null,
        category: 'career',
        start_date: '2026-01-01',
        end_date: null,
        is_ongoing: true,
        location: null,
      },
      {
        id: 'c2',
        title: 'Data Analyst at Index Intelligence',
        description: null,
        category: 'career',
        start_date: '2020-01-01',
        end_date: '2021-01-01',
        is_ongoing: false,
        location: null,
      },
    ],
  };

  it('groups family events correctly', () => {
    expect(mockLifeEvents.family).toHaveLength(3);
    expect(mockLifeEvents.family.every(e => e.category === 'family')).toBe(true);
  });

  it('groups education events correctly', () => {
    expect(mockLifeEvents.education).toHaveLength(2);
    expect(mockLifeEvents.education.every(e => e.category === 'education')).toBe(true);
  });

  it('groups career events correctly', () => {
    expect(mockLifeEvents.career).toHaveLength(2);
    expect(mockLifeEvents.career.every(e => e.category === 'career')).toBe(true);
  });

  it('identifies ongoing career events', () => {
    const ongoingJobs = mockLifeEvents.career.filter(e => e.is_ongoing);
    expect(ongoingJobs).toHaveLength(1);
    expect(ongoingJobs[0]?.title).toContain('Head of apply.de');
  });
});

describe('Family member categorization', () => {
  // Helper function to categorize family members (mirrors ProfileCard logic)
  function categorizeFamily(events: LifeEvent[]) {
    const parents = events.filter(e => 
      e.title.toLowerCase().includes('father') || 
      e.title.toLowerCase().includes('mother') ||
      e.title.toLowerCase().includes('vater') ||
      e.title.toLowerCase().includes('mutter')
    );
    
    const siblings = events.filter(e => 
      e.title.toLowerCase().includes('brother') || 
      e.title.toLowerCase().includes('sister') ||
      e.title.toLowerCase().includes('bruder') ||
      e.title.toLowerCase().includes('schwester')
    );
    
    const children = events.filter(e => 
      e.title.toLowerCase().includes('son') || 
      e.title.toLowerCase().includes('daughter') ||
      e.title.toLowerCase().includes('sohn') ||
      e.title.toLowerCase().includes('tochter')
    );

    return { parents, siblings, children };
  }

  it('identifies parents from family events', () => {
    const familyEvents: LifeEvent[] = [
      { id: 'f1', title: 'Father named Camillo', description: null, category: 'family', start_date: null, end_date: null, is_ongoing: false, location: null },
      { id: 'f2', title: 'Mother named Elisabeth', description: null, category: 'family', start_date: null, end_date: null, is_ongoing: false, location: null },
    ];

    const { parents } = categorizeFamily(familyEvents);
    expect(parents).toHaveLength(2);
  });

  it('identifies siblings from family events', () => {
    const familyEvents: LifeEvent[] = [
      { id: 'f1', title: 'Brother named Emilio', description: null, category: 'family', start_date: null, end_date: null, is_ongoing: false, location: null },
      { id: 'f2', title: 'Sister named Maria', description: null, category: 'family', start_date: null, end_date: null, is_ongoing: false, location: null },
    ];

    const { siblings } = categorizeFamily(familyEvents);
    expect(siblings).toHaveLength(2);
  });

  it('identifies children from family events', () => {
    const familyEvents: LifeEvent[] = [
      { id: 'f1', title: 'Son named Max', description: null, category: 'family', start_date: null, end_date: null, is_ongoing: false, location: null },
      { id: 'f2', title: 'Daughter named Anna', description: null, category: 'family', start_date: null, end_date: null, is_ongoing: false, location: null },
    ];

    const { children } = categorizeFamily(familyEvents);
    expect(children).toHaveLength(2);
  });

  it('handles German family titles', () => {
    const familyEvents: LifeEvent[] = [
      { id: 'f1', title: 'Vater heißt Hans', description: null, category: 'family', start_date: null, end_date: null, is_ongoing: false, location: null },
      { id: 'f2', title: 'Mutter heißt Greta', description: null, category: 'family', start_date: null, end_date: null, is_ongoing: false, location: null },
      { id: 'f3', title: 'Bruder heißt Klaus', description: null, category: 'family', start_date: null, end_date: null, is_ongoing: false, location: null },
    ];

    const { parents, siblings } = categorizeFamily(familyEvents);
    expect(parents).toHaveLength(2);
    expect(siblings).toHaveLength(1);
  });
});

describe('Date formatting helpers', () => {
  // Helper function to format year (mirrors ProfileCard logic)
  function formatYear(dateStr: string): string {
    const match = dateStr.match(/^(\d{4})/);
    return match && match[1] ? match[1] : dateStr;
  }

  function formatDateRange(startDate: string | null, endDate: string | null, isOngoing: boolean): string {
    if (!startDate) return isOngoing ? 'Aktuell' : '';
    
    const start = formatYear(startDate);
    
    if (isOngoing) {
      return `${start} – heute`;
    }
    
    if (endDate) {
      const end = formatYear(endDate);
      return start === end ? start : `${start} – ${end}`;
    }
    
    return start;
  }

  it('formats single year correctly', () => {
    expect(formatYear('1998-01-01')).toBe('1998');
    expect(formatYear('2020-12-31')).toBe('2020');
  });

  it('formats date range correctly', () => {
    expect(formatDateRange('1998-01-01', '2010-01-01', false)).toBe('1998 – 2010');
    expect(formatDateRange('2020-01-01', '2020-12-31', false)).toBe('2020');
  });

  it('formats ongoing events correctly', () => {
    expect(formatDateRange('2020-01-01', null, true)).toBe('2020 – heute');
  });

  it('handles null start date with ongoing flag', () => {
    expect(formatDateRange(null, null, true)).toBe('Aktuell');
  });

  it('handles null start date without ongoing flag', () => {
    expect(formatDateRange(null, null, false)).toBe('');
  });
});

describe('Job title extraction helpers', () => {
  // Helper functions (mirrors ProfileCard logic)
  function extractJobTitle(title: string): string {
    const atMatch = title.match(/^(.+?)\s+(?:at|bei)\s+/i);
    if (atMatch && atMatch[1]) return atMatch[1];
    return title;
  }

  function extractCompany(title: string): string | null {
    const atMatch = title.match(/\s+(?:at|bei)\s+(.+)$/i);
    if (atMatch && atMatch[1]) return atMatch[1];
    return null;
  }

  it('extracts job title from "at" format', () => {
    expect(extractJobTitle('Head of apply.de at Digital Spine')).toBe('Head of apply.de');
    expect(extractJobTitle('Data Analyst at Index Intelligence')).toBe('Data Analyst');
  });

  it('extracts company from "at" format', () => {
    expect(extractCompany('Head of apply.de at Digital Spine')).toBe('Digital Spine');
    expect(extractCompany('Data Analyst at Index Intelligence')).toBe('Index Intelligence');
  });

  it('handles German "bei" format', () => {
    expect(extractJobTitle('Entwickler bei SAP')).toBe('Entwickler');
    expect(extractCompany('Entwickler bei SAP')).toBe('SAP');
  });

  it('returns full title when no pattern matches', () => {
    expect(extractJobTitle('Founded THE HUB')).toBe('Founded THE HUB');
  });

  it('returns null company when no pattern matches', () => {
    expect(extractCompany('Founded THE HUB')).toBeNull();
  });
});
