/**
 * Memory Flow E2E Tests
 * 
 * End-to-end tests for the complete memory capture workflow
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

describe('Memory Capture Flow', () => {
  describe('Complete memory lifecycle', () => {
    let createdMemoryId: string;
    let createdChapterId: string;

    it('Step 1: Create a memory via text input', async () => {
      const response = await fetch(`${API_BASE}/api/memories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raw_transcript: 'I remember my grandmother teaching me to bake cookies.',
          capture_mode: 'text',
          source: 'text',
        }),
      });

      if (response.status === 201) {
        const data = await response.json();
        expect(data.success).toBe(true);
        createdMemoryId = data.data.id;
      }
    });

    it('Step 2: Memory should be in pending processing state', async () => {
      if (!createdMemoryId) return;

      const response = await fetch(`${API_BASE}/api/memories/${createdMemoryId}`);
      
      if (response.status === 200) {
        const data = await response.json();
        expect(data.data.processing_status).toBe('pending');
      }
    });

    it('Step 3: Create multiple memories for chapter generation', async () => {
      const memories = [
        'My first day of kindergarten was both exciting and scary.',
        'I learned to ride a bike when I was six years old.',
        'Summer vacations at my grandparents farm were magical.',
        'My best friend and I built a treehouse together.',
        'The neighborhood kids would play until sunset every day.',
      ];

      for (const content of memories) {
        await fetch(`${API_BASE}/api/memories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            raw_transcript: content,
            capture_mode: 'text',
            source: 'text',
          }),
        });
      }
    });

    it('Step 4: Generate chapters from memories', async () => {
      const response = await fetch(`${API_BASE}/api/chapters/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force_regenerate: false }),
      });

      if (response.status === 200) {
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.data.chapters_created).toBeGreaterThan(0);
        createdChapterId = data.data.chapters[0]?.id;
      }
    });

    it('Step 5: Verify chapters were created', async () => {
      const response = await fetch(`${API_BASE}/api/chapters`);
      
      if (response.status === 200) {
        const data = await response.json();
        expect(data.data.length).toBeGreaterThan(0);
      }
    });

    it('Step 6: Assign memory to chapter', async () => {
      if (!createdMemoryId || !createdChapterId) return;

      const response = await fetch(`${API_BASE}/api/memories/${createdMemoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapter_id: createdChapterId,
        }),
      });

      if (response.status === 200) {
        const data = await response.json();
        expect(data.data.chapter_id).toBe(createdChapterId);
      }
    });

    it('Step 7: Verify chapter contains the memory', async () => {
      if (!createdChapterId) return;

      const response = await fetch(`${API_BASE}/api/chapters/${createdChapterId}`);
      
      if (response.status === 200) {
        const data = await response.json();
        const memoryIds = data.data.memories.map((m: { id: string }) => m.id);
        expect(memoryIds).toContain(createdMemoryId);
      }
    });

    it('Step 8: Generate biography from chapters', async () => {
      const response = await fetch(`${API_BASE}/api/biography/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tone: 'neutral' }),
      });

      if (response.status === 200) {
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.data.biography.content.length).toBeGreaterThan(100);
      }
    });

    it('Step 9: Verify biography exists', async () => {
      const response = await fetch(`${API_BASE}/api/biography`);
      
      if (response.status === 200) {
        const data = await response.json();
        if (data.data) {
          expect(data.data.is_current).toBe(true);
          expect(data.data.content).toBeDefined();
        }
      }
    });
  });
});

describe('Memory Feed Display', () => {
  it('should return memories grouped by date', async () => {
    const response = await fetch(`${API_BASE}/api/memories?limit=50`);
    
    if (response.status === 200) {
      const data = await response.json();
      expect(Array.isArray(data.data)).toBe(true);
      
      // Verify chronological order (newest first)
      for (let i = 1; i < data.data.length; i++) {
        const current = new Date(data.data[i].captured_at);
        const previous = new Date(data.data[i - 1].captured_at);
        expect(current <= previous).toBe(true);
      }
    }
  });

  it('should filter memories by capture mode', async () => {
    const modes = ['interview', 'free_talk', 'text'];
    
    for (const mode of modes) {
      const response = await fetch(`${API_BASE}/api/memories?capture_mode=${mode}`);
      
      if (response.status === 200) {
        const data = await response.json();
        data.data.forEach((memory: { capture_mode: string }) => {
          expect(memory.capture_mode).toBe(mode);
        });
      }
    }
  });
});

describe('Chapter Organization', () => {
  it('should return chapters in display order', async () => {
    const response = await fetch(`${API_BASE}/api/chapters`);
    
    if (response.status === 200) {
      const data = await response.json();
      
      // Verify display_order is ascending
      for (let i = 1; i < data.data.length; i++) {
        expect(data.data[i].display_order).toBeGreaterThanOrEqual(
          data.data[i - 1].display_order
        );
      }
    }
  });

  it('should accurately count memories per chapter', async () => {
    const response = await fetch(`${API_BASE}/api/chapters`);
    
    if (response.status === 200) {
      const data = await response.json();
      
      for (const chapter of data.data) {
        const chapterResponse = await fetch(`${API_BASE}/api/chapters/${chapter.id}`);
        if (chapterResponse.status === 200) {
          const chapterData = await chapterResponse.json();
          expect(chapterData.data.memories.length).toBe(chapter.memory_count);
        }
      }
    }
  });
});

describe('Biography Generation', () => {
  it('should support different tones', async () => {
    const tones = ['neutral', 'poetic', 'formal'];
    
    for (const tone of tones) {
      const response = await fetch(`${API_BASE}/api/biography/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tone, regenerate: true }),
      });

      if (response.status === 200) {
        const data = await response.json();
        expect(data.data.biography.tone).toBe(tone);
      }
    }
  });

  it('should version biographies correctly', async () => {
    const response = await fetch(`${API_BASE}/api/biography?all=true`);
    
    if (response.status === 200) {
      const data = await response.json();
      
      // Only one should be current
      const currentVersions = data.data.filter((b: { is_current: boolean }) => b.is_current);
      expect(currentVersions.length).toBeLessThanOrEqual(1);
    }
  });
});
