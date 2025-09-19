// Basic server setup - will be enhanced in later tasks
import Fastify, { FastifyInstance } from 'fastify';

export const createApp = (): FastifyInstance => {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
    },
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