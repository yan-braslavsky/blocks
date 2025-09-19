// Basic server setup - will be enhanced in later tasks
import Fastify, { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

// Import API handlers
import { spendHandler } from './api/spend';
import { projectionHandler } from './api/projection';
import { recommendationsHandler } from './api/recommendations';
import { assistantQueryHandler } from './api/assistant';
import { connectionTestHandler } from './api/connectionTest';
import { tenantSetupHandler } from './api/tenantSetup';

export const createApp = (): FastifyInstance => {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
    },
  });

  // Generic error handler
  fastify.setErrorHandler(async (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      reply.status(400).send({
        error: 'validation_failed',
        message: 'Request validation failed',
        details: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      });
      return;
    }

    // Handle other known errors
    if (error.statusCode) {
      reply.status(error.statusCode).send({
        error: error.code || 'unknown_error',
        message: error.message
      });
      return;
    }

    // Handle unexpected errors
    fastify.log.error(error);
    reply.status(500).send({
      error: 'internal_server_error',
      message: 'An internal server error occurred'
    });
  });

  // Health check endpoint
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Root endpoint
  fastify.get('/', async () => {
    return { 
      message: 'Blocks MVP Backend API',
      version: '0.1.0',
      mockMode: process.env.USE_MOCKS === '1'
    };
  });

  // API Routes
  fastify.get('/api/spend', spendHandler);
  fastify.get('/api/projection', projectionHandler);
  fastify.get('/api/recommendations', recommendationsHandler);
  fastify.post('/api/assistant', assistantQueryHandler);
  fastify.post('/api/connection-test', connectionTestHandler);
  fastify.post('/api/tenant-setup', tenantSetupHandler);

  return fastify;
};

const start = async () => {
  try {
    const app = createApp();
    const port = parseInt(process.env.PORT || '3001', 10);
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`Server listening on port ${port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

export { createApp as fastify };
export default start;

// Start server if this file is run directly
if (require.main === module) {
  start();
}