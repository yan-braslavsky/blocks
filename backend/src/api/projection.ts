/**
 * GET /projection handler
 * Returns savings projections for specified period
 */
import { FastifyRequest, FastifyReply } from 'fastify';
import fs from 'fs/promises';
import path from 'path';
import { projectionQuerySchema, ProjectionQuery, projectionResponseSchema } from '../schemas/projection';

const FIXTURES_PATH = path.join(__dirname, '../fixtures');

export async function projectionHandler(
  request: FastifyRequest<{ Querystring: ProjectionQuery }>,
  reply: FastifyReply
) {
  // Validate query parameters
  const validatedQuery = projectionQuerySchema.parse(request.query);

  // In mock mode, return fixture data
  if (process.env.USE_MOCKS === '1') {
    try {
      const fixtureData = await fs.readFile(
        path.join(FIXTURES_PATH, 'projection.json'), 
        'utf-8'
      );
      const fixture = JSON.parse(fixtureData);
      
      // Update fixture with query parameters
      fixture.period = validatedQuery.period;
      fixture.generatedAt = new Date().toISOString();

      // Validate response against schema
      const validatedResponse = projectionResponseSchema.parse(fixture);

      request.log.info({ 
        period: validatedQuery.period,
        baseline: validatedResponse.baselineMinor,
        projected: validatedResponse.projectedMinor,
        savings: validatedResponse.deltaPct
      }, 'Projection data retrieved (mock)');
      
      return validatedResponse;
    } catch (error) {
      request.log.error({ error }, 'Failed to load projection fixture');
      reply.status(500);
      throw new Error('Failed to retrieve projection data');
    }
  }

  // Non-mock implementation would go here
  reply.status(501);
  throw new Error('Non-mock projection data not implemented');
}