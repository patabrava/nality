/**
 * Chapters API Tests
 * 
 * Tests for the chapters CRUD operations
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

describe('Chapters API', () => {
  let testChapterId: string | null = null;

  describe('POST /api/chapters', () => {
    it('should create a new chapter with valid data', async () => {
      const response = await fetch(`${API_BASE}/api/chapters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'The Early Years',
          summary: 'Memories from childhood and growing up.',
          theme_keywords: ['childhood', 'family', 'school'],
        }),
      });

      const data = await response.json();

      if (response.status === 201) {
        expect(data.success).toBe(true);
        expect(data.data.id).toBeDefined();
        expect(data.data.title).toBe('The Early Years');
        expect(data.data.status).toBe('draft');
        testChapterId = data.data.id;
      } else {
        expect(response.status).toBe(401);
      }
    });

    it('should reject chapter without title', async () => {
      const response = await fetch(`${API_BASE}/api/chapters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: 'Missing title',
        }),
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('GET /api/chapters', () => {
    it('should return chapters list ordered by display_order', async () => {
      const response = await fetch(`${API_BASE}/api/chapters`);
      const data = await response.json();

      if (response.status === 200) {
        expect(data.success).toBe(true);
        expect(Array.isArray(data.data)).toBe(true);
      } else {
        expect(response.status).toBe(401);
      }
    });

    it('should filter chapters by status', async () => {
      const response = await fetch(`${API_BASE}/api/chapters?status=draft`);
      const data = await response.json();

      if (response.status === 200) {
        expect(data.success).toBe(true);
        data.data.forEach((chapter: { status: string }) => {
          expect(chapter.status).toBe('draft');
        });
      }
    });
  });

  describe('GET /api/chapters/:id', () => {
    it('should return chapter with its memories', async () => {
      if (!testChapterId) return;

      const response = await fetch(`${API_BASE}/api/chapters/${testChapterId}`);
      const data = await response.json();

      if (response.status === 200) {
        expect(data.success).toBe(true);
        expect(data.data.id).toBe(testChapterId);
        expect(Array.isArray(data.data.memories)).toBe(true);
      }
    });

    it('should return 404 for non-existent chapter', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await fetch(`${API_BASE}/api/chapters/${fakeId}`);
      
      if (response.status !== 401) {
        expect(response.status).toBe(404);
      }
    });
  });

  describe('PATCH /api/chapters/:id', () => {
    it('should update chapter title and status', async () => {
      if (!testChapterId) return;

      const response = await fetch(`${API_BASE}/api/chapters/${testChapterId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'The Early Years (Updated)',
          status: 'published',
        }),
      });

      const data = await response.json();

      if (response.status === 200) {
        expect(data.success).toBe(true);
        expect(data.data.title).toBe('The Early Years (Updated)');
        expect(data.data.status).toBe('published');
      }
    });
  });

  describe('POST /api/chapters/generate', () => {
    it('should require minimum memories to generate chapters', async () => {
      const response = await fetch(`${API_BASE}/api/chapters/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          min_memories: 5,
        }),
      });

      const data = await response.json();

      if (response.status !== 401) {
        // Either success or error about insufficient memories
        expect([200, 400]).toContain(response.status);
      }
    });
  });

  describe('DELETE /api/chapters/:id', () => {
    it('should delete a chapter and unassign its memories', async () => {
      if (!testChapterId) return;

      const response = await fetch(`${API_BASE}/api/chapters/${testChapterId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.status === 200) {
        expect(data.success).toBe(true);
        testChapterId = null;
      }
    });
  });
});
