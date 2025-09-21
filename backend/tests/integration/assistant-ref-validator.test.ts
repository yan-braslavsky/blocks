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
      expect(data).toHaveProperty('messages');
      expect(Array.isArray(data.messages)).toBe(true);
      expect(data.messages.length).toBeGreaterThan(0);

      // Check that at least one message contains a [REF: token
      const hasRefToken = data.messages.some((message: any) => {
        if (message.role === 'assistant' && message.content) {
          return message.content.includes('[REF:');
        }
        return false;
      });

      expect(hasRefToken).toBe(true);
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
      
      // Find assistant messages with references
      const assistantMessages = data.messages.filter((msg: any) => msg.role === 'assistant');
      expect(assistantMessages.length).toBeGreaterThan(0);

      // Validate reference token format
      assistantMessages.forEach((message: any) => {
        if (message.content && message.content.includes('[REF:')) {
          // Extract all [REF:...] tokens
          const refTokens = message.content.match(/\[REF:[^\]]+\]/g);
          expect(refTokens).toBeTruthy();
          expect(refTokens.length).toBeGreaterThan(0);

          // Each token should follow the expected pattern
          refTokens.forEach((token: string) => {
            // Should match pattern like [REF:agg:2025-09-19T10] or [REF:rec-uuid]
            expect(token).toMatch(/^\[REF:(agg|rec):[A-Za-z0-9:-]+\]$/);
          });
        }
      });
    });

    it('should include metricRefs array matching content references', async () => {
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
      
      // Check that assistant messages have both content refs and metricRefs array
      const assistantMessages = data.messages.filter((msg: any) => msg.role === 'assistant');
      
      assistantMessages.forEach((message: any) => {
        if (message.content && message.content.includes('[REF:')) {
          // Should have metricRefs array
          expect(message).toHaveProperty('metricRefs');
          expect(Array.isArray(message.metricRefs)).toBe(true);
          expect(message.metricRefs.length).toBeGreaterThan(0);

          // Extract reference IDs from content
          const contentRefs = message.content.match(/\[REF:([^\]]+)\]/g);
          if (contentRefs) {
            const contentRefIds = contentRefs.map((ref: string) => 
              ref.replace(/^\[REF:/, '').replace(/\]$/, '')
            );

            // metricRefs should contain the same reference IDs
            contentRefIds.forEach((refId: string) => {
              expect(message.metricRefs).toContain(refId);
            });
          }
        }
      });
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
      
      if (data.isStreaming || data.messages) {
        // Even in streaming mode, final response should have ref tokens
        const hasContent = data.messages && data.messages.some((msg: any) => 
          msg.role === 'assistant' && msg.content && msg.content.includes('[REF:')
        );
        
        // For mock, we expect it to have references
        expect(hasContent).toBe(true);
      }
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
        expect(token).toMatch(/^\[REF:(agg|rec):[A-Za-z0-9:-]+\]$/);
      });

      invalidTokens.forEach(token => {
        expect(token).not.toMatch(/^\[REF:(agg|rec):[A-Za-z0-9:-]+\]$/);
      });
    });
  });
});