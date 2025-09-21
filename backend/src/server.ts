// Basic server setup - will be enhanced in later tasks
import Fastify, { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errors';
import { createLoggingPlugin } from './middleware/logging';

// Import API handlers
import { spendHandler } from './api/spend';
import { projectionHandler } from './api/projection';
import { recommendationsHandler } from './api/recommendations';
import { assistantQueryHandler } from './api/assistant';
import { connectionTestHandler } from './api/connectionTest';
import { tenantSetupHandler } from './api/tenantSetup';
import { perfCollectHandler } from './api/perfCollect';
import { exportHandler } from './api/exportMock';

export const createApp = (): FastifyInstance => {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
    },
  });

  // Register logging middleware
  fastify.register(createLoggingPlugin());

  // Use the proper error handler
  fastify.setErrorHandler(errorHandler);
  fastify.setNotFoundHandler(notFoundHandler);

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
  fastify.get('/spend', spendHandler);
  fastify.get('/projection', projectionHandler);
  fastify.get('/recommendations', recommendationsHandler);
  fastify.post('/assistant/query', assistantQueryHandler);
  fastify.post('/connection/test', connectionTestHandler);
  fastify.post('/tenant/setup', tenantSetupHandler);
  fastify.post('/api/perf/collect', perfCollectHandler);
  fastify.get('/export', exportHandler);

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