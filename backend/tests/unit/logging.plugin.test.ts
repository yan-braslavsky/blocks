import { describe, it, expect, beforeEach, vi, MockedFunction } from 'vitest';
import { createLoggingPlugin, withRequestContext } from '../../src/middleware/logging';
import * as logLib from '../../src/lib/log';

// Mock the log function
vi.mock('../../src/lib/log', () => ({
  log: vi.fn(),
}));

const mockLog = logLib.log as MockedFunction<typeof logLib.log>;

describe('Logging Plugin (Fastify)', () => {
  let request: any;
  let reply: any;
  let fastify: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    request = {
      method: 'GET',
      url: '/api/test',
      headers: {},
      query: {},
      body: {},
      ip: '127.0.0.1',
    };

    reply = {
      header: vi.fn(),
      statusCode: 200,
    };

    fastify = {
      addHook: vi.fn(),
    };
  });

  describe('Basic functionality', () => {
    it('should register hooks with fastify', async () => {
      const plugin = createLoggingPlugin();
      await plugin(fastify);

      expect(fastify.addHook).toHaveBeenCalledWith('onRequest', expect.any(Function));
      expect(fastify.addHook).toHaveBeenCalledWith('onSend', expect.any(Function));
    });

    it('should generate request ID and set response header', async () => {
      const plugin = createLoggingPlugin();
      await plugin(fastify);

      // Get the onRequest hook function
      const onRequestHook = fastify.addHook.mock.calls.find((call: any[]) => call[0] === 'onRequest')[1];
      
      await onRequestHook(request, reply);

      expect(request.requestId).toBeDefined();
      expect(typeof request.requestId).toBe('string');
      expect(request.startTime).toBeDefined();
      expect(reply.header).toHaveBeenCalledWith('X-Request-ID', request.requestId);
    });

    it('should log incoming request', async () => {
      request.headers['user-agent'] = 'test-user-agent';
      
      const plugin = createLoggingPlugin();
      await plugin(fastify);

      // Get the onRequest hook function
      const onRequestHook = fastify.addHook.mock.calls.find((call: any[]) => call[0] === 'onRequest')[1];
      
      await onRequestHook(request, reply);

      expect(mockLog).toHaveBeenCalledWith('info', 'Request received', expect.objectContaining({
        requestId: expect.any(String),
        method: 'GET',
        url: '/api/test',
        userAgent: 'test-user-agent',
        ip: '127.0.0.1',
      }));
    });
  });

  describe('withRequestContext helper', () => {
    it('should extract request context', () => {
      request.requestId = 'test-request-id';
      request.tenantId = 'test-tenant-id';

      const context = withRequestContext(request);

      expect(context).toEqual({
        requestId: 'test-request-id',
        tenantId: 'test-tenant-id',
      });
    });

    it('should handle missing tenantId', () => {
      request.requestId = 'test-request-id';

      const context = withRequestContext(request);

      expect(context).toEqual({
        requestId: 'test-request-id',
        tenantId: undefined,
      });
    });
  });
});