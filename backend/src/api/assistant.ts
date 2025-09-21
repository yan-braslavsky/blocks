/**
 * POST /assistant/query handler
 * Returns AI assistant responses with references to cost data
 */
import { FastifyRequest, FastifyReply } from 'fastify';
import fs from 'fs/promises';
import path from 'path';
import { assistantQueryRequestSchema, AssistantQueryRequest, assistantQueryResponseSchema } from '../schemas/assistant';

const FIXTURES_PATH = path.join(__dirname, '../fixtures');

// Simulate streaming response utility
export class MockStreamingResponse {
  private content: string;
  private chunkSize: number;
  private delay: number;

  constructor(content: string, chunkSize = 10, delay = 50) {
    this.content = content;
    this.chunkSize = chunkSize;
    this.delay = delay;
  }

  async *stream(): AsyncGenerator<string, void, unknown> {
    for (let i = 0; i < this.content.length; i += this.chunkSize) {
      const chunk = this.content.slice(i, i + this.chunkSize);
      yield chunk;
      
      if (i + this.chunkSize < this.content.length) {
        await new Promise(resolve => setTimeout(resolve, this.delay));
      }
    }
  }
}

export async function assistantQueryHandler(
  request: FastifyRequest<{ Body: AssistantQueryRequest }>,
  reply: FastifyReply
) {
  // Validate request body
  const validatedBody = assistantQueryRequestSchema.parse(request.body);

  // Check if streaming is requested
  const isStreaming = request.headers.accept?.includes('text/event-stream') || false;

  // In mock mode, return fixture data
  if (process.env.USE_MOCKS === '1') {
    try {
      const fixtureData = await fs.readFile(
        path.join(FIXTURES_PATH, 'assistant.json'), 
        'utf-8'
      );
      const fixture = JSON.parse(fixtureData);
      
      // Customize response based on prompt
      if (validatedBody.prompt.toLowerCase().includes('cost') || 
          validatedBody.prompt.toLowerCase().includes('spend')) {
        fixture.response = `Based on your question about costs, I can see from your recent spending data [REF:agg:2025-09-19T10] that you have opportunities for optimization. Your current weekly spend shows a potential 20% savings through rightsizing recommendations [REF:rec-01234567-89ab-cdef-0123-456789abcdef].`;
      }

      if (isStreaming) {
        // Return streaming response
        reply.type('text/event-stream');
        reply.header('Cache-Control', 'no-cache');
        reply.header('Connection', 'keep-alive');
        
        const streamer = new MockStreamingResponse(fixture.response);
        
        for await (const chunk of streamer.stream()) {
          reply.raw.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        }
        
        reply.raw.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        reply.raw.end();
        return;
      }

      // Validate response against schema
      const validatedResponse = assistantQueryResponseSchema.parse(fixture);

      request.log.info({ 
        promptLength: validatedBody.prompt.length,
        responseLength: validatedResponse.response.length || 0,
        metricRefs: validatedResponse.references.length || 0,
        isStreaming
      }, 'Assistant query processed (mock)');
      
      return validatedResponse;
    } catch (error) {
      request.log.error({ error }, 'Failed to load assistant fixture');
      reply.status(500);
      throw new Error('Failed to process assistant query');
    }
  }

  // Non-mock implementation would go here
  reply.status(501);
  throw new Error('Non-mock assistant query not implemented');
}