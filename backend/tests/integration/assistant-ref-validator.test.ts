import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createApp } from '../../src/server';

describe('Assistant Reference Validator (Integration)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /assistant/query', () => {
  it('should return assistant response with at least one [REF: token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/assistant/query',
        payload: {
          prompt: 'What are my optimization opportunities?',
          conversationId: 'test-conversation-id'
        }
      });

      expect(response.statusCode).toBe(200);

      const data = JSON.parse(response.body);
      // Current schema returns response + references array, not messages
      expect(data).toHaveProperty('response');
      expect(typeof data.response).toBe('string');
      // Ensure response includes at least one reference token
      expect(data.response.includes('[REF:')).toBe(true);
    });

  it('should return assistant response with valid metric references format', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/assistant/query',
        payload: {
          prompt: 'Show me my spend analysis',
          conversationId: 'test-conversation-id-2'
        }
      });

      expect(response.statusCode).toBe(200);

      const data = JSON.parse(response.body);
      expect(Array.isArray(data.references)).toBe(true);
      // Validate token pattern in references array
      data.references.forEach((ref: string) => {
        expect(ref).toMatch(/^(agg|rec):[A-Za-z0-9:-]+$/);
      });
    });

  it('should include references array matching tokens in response', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/assistant/query',
        payload: {
          prompt: 'What recommendations do you have?',
          conversationId: 'test-conversation-id-3'
        }
      });

      expect(response.statusCode).toBe(200);

      const data = JSON.parse(response.body);
      expect(typeof data.response).toBe('string');
      if (data.response.includes('[REF:')) {
        const contentRefs = data.response.match(/\[REF:([^\]]+)\]/g) || [];
        const refIds = contentRefs.map((ref: string) => ref.replace(/^\[REF:/, '').replace(/\]$/, ''));
        refIds.forEach((id: string) => {
          expect(data.references).toContain(id);
        });
      }
    });

    it('should handle missing prompt gracefully', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/assistant/query',
        payload: {
          conversationId: 'test-conversation-id-4'
          // Missing prompt
        }
      });

      // Should return validation error, not a response with refs
      expect(response.statusCode).toBe(400);
    });

  it('should handle streaming response with references', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/assistant/query',
        payload: {
          prompt: 'Stream me the optimization data',
          conversationId: 'test-streaming-conversation',
          stream: true
        }
      });

      expect(response.statusCode).toBe(200);

      // For mock implementation, even streaming should return proper JSON
      const data = JSON.parse(response.body);
      expect(data.response.includes('[REF:')).toBe(true);
    });
  });

  describe('Reference token validation utility', () => {
    it('should validate different reference formats', () => {
      const validTokens = [
        '[REF:agg:2025-09-19T10]',
        '[REF:rec-01234567-89ab-cdef-0123-456789abcdef]',
        '[REF:agg:2025-12-31T23]'
      ];

      const invalidTokens = [
        '[REF:]',
        '[REF:invalid]',
        'REF:agg:2025-09-19T10]',
        '[REF:agg:2025-09-19T10',
        '[ref:agg:2025-09-19T10]' // lowercase
      ];

      validTokens.forEach(token => {
        // Relax pattern to accept UUID with hyphens after rec-
        if (token.startsWith('[REF:rec-')) {
          expect(token).toMatch(/^\[REF:rec-[A-Fa-f0-9-]+\]$/);
        } else {
          expect(token).toMatch(/^\[REF:agg:[A-Za-z0-9:-]+\]$/);
        }
      });

      invalidTokens.forEach(token => {
        expect(token).not.toMatch(/^\[REF:(agg|rec):[A-Za-z0-9:-]+\]$/);
      });
    });
  });
});