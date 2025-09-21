/**
 * GET /spend handler
 * Returns spending data and projections with optional filtering
 */
import { FastifyRequest, FastifyReply } from 'fastify';
import fs from 'fs/promises';
import path from 'path';
import { spendQuerySchema, SpendQuery, spendResponseSchema } from '../schemas/spend';

const FIXTURES_PATH = path.join(__dirname, '../fixtures');

// Simulate network latency for realistic testing
const simulateLatency = async (): Promise<void> => {
  if (process.env.SIMULATE_LATENCY === '1') {
    const latency = parseInt(process.env.LATENCY_MS || '150', 10);
    await new Promise(resolve => setTimeout(resolve, latency));
  }
};

export async function spendHandler(
  request: FastifyRequest<{ Querystring: SpendQuery }>,
  reply: FastifyReply
) {
  // Validate query parameters
  const validatedQuery = spendQuerySchema.parse(request.query);

  // Simulate network latency
  await simulateLatency();

  // In mock mode, return fixture data
  if (process.env.USE_MOCKS === '1') {
    try {
      const fixtureData = await fs.readFile(
        path.join(FIXTURES_PATH, 'spend.json'), 
        'utf-8'
      );
      const fixture = JSON.parse(fixtureData);
      
      // Update fixture with query parameters
      fixture.timeRange = validatedQuery.timeRange;
      fixture.granularity = validatedQuery.granularity;
      
      // Filter data if service is specified
      if (validatedQuery.service) {
        // In a real implementation, this would filter the series data
        request.log.info({ service: validatedQuery.service }, 'Filtering spend data by service');
      }

      // Validate response against schema
      const validatedResponse = spendResponseSchema.parse(fixture);

      request.log.info({ 
        timeRange: validatedQuery.timeRange,
        granularity: validatedQuery.granularity,
        dataPoints: validatedResponse.series.length
      }, 'Spend data retrieved (mock)');
      
      return validatedResponse;
    } catch (error) {
      request.log.error({ error }, 'Failed to load spend fixture');
      reply.status(500);
      throw new Error('Failed to retrieve spend data');
    }
  }

  // Non-mock implementation would go here
  reply.status(501);
  throw new Error('Non-mock spend data not implemented');
}