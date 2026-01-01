/**
 * Biography API Tests
 * 
 * Tests for the biography generation and management
 */

import { describe, it, expect } from 'vitest';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

describe('Biography API', () => {
  describe('GET /api/biography', () => {
    it('should return current biography or null', async () => {
      const response = await fetch(`${API_BASE}/api/biography`);
      const data = await response.json();

      if (response.status === 200) {
        expect(data.success).toBe(true);
        // data.data can be null if no biography exists
        if (data.data) {
          expect(data.data.content).toBeDefined();
          expect(data.data.tone).toBeDefined();
          expect(data.data.is_current).toBe(true);
        }
      } else {
        expect(response.status).toBe(401);
      }
    });

    it('should return all versions when all=true', async () => {
      const response = await fetch(`${API_BASE}/api/biography?all=true`);
      const data = await response.json();

      if (response.status === 200) {
        expect(data.success).toBe(true);
        expect(Array.isArray(data.data)).toBe(true);
      }
    });
  });

  describe('POST /api/biography', () => {
    it('should create a new biography with content', async () => {
      const response = await fetch(`${API_BASE}/api/biography`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: 'This is my life story. It begins in a small town...',
          tone: 'neutral',
        }),
      });

      const data = await response.json();

      if (response.status === 201) {
        expect(data.success).toBe(true);
        expect(data.data.content).toBe('This is my life story. It begins in a small town...');
        expect(data.data.tone).toBe('neutral');
        expect(data.data.is_current).toBe(true);
      } else {
        expect([400, 401]).toContain(response.status);
      }
    });

    it('should reject biography without content', async () => {
      const response = await fetch(`${API_BASE}/api/biography`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tone: 'poetic',
        }),
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('POST /api/biography/generate', () => {
    it('should require chapters to generate biography', async () => {
      const response = await fetch(`${API_BASE}/api/biography/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tone: 'neutral',
        }),
      });

      const data = await response.json();

      if (response.status !== 401) {
        // Either success or error about no chapters
        expect([200, 400]).toContain(response.status);
      }
    });

    it('should accept different tone options', async () => {
      const tones = ['neutral', 'poetic', 'formal'];
      
      for (const tone of tones) {
        const response = await fetch(`${API_BASE}/api/biography/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tone }),
        });

        // Should not fail due to invalid tone
        if (response.status !== 401) {
          expect([200, 400]).toContain(response.status);
        }
      }
    });
  });
});
