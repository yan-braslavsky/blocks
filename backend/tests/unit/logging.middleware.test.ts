import { describe, it, expect, beforeEach, vi, MockedFunction } from 'vitest';
import { createLoggingMiddleware, withRequestContext } from '../../src/middleware/logging';
import * as logLib from '../../src/lib/log';

// Mock the log function
vi.mock('../src/lib/log', () => ({
  log: vi.fn(),
}));

const mockLog = logLib.log as MockedFunction<typeof logLib.log>;

describe('Logging Middleware', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    req = {
      method: 'GET',
      url: '/api/test',
      path: '/api/test',
      get: vi.fn(),
      query: {},
      body: {},
      ip: '127.0.0.1',
      connection: { remoteAddress: '127.0.0.1' },
    };

    res = {
      setHeader: vi.fn(),
      statusCode: 200,
      end: vi.fn(),
    };

    next = vi.fn();
  });

  describe('Basic functionality', () => {
    it('should generate request ID and set response header', () => {
      const middleware = createLoggingMiddleware();
      middleware(req, res, next);

      expect(req.requestId).toBeDefined();
      expect(typeof req.requestId).toBe('string');
      expect(req.startTime).toBeDefined();
      expect(res.setHeader).toHaveBeenCalledWith('X-Request-ID', req.requestId);
      expect(next).toHaveBeenCalled();
    });

    it('should log incoming request', () => {
      req.get.mockReturnValue('test-user-agent');
      
      const middleware = createLoggingMiddleware();
      middleware(req, res, next);

      expect(mockLog).toHaveBeenCalledWith('info', 'Request received', expect.objectContaining({
        requestId: expect.any(String),
        method: 'GET',
        url: '/api/test',
        userAgent: 'test-user-agent',
        ip: '127.0.0.1',
      }));
    });

    it('should log response completion', () => {
      const middleware = createLoggingMiddleware();
      middleware(req, res, next);

      // Simulate response end
      res.end();

      expect(mockLog).toHaveBeenCalledWith('info', 'Request completed', expect.objectContaining({
        requestId: req.requestId,
        statusCode: 200,
        duration: expect.any(Number),
      }));
    });
  });

  describe('Tenant ID extraction', () => {
    it('should extract tenant ID from header', () => {
      req.get.mockImplementation((header: string) => {
        if (header === 'X-Tenant-ID') return 'tenant-123';
        if (header === 'User-Agent') return 'test-agent';
        return undefined;
      });

      const middleware = createLoggingMiddleware();
      middleware(req, res, next);

      expect(req.tenantId).toBe('tenant-123');
      expect(mockLog).toHaveBeenCalledWith('info', 'Request received', expect.objectContaining({
        tenantId: 'tenant-123',
      }));
    });

    it('should extract tenant ID from query parameter', () => {
      req.query.tenantId = 'tenant-456';
      req.get.mockReturnValue(undefined);

      const middleware = createLoggingMiddleware();
      middleware(req, res, next);

      expect(req.tenantId).toBe('tenant-456');
    });

    it('should extract tenant ID from body', () => {
      req.body.tenantId = 'tenant-789';
      req.get.mockReturnValue(undefined);

      const middleware = createLoggingMiddleware();
      middleware(req, res, next);

      expect(req.tenantId).toBe('tenant-789');
    });

    it('should prioritize header over query and body', () => {
      req.get.mockImplementation((header: string) => {
        if (header === 'X-Tenant-ID') return 'tenant-header';
        return undefined;
      });
      req.query.tenantId = 'tenant-query';
      req.body.tenantId = 'tenant-body';

      const middleware = createLoggingMiddleware();
      middleware(req, res, next);

      expect(req.tenantId).toBe('tenant-header');
    });
  });

  describe('Configuration options', () => {
    it('should skip excluded paths', () => {
      req.path = '/health';
      
      const middleware = createLoggingMiddleware({ excludePaths: ['/health'] });
      middleware(req, res, next);

      expect(mockLog).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('should include request body when configured', () => {
      req.body = { test: 'data' };
      
      const middleware = createLoggingMiddleware({ includeBody: true });
      middleware(req, res, next);

      expect(mockLog).toHaveBeenCalledWith('info', 'Request received', expect.objectContaining({
        body: { test: 'data' },
      }));
    });

    it('should truncate large request bodies', () => {
      req.body = { data: 'x'.repeat(2000) }; // Large body
      
      const middleware = createLoggingMiddleware({ includeBody: true, maxBodySize: 100 });
      middleware(req, res, next);

      expect(mockLog).toHaveBeenCalledWith('info', 'Request received', expect.objectContaining({
        bodySize: expect.any(Number),
        bodyTruncated: true,
      }));
    });
  });

  describe('Response status logging', () => {
    it('should log client errors as warnings', () => {
      res.statusCode = 400;
      
      const middleware = createLoggingMiddleware();
      middleware(req, res, next);
      res.end();

      expect(mockLog).toHaveBeenCalledWith('warn', 'Request completed', expect.objectContaining({
        statusCode: 400,
      }));
    });

    it('should log server errors as errors', () => {
      res.statusCode = 500;
      
      const middleware = createLoggingMiddleware();
      middleware(req, res, next);
      res.end();

      expect(mockLog).toHaveBeenCalledWith('error', 'Request completed', expect.objectContaining({
        statusCode: 500,
      }));
    });
  });

  describe('withRequestContext helper', () => {
    it('should extract request context', () => {
      req.requestId = 'test-request-id';
      req.tenantId = 'test-tenant-id';

      const context = withRequestContext(req);

      expect(context).toEqual({
        requestId: 'test-request-id',
        tenantId: 'test-tenant-id',
      });
    });

    it('should handle missing tenantId', () => {
      req.requestId = 'test-request-id';

      const context = withRequestContext(req);

      expect(context).toEqual({
        requestId: 'test-request-id',
        tenantId: undefined,
      });
    });
  });
});