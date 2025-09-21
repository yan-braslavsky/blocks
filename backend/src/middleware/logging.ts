import { randomUUID } from 'crypto';
import { FastifyRequest, FastifyReply } from 'fastify';
import { log } from '../lib/log';

// Extend Fastify Request type to include our logging properties
declare module 'fastify' {
  interface FastifyRequest {
    requestId: string;
    tenantId?: string;
    startTime: number;
  }
}

interface LoggingOptions {
  includeBody?: boolean;
  excludePaths?: string[];
  maxBodySize?: number;
}

const DEFAULT_OPTIONS: LoggingOptions = {
  includeBody: false,
  excludePaths: ['/health', '/ping'],
  maxBodySize: 1024, // 1KB max body logging
};

export function createLoggingPlugin(options: LoggingOptions = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };

  return async function loggingPlugin(fastify: any) {
    fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
      // Skip logging for excluded paths
      if (config.excludePaths?.includes(request.url)) {
        return;
      }

      // Generate unique request ID
      request.requestId = randomUUID();
      request.startTime = Date.now();

      // Extract tenant ID from various possible sources
      const extractedTenantId = extractTenantId(request);
      if (extractedTenantId) {
        request.tenantId = extractedTenantId;
      }

      // Add request ID to response headers for debugging
      reply.header('X-Request-ID', request.requestId);

      // Log incoming request
      const requestMeta: any = {
        requestId: request.requestId,
        method: request.method,
        url: request.url,
        userAgent: request.headers['user-agent'],
        ip: request.ip,
      };

      if (request.tenantId) {
        requestMeta.tenantId = request.tenantId;
      }

      if (config.includeBody && request.body) {
        const bodyStr = JSON.stringify(request.body);
        if (bodyStr.length <= (config.maxBodySize || 1024)) {
          requestMeta.body = request.body;
        } else {
          requestMeta.bodySize = bodyStr.length;
          requestMeta.bodyTruncated = true;
        }
      }

      log('info', 'Request received', requestMeta);
    });

    fastify.addHook('onSend', async (request: FastifyRequest, reply: FastifyReply) => {
      const duration = Date.now() - request.startTime;
      
      const responseMeta: any = {
        requestId: request.requestId,
        statusCode: reply.statusCode,
        duration,
      };

      if (request.tenantId) {
        responseMeta.tenantId = request.tenantId;
      }

      // Determine log level based on status code
      let level: 'info' | 'warn' | 'error' = 'info';
      if (reply.statusCode >= 400 && reply.statusCode < 500) {
        level = 'warn';
      } else if (reply.statusCode >= 500) {
        level = 'error';
      }

      log(level, 'Request completed', responseMeta);
    });
  };
}

/**
 * Extract tenant ID from various request sources
 */
function extractTenantId(request: FastifyRequest): string | undefined {
  // Try header first (for API calls)
  const headerTenantId = request.headers['x-tenant-id'] as string;
  if (headerTenantId) {
    return headerTenantId;
  }

  // Try query parameter
  const query = request.query as any;
  if (query?.tenantId) {
    return query.tenantId;
  }

  // Try body (for POST/PUT requests)
  const body = request.body as any;
  if (body && body.tenantId) {
    return body.tenantId;
  }

  // Try to extract from JWT token if present
  const authHeader = request.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      // In a real implementation, this would decode and validate the JWT
      // For now, we'll just return undefined as we don't have JWT implementation
      // const token = authHeader.substring(7);
      // const decoded = jwt.decode(token);
      // return decoded?.tenantId;
    } catch (error) {
      // Invalid token, ignore
    }
  }

  return undefined;
}

/**
 * Helper to get request context for logging
 * Use this in handlers that need to log with request context
 */
export function withRequestContext(request: FastifyRequest) {
  return {
    requestId: request.requestId,
    tenantId: request.tenantId,
  };
}

export default createLoggingPlugin;