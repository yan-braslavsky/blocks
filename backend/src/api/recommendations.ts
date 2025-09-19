/**
 * GET /recommendations handler
 * Returns cost optimization recommendations with optional filtering
 */
import { FastifyRequest, FastifyReply } from 'fastify';
import fs from 'fs/promises';
import path from 'path';
import { recommendationsQuerySchema, RecommendationsQuery, recommendationsResponseSchema } from '../schemas/recommendations';

const FIXTURES_PATH = path.join(__dirname, '../fixtures');

export async function recommendationsHandler(
  request: FastifyRequest<{ Querystring: RecommendationsQuery }>,
  reply: FastifyReply
) {
  // Validate query parameters
  const validatedQuery = recommendationsQuerySchema.parse(request.query);

  // In mock mode, return fixture data
  if (process.env.USE_MOCKS === '1') {
    try {
      const fixtureData = await fs.readFile(
        path.join(FIXTURES_PATH, 'recommendations.json'), 
        'utf-8'
      );
      const fixture = JSON.parse(fixtureData);
      
      // Filter by status if specified
      if (validatedQuery.status) {
        fixture.items = fixture.items.filter((item: any) => item.status === validatedQuery.status);
      }

      // Filter by category if specified
      if (validatedQuery.category) {
        fixture.items = fixture.items.filter((item: any) => item.category === validatedQuery.category);
      }

      // Validate response against schema
      const validatedResponse = recommendationsResponseSchema.parse(fixture);

      request.log.info({ 
        totalItems: validatedResponse.items.length,
        statusFilter: validatedQuery.status,
        categoryFilter: validatedQuery.category
      }, 'Recommendations retrieved (mock)');
      
      return validatedResponse;
    } catch (error) {
      request.log.error({ error }, 'Failed to load recommendations fixture');
      reply.status(500);
      throw new Error('Failed to retrieve recommendations');
    }
  }

  // Non-mock implementation would go here
  reply.status(501);
  throw new Error('Non-mock recommendations not implemented');
}