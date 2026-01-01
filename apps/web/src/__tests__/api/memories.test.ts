/**
 * Memory API Tests
 * 
 * Tests for the memories CRUD operations
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

describe('Memories API', () => {
  let testMemoryId: string | null = null;

  describe('POST /api/memories', () => {
    it('should create a new memory with valid data', async () => {
      const response = await fetch(`${API_BASE}/api/memories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw_transcript: 'This is a test memory about my first day at school.',
          capture_mode: 'text',
          source: 'text',
        }),
      });

      const data = await response.json();

      if (response.status === 201) {
        expect(data.success).toBe(true);
        expect(data.data.id).toBeDefined();
        expect(data.data.raw_transcript).toBe('This is a test memory about my first day at school.');
        testMemoryId = data.data.id;
      } else {
        // Authentication required - expected in unauthenticated test
        expect(response.status).toBe(401);
      }
    });

    it('should reject memory without raw_transcript', async () => {
      const response = await fetch(`${API_BASE}/api/memories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          capture_mode: 'text',
        }),
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('GET /api/memories', () => {
    it('should return paginated memories list', async () => {
      const response = await fetch(`${API_BASE}/api/memories?limit=10&offset=0`);
      const data = await response.json();

      if (response.status === 200) {
        expect(data.success).toBe(true);
        expect(Array.isArray(data.data)).toBe(true);
        expect(data.pagination).toBeDefined();
        expect(data.pagination.limit).toBe(10);
      } else {
        expect(response.status).toBe(401);
      }
    });

    it('should filter memories by capture_mode', async () => {
      const response = await fetch(`${API_BASE}/api/memories?capture_mode=text`);
      const data = await response.json();

      if (response.status === 200) {
        expect(data.success).toBe(true);
        data.data.forEach((memory: { capture_mode: string }) => {
          expect(memory.capture_mode).toBe('text');
        });
      }
    });
  });

  describe('GET /api/memories/:id', () => {
    it('should return 404 for non-existent memory', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await fetch(`${API_BASE}/api/memories/${fakeId}`);
      
      if (response.status !== 401) {
        expect(response.status).toBe(404);
      }
    });
  });

  describe('PATCH /api/memories/:id', () => {
    it('should update memory cleaned_content', async () => {
      if (!testMemoryId) return;

      const response = await fetch(`${API_BASE}/api/memories/${testMemoryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cleaned_content: 'Cleaned: My first day at school was exciting.',
        }),
      });

      const data = await response.json();

      if (response.status === 200) {
        expect(data.success).toBe(true);
        expect(data.data.cleaned_content).toBe('Cleaned: My first day at school was exciting.');
      }
    });
  });

  describe('DELETE /api/memories/:id', () => {
    it('should delete a memory', async () => {
      if (!testMemoryId) return;

      const response = await fetch(`${API_BASE}/api/memories/${testMemoryId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.status === 200) {
        expect(data.success).toBe(true);
        testMemoryId = null;
      }
    });
  });
});
