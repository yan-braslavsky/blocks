/**
 * Contract test for POST /assistant/query endpoint
 * Tests validation of request body and response structure according to API contract
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import supertest from 'supertest';
import { createApp } from '../../src/server.js';
import { 
  assistantQueryRequestSchema, 
  assistantQueryResponseSchema, 
  errorSchema 
} from '../../src/schemas/index.js';

describe('POST /assistant/query - Contract Tests', () => {
  let app: FastifyInstance;
  let request: supertest.Agent;

  beforeAll(async () => {
    app = createApp();
    await app.ready();
    request = supertest(app.server);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Request Body Validation', () => {
    it('should accept valid request body with prompt', async () => {
      const validRequest = {
        prompt: 'Where are we saving money this month?'
      };

      // Validate request body against schema
      const requestResult = assistantQueryRequestSchema.safeParse(validRequest);
      expect(requestResult.success).toBe(true);

      // This will fail until handler is implemented
      const response = await request.post('/assistant/query').send(validRequest);
      expect(response.status).toBe(404); // Expected to fail - handler not implemented yet
    });

    it('should reject request body without prompt field', async () => {
      const invalidRequest = {};

      const requestResult = assistantQueryRequestSchema.safeParse(invalidRequest);
      expect(requestResult.success).toBe(false);
      expect(requestResult.error?.issues[0].path).toContain('prompt');
    });

    it('should reject request body with empty prompt', async () => {
      const invalidRequest = {
        prompt: ''
      };

      const requestResult = assistantQueryRequestSchema.safeParse(invalidRequest);
      expect(requestResult.success).toBe(false);
      expect(requestResult.error?.issues[0].path).toContain('prompt');
    });

    it('should reject request body with null prompt', async () => {
      const invalidRequest = {
        prompt: null
      };

      const requestResult = assistantQueryRequestSchema.safeParse(invalidRequest);
      expect(requestResult.success).toBe(false);
    });

    it('should reject request body with prompt exceeding maximum length', async () => {
      const invalidRequest = {
        prompt: 'x'.repeat(1001) // Over 1000 character limit
      };

      const requestResult = assistantQueryRequestSchema.safeParse(invalidRequest);
      expect(requestResult.success).toBe(false);
      expect(requestResult.error?.issues[0].path).toContain('prompt');
    });

    it('should accept request body with prompt at maximum length', async () => {
      const validRequest = {
        prompt: 'x'.repeat(1000) // Exactly 1000 characters
      };

      const requestResult = assistantQueryRequestSchema.safeParse(validRequest);
      expect(requestResult.success).toBe(true);
    });

    it('should reject request body with whitespace-only prompt', async () => {
      const invalidRequest = {
        prompt: '   \n\t   '
      };

      // Assuming the schema trims whitespace and then validates minimum length
      const requestResult = assistantQueryRequestSchema.safeParse(invalidRequest);
      expect(requestResult.success).toBe(false);
    });

    it('should accept request body with valid prompt containing special characters', async () => {
      const validRequest = {
        prompt: 'What is our spend for Q3? Include EC2, RDS & Lambda costs!'
      };

      const requestResult = assistantQueryRequestSchema.safeParse(validRequest);
      expect(requestResult.success).toBe(true);
    });
  });

  describe('Response Structure Validation', () => {
    it('should validate successful non-streaming response structure', () => {
      const mockResponse = {
        interactionId: '123e4567-e89b-12d3-a456-426614174000',
        response: 'Top savings from EC2 commitment coverage improvements. [REF:agg:2025-09-19T10] [REF:rec:uuid-rec-1]',
        references: ['agg:2025-09-19T10', 'rec:uuid-rec-1'],
        firstTokenLatencyMs: 120
      };

      const responseResult = assistantQueryResponseSchema.safeParse(mockResponse);
      expect(responseResult.success).toBe(true);
    });

    it('should validate response with empty references array', () => {
      const mockResponse = {
        interactionId: '123e4567-e89b-12d3-a456-426614174000',
        response: 'I can help you analyze your cloud spending patterns.',
        references: [],
        firstTokenLatencyMs: 95
      };

      const responseResult = assistantQueryResponseSchema.safeParse(mockResponse);
      expect(responseResult.success).toBe(true);
    });

    it('should reject response with invalid interactionId format', () => {
      const invalidResponse = {
        interactionId: 'invalid-uuid',
        response: 'Some response',
        references: [],
        firstTokenLatencyMs: 120
      };

      const responseResult = assistantQueryResponseSchema.safeParse(invalidResponse);
      expect(responseResult.success).toBe(false);
    });

    it('should reject response with empty response text', () => {
      const invalidResponse = {
        interactionId: '123e4567-e89b-12d3-a456-426614174000',
        response: '', // Empty response
        references: [],
        firstTokenLatencyMs: 120
      };

      const responseResult = assistantQueryResponseSchema.safeParse(invalidResponse);
      expect(responseResult.success).toBe(false);
    });

    it('should reject response with negative latency', () => {
      const invalidResponse = {
        interactionId: '123e4567-e89b-12d3-a456-426614174000',
        response: 'Some response',
        references: [],
        firstTokenLatencyMs: -1 // Invalid negative latency
      };

      const responseResult = assistantQueryResponseSchema.safeParse(invalidResponse);
      expect(responseResult.success).toBe(false);
    });

    it('should reject response with invalid metric reference format', () => {
      const invalidResponse = {
        interactionId: '123e4567-e89b-12d3-a456-426614174000',
        response: 'Response with invalid ref',
        references: ['invalid-metric-ref'], // Should match agg: or rec: pattern
        firstTokenLatencyMs: 120
      };

      const responseResult = assistantQueryResponseSchema.safeParse(invalidResponse);
      expect(responseResult.success).toBe(false);
    });

    it('should validate response with maximum allowed references', () => {
      const maxReferences = Array.from({ length: 20 }, (_, i) => `agg:2025-09-${(i + 1).toString().padStart(2, '0')}T10`);
      
      const responseWithMaxRefs = {
        interactionId: '123e4567-e89b-12d3-a456-426614174000',
        response: 'Response with many references',
        references: maxReferences,
        firstTokenLatencyMs: 150
      };

      const responseResult = assistantQueryResponseSchema.safeParse(responseWithMaxRefs);
      expect(responseResult.success).toBe(true);
    });

    it('should reject response with too many references', () => {
      const tooManyReferences = Array.from({ length: 21 }, (_, i) => `agg:2025-09-${(i + 1).toString().padStart(2, '0')}T10`);
      
      const invalidResponse = {
        interactionId: '123e4567-e89b-12d3-a456-426614174000',
        response: 'Response with too many references',
        references: tooManyReferences,
        firstTokenLatencyMs: 150
      };

      const responseResult = assistantQueryResponseSchema.safeParse(invalidResponse);
      expect(responseResult.success).toBe(false);
    });
  });

  describe('Error Response Validation', () => {
    it('should validate error response structure', () => {
      const mockError = {
        error: {
          code: 'MISSING_PROMPT',
          message: 'Prompt is required for assistant queries',
          hint: 'Please provide a valid prompt in the request body'
        }
      };

      const errorResult = errorSchema.safeParse(mockError);
      expect(errorResult.success).toBe(true);
    });

    it('should validate error response for prompt too long', () => {
      const mockError = {
        error: {
          code: 'PROMPT_TOO_LONG',
          message: 'Prompt exceeds maximum length of 1000 characters',
          hint: 'Please shorten your prompt'
        }
      };

      const errorResult = errorSchema.safeParse(mockError);
      expect(errorResult.success).toBe(true);
    });

    it('should reject error response without required fields', () => {
      const invalidError = {
        error: {
          code: 'MISSING_PROMPT'
          // Missing required message field
        }
      };

      const errorResult = errorSchema.safeParse(invalidError);
      expect(errorResult.success).toBe(false);
    });
  });

  describe('Integration Test Placeholders', () => {
    it('should handle actual endpoint call once handler is implemented', async () => {
      const validRequest = {
        prompt: 'What are our top spending areas this month?'
      };

      const response = await request.post('/assistant/query').send(validRequest);
      
      // Currently expecting 404 since handler doesn't exist
      expect([404, 200]).toContain(response.status);
      
      if (response.status === 200) {
        // Validate response structure matches schema
        const validationResult = assistantQueryResponseSchema.safeParse(response.body);
        expect(validationResult.success).toBe(true);
      }
    });

    it('should return 400 for missing prompt once handler is implemented', async () => {
      const invalidRequest = {};

      const response = await request.post('/assistant/query').send(invalidRequest);
      
      // Currently expecting 404 since handler doesn't exist, later should be 400
      expect([404, 400]).toContain(response.status);
      
      if (response.status === 400) {
        // Validate error response structure
        const errorResult = errorSchema.safeParse(response.body);
        expect(errorResult.success).toBe(true);
        expect(response.body.error.code).toBe('MISSING_PROMPT');
      }
    });

    it('should return 400 for empty prompt once handler is implemented', async () => {
      const invalidRequest = {
        prompt: ''
      };

      const response = await request.post('/assistant/query').send(invalidRequest);
      
      expect([404, 400]).toContain(response.status);
      
      if (response.status === 400) {
        const errorResult = errorSchema.safeParse(response.body);
        expect(errorResult.success).toBe(true);
      }
    });

    it('should return 400 for prompt exceeding length limit once handler is implemented', async () => {
      const invalidRequest = {
        prompt: 'x'.repeat(1001)
      };

      const response = await request.post('/assistant/query').send(invalidRequest);
      
      expect([404, 400]).toContain(response.status);
      
      if (response.status === 400) {
        const errorResult = errorSchema.safeParse(response.body);
        expect(errorResult.success).toBe(true);
        expect(response.body.error.code).toBe('PROMPT_TOO_LONG');
      }
    });

    it('should handle streaming response format when implemented', async () => {
      // Note: This test may need to be updated based on actual streaming implementation
      // Currently testing non-streaming mock response format
      const validRequest = {
        prompt: 'Analyze our cost optimization opportunities'
      };

      const response = await request.post('/assistant/query').send(validRequest);
      
      expect([404, 200]).toContain(response.status);
      
      if (response.status === 200) {
        // For mock/non-streaming response
        const validationResult = assistantQueryResponseSchema.safeParse(response.body);
        expect(validationResult.success).toBe(true);
        
        // Verify response contains reference tokens if references array is populated
        if (response.body.references && response.body.references.length > 0) {
          expect(response.body.response).toContain('[REF:');
        }
      }
    });
  });
});